import type { StoreCategory } from './types'

export const categoryOptions: { key: StoreCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'bakery', label: 'ベーカリー' },
  { key: 'cafe', label: 'カフェ' },
  { key: 'restaurant', label: 'レストラン' },
  { key: 'deli', label: 'デリ' },
  { key: 'grocery', label: '青果' },
]
