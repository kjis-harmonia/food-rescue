import { useMemo } from 'react'
import { useData } from '../context/DataContext'
import { PLATFORM_FEE_RATE } from '../lib/platform'
import type { Product, Reservation, StoreInfo } from '../lib/types'

export interface StoreRankingEntry {
  store: StoreInfo
  revenue: number
  mealsRescued: number
}

export interface AdminDashboardStats {
  totalPlatformSales: number
  platformFee: number
  netToStores: number
  storeRanking: StoreRankingEntry[]
}

export function useAdminDashboard(): AdminDashboardStats {
  const { stores, products, reservations } = useData()

  return useMemo(() => {
    const productById = new Map(products.map((product) => [product.id, product]))
    const revenueOf = (reservation: Reservation) => {
      const product = productById.get(reservation.productId)
      return product ? product.rescuePrice * reservation.quantity : 0
    }

    const billable = reservations.filter((reservation) => reservation.status !== 'cancelled')
    const totalPlatformSales = billable.reduce((sum, reservation) => sum + revenueOf(reservation), 0)
    const platformFee = Math.round(totalPlatformSales * PLATFORM_FEE_RATE)
    const netToStores = totalPlatformSales - platformFee

    const salesByStore = new Map<string, { revenue: number; mealsRescued: number }>()
    for (const reservation of billable) {
      const entry = salesByStore.get(reservation.storeId) ?? { revenue: 0, mealsRescued: 0 }
      entry.revenue += revenueOf(reservation)
      if (reservation.status === 'picked_up') entry.mealsRescued += reservation.quantity
      salesByStore.set(reservation.storeId, entry)
    }

    const storeRanking: StoreRankingEntry[] = stores
      .map((store) => {
        const entry = salesByStore.get(store.id) ?? { revenue: 0, mealsRescued: 0 }
        return { store, ...entry }
      })
      .sort((a, b) => b.revenue - a.revenue)

    return { totalPlatformSales, platformFee, netToStores, storeRanking }
  }, [stores, products, reservations])
}

// Exposed for callers that just need the raw computation without the hook
// (e.g. tests or non-component code) — same logic, explicit inputs.
export function calculatePlatformMetrics(reservations: Reservation[], products: Product[]) {
  const productById = new Map(products.map((product) => [product.id, product]))
  const totalSales = reservations
    .filter((reservation) => reservation.status !== 'cancelled')
    .reduce((sum, reservation) => {
      const product = productById.get(reservation.productId)
      return product ? sum + product.rescuePrice * reservation.quantity : sum
    }, 0)
  const platformFee = Math.round(totalSales * PLATFORM_FEE_RATE)
  return { totalSales, platformFee, netToStores: totalSales - platformFee }
}
