import { useMemo } from 'react'
import { useData } from '../context/DataContext'
import { co2KgToTrees, foodWasteKgToCo2Kg, mealsToFoodWasteKg } from '../lib/eco'

const XP_PER_MEAL = 100

export interface LevelProgress {
  level: number
  xp: number
  xpIntoLevel: number
  xpForNextLevel: number
  progressPercent: number
}

export interface Badge {
  id: string
  label: string
  description: string
  emoji: string
  achieved: boolean
}

export interface UserGamificationStats {
  mealsRescued: number
  rescueCount: number
  foodWasteSavedKg: number
  co2SavedKg: number
  treesEquivalent: number
  level: LevelProgress
  badges: Badge[]
}

/** XP required to go from `level` to `level + 1`. */
function xpRequiredForLevel(level: number) {
  return level * 500
}

function computeLevel(xp: number): LevelProgress {
  let level = 1
  let remaining = xp
  while (remaining >= xpRequiredForLevel(level)) {
    remaining -= xpRequiredForLevel(level)
    level += 1
  }
  const xpForNextLevel = xpRequiredForLevel(level)
  const progressPercent = Math.min(100, Math.round((remaining / xpForNextLevel) * 100))
  return { level, xp, xpIntoLevel: remaining, xpForNextLevel, progressPercent }
}

export function useUserGamification(): UserGamificationStats {
  const { reservations, getStoreById } = useData()

  return useMemo(() => {
    const rescued = reservations.filter((reservation) => reservation.status === 'picked_up')
    const mealsRescued = rescued.reduce((sum, reservation) => sum + reservation.quantity, 0)
    const rescueCount = rescued.length

    const foodWasteSavedKg = mealsToFoodWasteKg(mealsRescued)
    const co2SavedKg = foodWasteKgToCo2Kg(foodWasteSavedKg)
    const treesEquivalent = co2KgToTrees(co2SavedKg)

    const xp = mealsRescued * XP_PER_MEAL
    const level = computeLevel(xp)

    const countsByStore = new Map<string, number>()
    for (const reservation of rescued) {
      countsByStore.set(reservation.storeId, (countsByStore.get(reservation.storeId) ?? 0) + 1)
    }
    const favoriteStoreCount = Math.max(0, ...countsByStore.values())
    const favoriteStoreName = [...countsByStore.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([storeId]) => getStoreById(storeId)?.name)
      .find((name): name is string => Boolean(name))

    const badges: Badge[] = [
      {
        id: 'first_rescue',
        label: '初めてのレスキュー',
        description: '1回レスキューを完了する',
        emoji: '🌱',
        achieved: rescueCount >= 1,
      },
      {
        id: 'rescue_master',
        label: 'レスキューの達人',
        description: '5回レスキューを完了する',
        emoji: '🔥',
        achieved: rescueCount >= 5,
      },
      {
        id: 'rescue_legend',
        label: 'レスキューマスター',
        description: '20回レスキューを完了する',
        emoji: '🏆',
        achieved: rescueCount >= 20,
      },
      {
        id: 'regular_customer',
        label: '常連さん',
        description: `同じ店舗で3回レスキューする${favoriteStoreCount >= 3 && favoriteStoreName ? `（${favoriteStoreName}）` : ''}`,
        emoji: '💚',
        achieved: favoriteStoreCount >= 3,
      },
      {
        id: 'eco_hero',
        label: 'エコヒーロー',
        description: 'CO2削減量10kgを達成する',
        emoji: '🌍',
        achieved: co2SavedKg >= 10,
      },
    ]

    return { mealsRescued, rescueCount, foodWasteSavedKg, co2SavedKg, treesEquivalent, level, badges }
  }, [reservations, getStoreById])
}
