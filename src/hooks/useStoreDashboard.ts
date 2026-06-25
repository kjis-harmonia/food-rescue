import { useMemo } from 'react'
import { useData } from '../context/DataContext'
import { mealsToFoodWasteKg } from '../lib/eco'
import type { Product, Reservation } from '../lib/types'

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

export interface TopProduct {
  product: Product
  orderCount: number
  quantitySold: number
  revenue: number
}

export interface DayBucket {
  label: string
  quantity: number
  revenue: number
}

export interface HourBucket {
  hour: number
  label: string
  quantity: number
}

export interface StoreDashboardStats {
  todayRevenue: number
  todayMealsRescued: number
  totalRescued: number
  totalMealsRescued: number
  foodWasteSavedKg: number
  pendingPickupCount: number
  topProducts: TopProduct[]
  weekdaySeries: DayBucket[]
  hourlySeries: HourBucket[]
}

function isToday(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function useStoreDashboard(storeId: string): StoreDashboardStats {
  const { reservations, products } = useData()

  return useMemo(() => {
    const storeReservations = reservations.filter((reservation) => reservation.storeId === storeId)
    const billableReservations = storeReservations.filter((reservation) => reservation.status !== 'cancelled')
    const rescuedReservations = storeReservations.filter((reservation) => reservation.status === 'picked_up')

    const productById = new Map(products.map((product) => [product.id, product]))
    const revenueOf = (reservation: Reservation) => {
      const product = productById.get(reservation.productId)
      return product ? product.rescuePrice * reservation.quantity : 0
    }

    const todayBillable = billableReservations.filter((reservation) => isToday(reservation.createdAt))
    const todayRevenue = todayBillable.reduce((sum, reservation) => sum + revenueOf(reservation), 0)
    const todayMealsRescued = todayBillable.reduce((sum, reservation) => sum + reservation.quantity, 0)

    const totalMealsRescued = rescuedReservations.reduce((sum, reservation) => sum + reservation.quantity, 0)
    const foodWasteSavedKg = mealsToFoodWasteKg(totalMealsRescued)

    const pendingPickupCount = storeReservations.filter((reservation) => reservation.status === 'confirmed').length

    const salesByProduct = new Map<string, { orderCount: number; quantitySold: number; revenue: number }>()
    for (const reservation of billableReservations) {
      const entry = salesByProduct.get(reservation.productId) ?? { orderCount: 0, quantitySold: 0, revenue: 0 }
      entry.orderCount += 1
      entry.quantitySold += reservation.quantity
      entry.revenue += revenueOf(reservation)
      salesByProduct.set(reservation.productId, entry)
    }
    const topProducts: TopProduct[] = Array.from(salesByProduct.entries())
      .map(([productId, stats]) => {
        const product = productById.get(productId)
        return product ? { product, ...stats } : null
      })
      .filter((entry): entry is TopProduct => entry !== null)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5)

    const weekdaySeries: DayBucket[] = WEEKDAY_LABELS.map((label) => ({ label, quantity: 0, revenue: 0 }))
    for (const reservation of billableReservations) {
      const day = new Date(reservation.createdAt).getDay()
      weekdaySeries[day].quantity += reservation.quantity
      weekdaySeries[day].revenue += revenueOf(reservation)
    }

    const hourBuckets = new Map<number, number>()
    for (const reservation of billableReservations) {
      const [hour] = reservation.pickupStart.split(':').map(Number)
      if (Number.isNaN(hour)) continue
      hourBuckets.set(hour, (hourBuckets.get(hour) ?? 0) + reservation.quantity)
    }
    const hourlySeries: HourBucket[] = Array.from(hourBuckets.entries())
      .map(([hour, quantity]) => ({ hour, label: `${hour}時`, quantity }))
      .sort((a, b) => a.hour - b.hour)

    return {
      todayRevenue,
      todayMealsRescued,
      totalRescued: rescuedReservations.length,
      totalMealsRescued,
      foodWasteSavedKg,
      pendingPickupCount,
      topProducts,
      weekdaySeries,
      hourlySeries,
    }
  }, [reservations, products, storeId])
}
