import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { mockProducts, mockReservations, mockStores } from '../data/mockData'
import { isPickupWindowExpired } from '../lib/format'
import { supabase } from '../lib/supabase'
import { playNotificationChime } from '../lib/sound'
import {
  createOrderAndPay,
  ensureAnonymousSession,
  fetchProducts,
  fetchReservations,
  fetchStores,
  insertProduct,
  mapOrder,
  mapProduct,
  mapStore,
  updateProductDetails,
  updateProductStatus,
  updateProductQuantity,
  updateReservationStatus,
  updateStoreSettingsRow,
  type OrderRow,
  type ProductRow,
  type StoreRow,
} from '../lib/supabaseApi'
import type { AppNotification, NotificationAudience, NotificationType, Product, Reservation, StoreInfo } from '../lib/types'

export type ScanResult =
  | { ok: true }
  | { ok: false; reason: 'already_used' | 'cancelled' | 'not_found' }

interface NewProductInput {
  storeId: string
  title: string
  description: string
  image: string
  normalPrice: number
  rescuePrice: number
  quantityTotal: number
  pickupStart: string
  pickupEnd: string
}

interface DataContextValue {
  stores: StoreInfo[]
  products: Product[]
  reservations: Reservation[]
  favoriteIds: string[]
  isSynced: boolean
  getStoreById: (storeId: string) => StoreInfo | undefined
  getProductById: (productId: string) => Product | undefined
  getProductsByStore: (storeId: string) => Product[]
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
  createReservation: (productId: string, quantity: number, stripePaymentId?: string) => Reservation
  markPickedUp: (reservationId: string) => ScanResult
  cancelReservation: (reservationId: string) => void
  addProduct: (input: NewProductInput) => void
  updateProduct: (productId: string, fields: Partial<{ title: string; normalPrice: number; rescuePrice: number }>) => void
  updateStock: (productId: string, newStock: number) => void
  endProduct: (productId: string) => void
  updateStoreSettings: (storeId: string, settings: Partial<{ openTime: string; closeTime: string; isPaused: boolean }>) => void
  notifications: AppNotification[]
  toasts: AppNotification[]
  dismissToast: (notificationId: string) => void
  markNotificationsRead: (audience: NotificationAudience) => void
  simulatePickupReminder: (reservationId: string) => void
  toggleStoreStatus: (storeId: string) => void
  createSystemAnnouncement: (message: string, target?: NotificationAudience | 'all') => void
  createCouponBroadcast: (code: string, message: string) => void
}

const DataContext = createContext<DataContextValue | null>(null)

function generatePickupCode() {
  const random = Math.floor(1000 + Math.random() * 9000)
  return `FR-${random}`
}

