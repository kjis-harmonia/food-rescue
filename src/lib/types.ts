export type StoreCategory = 'bakery' | 'cafe' | 'restaurant' | 'grocery' | 'deli'

export interface StoreInfo {
  id: string
  name: string
  category: StoreCategory
  address: string
  description: string
  image: string
  distanceKm: number
  rating: number
  openTime?: string
  closeTime?: string
  isPaused?: boolean
}

export type ProductStatus = 'active' | 'soldout' | 'ended'

export interface Product {
  id: string
  storeId: string
  title: string
  description: string
  image: string
  normalPrice: number
  rescuePrice: number
  quantityTotal: number
  quantityLeft: number
  pickupStart: string
  pickupEnd: string
  status: ProductStatus
  surpriseBag?: boolean
  surpriseHint?: string
}

export type ReservationStatus = 'confirmed' | 'picked_up' | 'cancelled'
export type PaymentMethod = 'credit_card' | 'paypay' | 'apple_pay'

export interface Reservation {
  id: string
  productId: string
  storeId: string
  quantity: number
  status: ReservationStatus
  pickupCode: string
  pickupStart: string
  pickupEnd: string
  createdAt: string
  pickedUpAt?: string
}

export type NotificationAudience = 'user' | 'store'
export type NotificationType =
  | 'new_product'
  | 'reservation'
  | 'pickup_reminder'
  | 'soldout'
  | 'cancellation'
  | 'pickup_complete'
  | 'announcement'
  | 'coupon'

export interface AppNotification {
  id: string
  type: NotificationType
  audience: NotificationAudience
  message: string
  createdAt: string
  read: boolean
}
