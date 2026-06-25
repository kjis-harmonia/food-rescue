import { supabase } from './supabase'
import type { Product, ProductStatus, Reservation, ReservationStatus, StoreInfo } from './types'

// ───────────────────────────────────────────────────────────────────────────
// The live Supabase project ships with a minimal baseline schema:
//   stores(id, name, updated_at)
//   products(id, store_id, name, image, price, stock, updated_at)
//   orders(id, product_id, store_id, status, created_at)
//   payments(id, order_id, amount, status)
//   tickets(id, order_id, status)
//
// supabase/migrations/0002_extend_existing_schema.sql additively extends
// these with the columns the UI needs (description, category, pickup
// windows, etc.). Reads use `select=*` so they never break regardless of
// whether that migration has run yet — missing fields are filled with
// sensible defaults below. Writes try the full payload first and fall back
// to the baseline columns only if Postgres reports the extra columns don't
// exist yet (PGRST204).
// ───────────────────────────────────────────────────────────────────────────

export type StoreRow = {
  id: string
  name: string
  category?: StoreInfo['category']
  address?: string
  description?: string
  image?: string
  distance_km?: number
  rating?: number
  open_time?: string
  close_time?: string
  is_paused?: boolean
}

export type ProductRow = {
  id: string
  store_id: string
  name: string
  image: string
  price: number
  stock: number
  description?: string
  normal_price?: number
  quantity_total?: number
  pickup_start?: string
  pickup_end?: string
  status?: ProductStatus
  surprise_bag?: boolean
  surprise_hint?: string | null
}

export type OrderRow = {
  id: string
  product_id: string
  store_id: string
  status: string
  created_at: string
  quantity?: number
  pickup_code?: string
  pickup_start?: string
  pickup_end?: string
}

const DEFAULT_STORE_IMAGE =
  'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=800&q=80'
const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=1000&q=80'

export function mapStore(row: StoreRow): StoreInfo {
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? 'deli',
    address: row.address ?? '',
    description: row.description ?? '',
    image: row.image || DEFAULT_STORE_IMAGE,
    distanceKm: row.distance_km != null ? Number(row.distance_km) : 1.0,
    rating: row.rating != null ? Number(row.rating) : 4.5,
    openTime: row.open_time ?? '09:00',
    closeTime: row.close_time ?? '21:00',
    isPaused: row.is_paused ?? false,
  }
}

export function mapProduct(row: ProductRow): Product {
  const quantityLeft = row.stock ?? 0
  const status: ProductStatus = row.status ?? (quantityLeft > 0 ? 'active' : 'soldout')
  return {
    id: row.id,
    storeId: row.store_id,
    title: row.name,
    description: row.description ?? '',
    image: row.image || DEFAULT_PRODUCT_IMAGE,
    normalPrice: row.normal_price ?? Math.round((row.price ?? 0) * 2.2),
    rescuePrice: row.price,
    quantityTotal: row.quantity_total ?? quantityLeft,
    quantityLeft,
    pickupStart: row.pickup_start ?? '18:00',
    pickupEnd: row.pickup_end ?? '20:00',
    status,
    surpriseBag: row.surprise_bag ?? false,
    surpriseHint: row.surprise_hint ?? undefined,
  }
}

export function mapOrder(row: OrderRow): Reservation {
  return {
    id: row.id,
    productId: row.product_id,
    storeId: row.store_id,
    quantity: row.quantity ?? 1,
    status: (row.status as ReservationStatus) ?? 'confirmed',
    pickupCode: row.pickup_code ?? row.id,
    pickupStart: row.pickup_start ?? '',
    pickupEnd: row.pickup_end ?? '',
    createdAt: row.created_at,
  }
}

export async function fetchStores(): Promise<StoreInfo[]> {
  const { data, error } = await supabase.from('stores').select('*')
  if (error) throw error
  return (data as StoreRow[]).map(mapStore)
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*')
  if (error) throw error
  return (data as ProductRow[]).map(mapProduct)
}

export async function fetchReservations(): Promise<Reservation[]> {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data as OrderRow[]).map(mapOrder)
}

export async function ensureAnonymousSession(): Promise<string | null> {
  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData.session) return sessionData.session.user.id

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) {
    console.warn(
      '[supabase] 匿名ログインに失敗しました。Authentication › Providers › Anonymous Sign-Ins を有効にしてください。',
      error.message,
    )
    return null
  }
  return data.user?.id ?? null
}

/** Inserts `richPayload`; if the table doesn't have those extra columns yet
 *  (migration 0002 not run), retries with just `minimalPayload`. */
async function insertWithFallback(
  table: string,
  richPayload: Record<string, unknown>,
  minimalPayload: Record<string, unknown>,
) {
  const { error } = await supabase.from(table).insert(richPayload)
  if (!error) return
  if (error.code === 'PGRST204') {
    const { error: fallbackError } = await supabase.from(table).insert(minimalPayload)
    if (fallbackError) throw fallbackError
    return
  }
  throw error
}

async function updateWithFallback(
  table: string,
  id: string,
  richPayload: Record<string, unknown>,
  minimalPayload: Record<string, unknown>,
) {
  const { error } = await supabase.from(table).update(richPayload).eq('id', id)
  if (!error) return
  if (error.code === 'PGRST204') {
    const { error: fallbackError } = await supabase.from(table).update(minimalPayload).eq('id', id)
    if (fallbackError) throw fallbackError
    return
  }
  throw error
}