export function DataProvider({ children }: { children: ReactNode }) {
  // Mock data renders instantly; it's transparently replaced by live Supabase
  // rows once the initial fetch resolves (and silently kept as a fallback if
  // Supabase is unreachable or the migration hasn't been run yet).
  const [stores, setStores] = useState<StoreInfo[]>(mockStores)
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['product-1', 'product-3', 'product-4'])
  const [isSynced, setIsSynced] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [toasts, setToasts] = useState<AppNotification[]>([])

  const userIdRef = useRef<string | null>(null)
  const remindedReservationIdsRef = useRef<Set<string>>(new Set())

  const pushNotification = useCallback(
    (audience: NotificationAudience, type: NotificationType, message: string) => {
      const notification: AppNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        audience,
        message,
        createdAt: new Date().toISOString(),
        read: false,
      }
      setNotifications((current) => [notification, ...current].slice(0, 50))
      setToasts((current) => [...current, notification])
      playNotificationChime()
    },
    [],
  )

  const dismissToast = useCallback((notificationId: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== notificationId))
  }, [])

  const markNotificationsRead = useCallback((audience: NotificationAudience) => {
    setNotifications((current) =>
      current.map((notification) => (notification.audience === audience ? { ...notification, read: true } : notification)),
    )
  }, [])

  useEffect(() => {
    let cancelled = false

    async function syncReservations() {
      try {
        const liveReservations = await fetchReservations()
        if (!cancelled) setReservations(liveReservations)
      } catch (error) {
        console.warn('[supabase] orders の再取得に失敗しました', error)
      }
    }

    async function bootstrap() {
      userIdRef.current = await ensureAnonymousSession()

      try {
        const [liveStores, liveProducts, liveReservations] = await Promise.all([
          fetchStores(),
          fetchProducts(),
          fetchReservations(),
        ])
        if (cancelled) return
        if (liveStores.length > 0) setStores(liveStores)
        if (liveProducts.length > 0) setProducts(liveProducts)
        setReservations(liveReservations)
        setIsSynced(true)
      } catch (error) {
        console.warn(
          '[supabase] テーブルの取得に失敗したため、モックデータで継続します。supabase/migrations/0002_extend_existing_schema.sql を実行してください。',
          error,
        )
      }
    }

    void bootstrap()

    // Supabase Realtime: any change made by this or another tab/device
    // (or directly in the dashboard) is merged into local state live, over
    // the same WebSocket connection — no polling, no full page reload.
    const channel = supabase
      .channel('food-rescue-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stores' }, (payload) => {
        if (payload.eventType === 'DELETE') return
        const store = mapStore(payload.new as StoreRow)
        setStores((current) =>
          current.some((item) => item.id === store.id)
            ? current.map((item) => (item.id === store.id ? store : item))
            : [store, ...current],
        )
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        if (payload.eventType === 'DELETE') return
        const product = mapProduct(payload.new as ProductRow)
        setProducts((current) =>
          current.some((item) => item.id === product.id)
            ? current.map((item) => (item.id === product.id ? product : item))
            : [product, ...current],
        )
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'DELETE') return
        const reservation = mapOrder(payload.new as OrderRow)
        setReservations((current) =>
          current.some((item) => item.id === reservation.id)
            ? current.map((item) => (item.id === reservation.id ? reservation : item))
            : [reservation, ...current],
        )
      })
      // payments/tickets don't have their own slice in this context (their
      // settled state is folded into orders.status), but a change made only
      // to one of them — e.g. directly in the dashboard — should still be
      // reflected, so fall back to a light refetch of orders for those.
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => void syncReservations())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => void syncReservations())
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [])

  // 受取30分前リマインド: polls confirmed reservations against their pickup
  // window and fires once per reservation when it crosses the 30-min mark.
  const reservationsRef = useRef(reservations)
  const productsRef = useRef(products)
  useEffect(() => {
    reservationsRef.current = reservations
  }, [reservations])
  useEffect(() => {
    productsRef.current = products
  }, [products])

  useEffect(() => {
    const checkReminders = () => {
      for (const reservation of reservationsRef.current) {
        if (reservation.status !== 'confirmed') continue
        if (remindedReservationIdsRef.current.has(reservation.id)) continue
        if (isPickupWindowExpired(reservation.pickupEnd)) continue

        const [hours, minutes] = reservation.pickupEnd.split(':').map(Number)
        if (Number.isNaN(hours) || Number.isNaN(minutes)) continue
        const deadline = new Date()
        deadline.setHours(hours, minutes, 0, 0)
        const minutesLeft = (deadline.getTime() - Date.now()) / 60000

        if (minutesLeft > 0 && minutesLeft <= 30) {
          remindedReservationIdsRef.current.add(reservation.id)
          const product = productsRef.current.find((item) => item.id === reservation.productId)
          pushNotification(
            'user',
            'pickup_reminder',
            `⚠️ レスキュー受取時間の30分前です！お忘れなく！${product ? `（${product.title}）` : ''}`,
          )
        }
      }
    }
    const interval = window.setInterval(checkReminders, 30_000)
    return () => window.clearInterval(interval)
  }, [pushNotification])

  const getStoreById = (storeId: string) => stores.find((store) => store.id === storeId)
  const getProductById = (productId: string) => products.find((product) => product.id === productId)
  const getProductsByStore = (storeId: string) => products.filter((product) => product.storeId === storeId)

  const isFavorite = (productId: string) => favoriteIds.includes(productId)

  const toggleFavorite = (productId: string) => {
    setFavoriteIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    )
  }

  const createReservation = (productId: string, quantity: number, stripePaymentId?: string) => {
    const product = getProductById(productId)
    if (!product) {
      throw new Error('対象の商品が見つかりませんでした')
    }

    const reservation: Reservation = {
      id: `reservation-${Date.now()}`,
      productId: product.id,
      storeId: product.storeId,
      quantity,
      status: 'confirmed',
      pickupCode: generatePickupCode(),
      pickupStart: product.pickupStart,
      pickupEnd: product.pickupEnd,
      createdAt: new Date().toISOString(),
    }

    const nextQuantityLeft = Math.max(0, product.quantityLeft - quantity)
    const nextStatus = nextQuantityLeft <= 0 ? 'soldout' : product.status

    setReservations((current) => [reservation, ...current])
    setProducts((current) =>
      current.map((item) =>
        item.id === productId
          ? { ...item, quantityLeft: nextQuantityLeft, status: nextStatus }
          : item,
      ),
    )

    const amount = product.rescuePrice * quantity
    void createOrderAndPay(reservation, amount, userIdRef.current, stripePaymentId).catch((error) =>
      console.warn('[supabase] 予約の保存に失敗しました（ローカルでは反映済み）', error),
    )
    void updateProductStatus(productId, nextStatus, nextQuantityLeft).catch((error) =>
      console.warn('[supabase] 商品の残数更新に失敗しました（ローカルでは反映済み）', error),
    )

    pushNotification('store', 'reservation', `🔥 新しいレスキュー予約が入りました！（注文ID: ${reservation.id}）`)
    if (nextStatus === 'soldout' && product.status !== 'soldout') {
      pushNotification('store', 'soldout', `🎉 ${product.title}が完売（レスキュー完了）しました！`)
    }

    return reservation
  }

  // The single choke point every "QR scan" path (store dashboard scan modal,
  // the customer-facing scan demo button) goes through, so double-redemption
  // and cancelled-order checks only need to live in one place.
  const markPickedUp = (reservationId: string): ScanResult => {
    const reservation = reservations.find((item) => item.id === reservationId)
    if (!reservation) return { ok: false, reason: 'not_found' }
    if (reservation.status === 'picked_up') return { ok: false, reason: 'already_used' }
    if (reservation.status === 'cancelled') return { ok: false, reason: 'cancelled' }

    const pickedUpAt = new Date().toISOString()
    setReservations((current) => [
      { ...reservation, status: 'picked_up', pickedUpAt },
      ...current.filter((item) => item.id !== reservationId),
    ])
    void updateReservationStatus(reservationId, 'picked_up').catch((error) =>
      console.warn('[supabase] 受取済み更新の保存に失敗しました（ローカルでは反映済み）', error),
    )
    pushNotification('user', 'pickup_complete', '💚 レスキュー完了！食品ロス削減へのご協力ありがとうございました！')
    return { ok: true }
  }

  const cancelReservation = (reservationId: string) => {
    const reservation = reservations.find((item) => item.id === reservationId)
    const product = reservation ? getProductById(reservation.productId) : undefined

    setReservations((current) =>
      current.map((item) =>
        item.id === reservationId ? { ...item, status: 'cancelled' } : item,
      ),
    )

    // Cancelling a still-open reservation returns its quantity to stock
    // (a product the store has separately ended stays ended).
    if (reservation && product && product.status !== 'ended') {
      const restoredQuantityLeft = product.quantityLeft + reservation.quantity
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, quantityLeft: restoredQuantityLeft, status: 'active' } : item,
        ),
      )
      void updateProductQuantity(product.id, restoredQuantityLeft, 'active').catch((error) =>
        console.warn('[supabase] 在庫の復元に失敗しました（ローカルでは反映済み）', error),
      )
    }

    void updateReservationStatus(reservationId, 'cancelled').catch((error) =>
      console.warn('[supabase] キャンセルの保存に失敗しました（ローカルでは反映済み）', error),
    )

    if (reservation) {
      pushNotification('store', 'cancellation', '⚠️ 予約がキャンセルされました（在庫は自動復元されました）')
    }
  }

  const addProduct = (input: NewProductInput) => {
    const product: Product = {
      id: `product-${Date.now()}`,
      storeId: input.storeId,
      title: input.title,
      description: input.description,
      image: input.image,
      normalPrice: input.normalPrice,
      rescuePrice: input.rescuePrice,
      quantityTotal: input.quantityTotal,
      quantityLeft: input.quantityTotal,
      pickupStart: input.pickupStart,
      pickupEnd: input.pickupEnd,
      status: 'active',
    }
    setProducts((current) => [product, ...current])
    void insertProduct(product).catch((error) =>
      console.warn('[supabase] 商品の登録に失敗しました（ローカルでは反映済み）', error),
    )

    const storeName = getStoreById(input.storeId)?.name ?? ''
    pushNotification('user', 'new_product', `${storeName}が${input.title}をレスキュー出品しました！`)
  }

  const updateProduct = (
    productId: string,
    fields: Partial<{ title: string; normalPrice: number; rescuePrice: number }>,
  ) => {
    setProducts((current) =>
      current.map((product) => (product.id === productId ? { ...product, ...fields } : product)),
    )
    void updateProductDetails(productId, fields).catch((error) =>
      console.warn('[supabase] 商品情報の更新に失敗しました（ローカルでは反映済み）', error),
    )
  }

  const updateStock = (productId: string, newStock: number) => {
    const product = getProductById(productId)
    if (!product) return

    const nextQuantityLeft = Math.max(0, newStock)
    const nextStatus = nextQuantityLeft <= 0 ? 'soldout' : product.status === 'ended' ? 'ended' : 'active'

    setProducts((current) =>
      current.map((item) =>
        item.id === productId ? { ...item, quantityLeft: nextQuantityLeft, status: nextStatus } : item,
      ),
    )
    void updateProductQuantity(productId, nextQuantityLeft, nextStatus).catch((error) =>
      console.warn('[supabase] 在庫数の更新に失敗しました（ローカルでは反映済み）', error),
    )

    if (nextStatus === 'soldout' && product.status !== 'soldout') {
      pushNotification('store', 'soldout', `🎉 ${product.title}が完売（レスキュー完了）しました！`)
    }
  }

  const updateStoreSettings = (
    storeId: string,
    settings: Partial<{ openTime: string; closeTime: string; isPaused: boolean }>,
  ) => {
    setStores((current) =>
      current.map((store) => (store.id === storeId ? { ...store, ...settings } : store)),
    )
    void updateStoreSettingsRow(storeId, settings).catch((error) =>
      console.warn('[supabase] 店舗設定の更新に失敗しました（ローカルでは反映済み）', error),
    )
  }

  // Admin "承認(Active) / 停止(Suspended)" control. There's no separate
  // approval column in the schema — a suspended store is simply paused
  // (same is_paused flag the store's own settings page can also flip),
  // which already hides it from customer-facing screens.
  const toggleStoreStatus = (storeId: string) => {
    const store = getStoreById(storeId)
    if (!store) return
    updateStoreSettings(storeId, { isPaused: !store.isPaused })
  }

  const createSystemAnnouncement = (message: string, target: NotificationAudience | 'all' = 'all') => {
    if (target === 'all') {
      pushNotification('user', 'announcement', message)
      pushNotification('store', 'announcement', message)
    } else {
      pushNotification(target, 'announcement', message)
    }
  }

  // Foundation for a future coupon-redemption system: broadcasts the coupon
  // code to all users as a notification/toast. No coupons table exists yet,
  // so redemption itself isn't tracked — this only wires up the distribution
  // half of the flow.
  const createCouponBroadcast = (code: string, message: string) => {
    pushNotification('user', 'coupon', `🎁 ${message}（クーポンコード: ${code}）`)
  }

  const simulatePickupReminder = (reservationId: string) => {
    const reservation = reservations.find((item) => item.id === reservationId)
    if (!reservation) return
    const product = getProductById(reservation.productId)
    pushNotification(
      'user',
      'pickup_reminder',
      `⚠️ レスキュー受取時間の30分前です！お忘れなく！${product ? `（${product.title}）` : ''}`,
    )
  }

  const endProduct = (productId: string) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, status: 'ended', quantityLeft: 0 } : product,
      ),
    )
    void updateProductStatus(productId, 'ended', 0).catch((error) =>
      console.warn('[supabase] 出品終了の保存に失敗しました（ローカルでは反映済み）', error),
    )
  }

  const value = useMemo<DataContextValue>(
    () => ({
      stores,
      products,
      reservations,
      favoriteIds,
      isSynced,
      getStoreById,
      getProductById,
      getProductsByStore,
      toggleFavorite,
      isFavorite,
      createReservation,
      markPickedUp,
      cancelReservation,
      addProduct,
      updateProduct,
      updateStock,
      endProduct,
      updateStoreSettings,
      notifications,
      toasts,
      dismissToast,
      markNotificationsRead,
      simulatePickupReminder,
      toggleStoreStatus,
      createSystemAnnouncement,
      createCouponBroadcast,
    }),
    [stores, products, reservations, favoriteIds, isSynced, notifications, toasts, dismissToast, markNotificationsRead],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData は DataProvider の内部で使用してください')
  }
  return context
}
