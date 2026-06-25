import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { CategoryChips } from '../../components/ui/CategoryChips'
import { ProductCard } from '../../components/ui/ProductCard'
import { ProductCardSkeleton } from '../../components/ui/ProductCardSkeleton'
import { useData } from '../../context/DataContext'
import type { StoreCategory } from '../../lib/types'

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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 500)
    return () => window.clearTimeout(timer)
  }, [])

  const filtered = useMemo(() => {
    return products
      .filter((product) => {
        if (activeCategory === 'all') return true
        const store = stores.find((s) => s.id === product.storeId)
        return store?.category === activeCategory
      })
      .sort((a, b) => {
        if (a.status === b.status) return a.pickupStart.localeCompare(b.pickupStart)
        return a.status === 'active' ? -1 : 1
      })
  }, [products, stores, activeCategory])

  return (
    <div className="px-5 pb-24 pt-6">
      <h1 className="mb-5 text-xl font-bold tracking-tight text-neutral-800">商品一覧</h1>

      <div className="mb-6">
        <CategoryChips active={activeCategory} onChange={setActiveCategory} />
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
        <motion.div className="grid grid-cols-2 gap-3.5" variants={gridVariants} initial="hidden" animate="visible">
          {filtered.map((product) => (
            <motion.div key={product.id} variants={cardVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