/**
 * Mirrors the "FLOW 1" ユーザー予約・決済 pattern: insert orders/payments/tickets
 * as pending/invalid first, simulate the payment round-trip, then flip all
 * three to their settled state. The UI already shows the reservation as
 * confirmed optimistically (see DataContext.createReservation), so this
 * staged write happens silently in the background.
 */
export async function createOrderAndPay(
  reservation: Reservation,
  amount: number,
  userId: string | null,
  stripePaymentId?: string,
) {
  const orderBase = {
    id: reservation.id,
    product_id: reservation.productId,
    store_id: reservation.storeId,
    status: 'pending',
    created_at: reservation.createdAt,
  }
  const paymentId = `payment-${reservation.id}`
  const ticketId = `ticket-${reservation.id}`

  await Promise.all([
    insertWithFallback(
      'orders',
      {
        ...orderBase,
        user_id: userId,
        quantity: reservation.quantity,
        pickup_code: reservation.pickupCode,
        pickup_start: reservation.pickupStart,
        pickup_end: reservation.pickupEnd,
      },
      orderBase,
    ),
    insertWithFallback(
      'payments',
      { id: paymentId, order_id: reservation.id, amount, status: 'pending', method: 'card', currency: 'jpy' },
      { id: paymentId, order_id: reservation.id, amount, status: 'pending' },
    ),
    insertWithFallback(
      'tickets',
      { id: ticketId, order_id: reservation.id, status: 'invalid', code: reservation.pickupCode },
      { id: ticketId, order_id: reservation.id, status: 'invalid' },
    ),
  ])

  // If the caller already ran a real (simulated) Stripe charge before
  // calling this, that already accounts for the "processing" delay — only
  // synthesize one here for callers that didn't go through checkout.
  if (!stripePaymentId) {
    await new Promise((resolve) => setTimeout(resolve, 800))
  }

  await Promise.all([
    supabase.from('orders').update({ status: reservation.status }).eq('id', reservation.id),
    updateWithFallback(
      'payments',
      `payment-${reservation.id}`,
      { status: 'paid', stripe_payment_id: stripePaymentId ?? null },
      { status: 'paid' },
    ),
    supabase.from('tickets').update({ status: 'unused' }).eq('order_id', reservation.id),
  ])
}

export async function updateReservationStatus(reservationId: string, status: ReservationStatus) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', reservationId)
  if (error) throw error

  if (status === 'picked_up') {
    await updateWithFallback(
      'tickets',
      `ticket-${reservationId}`,
      { status: 'used', picked_up_at: new Date().toISOString() },
      { status: 'used' },
    )
  }
}

export async function updateProductQuantity(productId: string, quantityLeft: number, status: ProductStatus) {
  await updateWithFallback('products', productId, { stock: quantityLeft, status }, { stock: quantityLeft })
}

export async function updateProductStatus(productId: string, status: ProductStatus, quantityLeft?: number) {
  const rich: Record<string, unknown> = { status }
  const minimal: Record<string, unknown> = {}
  if (quantityLeft !== undefined) {
    rich.stock = quantityLeft
    minimal.stock = quantityLeft
  }
  await updateWithFallback('products', productId, rich, minimal)
}

export async function insertProduct(product: Product) {
  const base = {
    id: product.id,
    store_id: product.storeId,
    name: product.title,
    image: product.image,
    price: product.rescuePrice,
    stock: product.quantityLeft,
  }
  await insertWithFallback(
    'products',
    {
      ...base,
      description: product.description,
      normal_price: product.normalPrice,
      quantity_total: product.quantityTotal,
      pickup_start: product.pickupStart,
      pickup_end: product.pickupEnd,
      status: product.status,
      surprise_bag: product.surpriseBag ?? false,
      surprise_hint: product.surpriseHint ?? null,
    },
    base,
  )
}

export async function updateProductDetails(
  productId: string,
  fields: Partial<{ title: string; normalPrice: number; rescuePrice: number }>,
) {
  const rich: Record<string, unknown> = {}
  const minimal: Record<string, unknown> = {}
  if (fields.title !== undefined) {
    rich.name = fields.title
    minimal.name = fields.title
  }
  if (fields.rescuePrice !== undefined) {
    rich.price = fields.rescuePrice
    minimal.price = fields.rescuePrice
  }
  if (fields.normalPrice !== undefined) {
    rich.normal_price = fields.normalPrice
  }
  await updateWithFallback('products', productId, rich, minimal)
}

export async function updateStoreSettingsRow(
  storeId: string,
  settings: Partial<{ openTime: string; closeTime: string; isPaused: boolean }>,
) {
  const rich: Record<string, unknown> = {}
  if (settings.openTime !== undefined) rich.open_time = settings.openTime
  if (settings.closeTime !== undefined) rich.close_time = settings.closeTime
  if (settings.isPaused !== undefined) rich.is_paused = settings.isPaused
  // stores has no baseline-only columns to fall back to beyond (id, name) —
  // if the 0003 migration hasn't run yet this simply fails silently like the
  // rest of the optimistic-write pattern in this file.
  await updateWithFallback('stores', storeId, rich, {})
}
