import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { CategoryChips } from '../../components/ui/CategoryChips'
import { ListingCard } from '../../components/ui/ListingCard'
import { ProductCardSkeleton } from '../../components/ui/ProductCardSkeleton'
import { useData } from '../../context/DataContext'
import { minutesUntilTime } from '../../lib/format'
import type { StoreCategory } from '../../lib/types'

type SortKey = 'distance' | 'ending'

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4-4" strokeLinecap="round" />
    </svg>
  )
}

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

export function ProductList() {
  const { products, stores } = useData()
  const [activeCategory, setActiveCategory] = useState<StoreCategory | 'all'>('all')
  const [keyword, setKeyword] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('distance')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 500)
    return () => window.clearTimeout(timer)
  }, [])

  const filtered = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return products
      .filter((product) => {
        if (activeCategory === 'all') return true
        const store = stores.find((s) => s.id === product.storeId)
        return store?.category === activeCategory
      })
      .filter((product) => {
        if (!normalizedKeyword) return true
        const store = stores.find((s) => s.id === product.storeId)
        return (
          product.title.toLowerCase().includes(normalizedKeyword) ||
          store?.name.toLowerCase().includes(normalizedKeyword)
        )
      })
      .sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1
        if (a.status !== 'active' && b.status === 'active') return 1

        if (sortKey === 'distance') {
          const storeA = stores.find((s) => s.id === a.storeId)
          const storeB = stores.find((s) => s.id === b.storeId)
          return (storeA?.distanceKm ?? 0) - (storeB?.distanceKm ?? 0)
        }
        return minutesUntilTime(a.pickupEnd) - minutesUntilTime(b.pickupEnd)
      })
  }, [products, stores, activeCategory, keyword, sortKey])

  return (
    <div className="px-5 pb-24 pt-6">
      <h1 className="mb-5 text-xl font-bold tracking-tight text-neutral-800">レスキュー</h1>

      <div className="mb-4 flex items-center gap-2.5 rounded-[20px] border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm">
        <SearchIcon />
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="商品名やお店の名前で検索"
          className="w-full bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
        />
      </div>

      <div className="mb-4">
        <CategoryChips active={activeCategory} onChange={setActiveCategory} />
      </div>

      <div className="mb-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSortKey('distance')}
          className={
            sortKey === 'distance'
              ? 'rounded-full bg-[#0D4436] px-3.5 py-1.5 text-xs font-bold text-white'
              : 'rounded-full border border-neutral-200 px-3.5 py-1.5 text-xs font-bold text-neutral-500'
          }
        >
          距離が近い順
        </button>
        <button
          type="button"
          onClick={() => setSortKey('ending')}
          className={
            sortKey === 'ending'
              ? 'rounded-full bg-[#0D4436] px-3.5 py-1.5 text-xs font-bold text-white'
              : 'rounded-full border border-neutral-200 px-3.5 py-1.5 text-xs font-bold text-neutral-500'
          }
        >
          受取終了が近い順
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3.5">
          {Array.from({ length: 6 }, (_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400">この条件に合う商品は見つかりませんでした</p>
      ) : (
        <motion.div className="grid grid-cols-2 gap-x-4 gap-y-6" variants={gridVariants} initial="hidden" animate="visible">
          {filtered.map((product) => (
            <motion.div key={product.id} variants={cardVariants}>
              <ListingCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
