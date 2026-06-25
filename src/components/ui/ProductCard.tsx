import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { formatYen } from '../../lib/format'
import type { Product } from '../../lib/types'

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 20.5s-7.5-4.6-9.8-9.2C.6 7.8 2.4 4.2 6 3.6c2-.3 3.8.6 6 2.9 2.2-2.3 4-3.2 6-2.9 3.6.6 5.4 4.2 3.8 7.7-2.3 4.6-9.8 9.2-9.8 9.2z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.2" />
    </svg>
  )
}

export function ProductCard({ product }: { product: Product }) {
  const { getStoreById, toggleFavorite, isFavorite } = useData()
  const store = getStoreById(product.storeId)
  const isSoldOut = product.status !== 'active' || product.quantityLeft <= 0
  const isLowStock = !isSoldOut && product.quantityLeft <= 2
  const favorite = isFavorite(product.id)
  const savings = product.normalPrice - product.rescuePrice
  const discountPercent = product.normalPrice > 0 ? Math.round((savings / product.normalPrice) * 100) : 0

  const displayTitle = product.surpriseBag ? `${store?.name ?? ''}のお楽しみレスキューバッグ` : product.title

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block overflow-hidden rounded-[2rem] border border-neutral-100 bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.015)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(13,68,54,0.06)]"
    >
      <div className="relative rounded-2xl overflow-hidden">
        <div className="aspect-[4/3] w-full bg-neutral-100">
          <img
            src={product.image}
            alt={displayTitle}
            className={[
              'h-full w-full object-cover transition-all duration-500',
              isSoldOut ? 'grayscale contrast-75 opacity-50' : 'group-hover:scale-105',
            ].join(' ')}
          />
        </div>

        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-neutral-600 shadow-sm backdrop-blur-sm">
              {product.status === 'ended' ? 'レスキュー完了' : 'Sold Out'}
            </span>
          </div>
        )}

        {!isSoldOut && (
          <span
            className={[
              'absolute left-2.5 top-2.5 rounded-xl px-3 py-1 text-[11px] font-black text-white backdrop-blur-sm',
              isLowStock ? 'bg-[#FF6B35]/90' : 'bg-[#0D4436]/90',
            ].join(' ')}
          >
            残り{product.quantityLeft}個
          </span>
        )}

        <motion.button
          type="button"
          aria-label="お気に入りに追加"
          whileTap={{ scale: 1.3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            toggleFavorite(product.id)
          }}
          className={[
            'absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/70 shadow-sm backdrop-blur-sm',
            favorite ? 'text-[#FF6B35]' : 'text-neutral-500',
          ].join(' ')}
        >
          <HeartIcon active={favorite} />
        </motion.button>

        <div className="absolute -bottom-5 left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white shadow-md">
          <img src={store?.image} alt={store?.name} className="h-full w-full rounded-full object-cover" />
        </div>
      </div>

      <div className="pb-2 pt-7 px-1.5">
        <p className={`text-[11px] font-bold uppercase tracking-wider ${isSoldOut ? 'text-neutral-300' : 'text-neutral-400'}`}>
          {store?.name}
        </p>
        <h3
          className={[
            'mt-1 truncate text-base font-bold tracking-tight',
            isSoldOut ? 'text-neutral-400' : 'text-neutral-800',
          ].join(' ')}
        >
          {displayTitle}
        </h3>

        <div className="mt-2.5 flex items-center gap-3 text-xs font-medium text-neutral-500">
          <span className="flex items-center gap-1">
            <ClockIcon />
            {product.pickupStart}〜{product.pickupEnd}
          </span>
          <span className="flex items-center gap-1">
            <PinIcon />
            {(store?.distanceKm ?? 0) < 1 ? `${Math.round((store?.distanceKm ?? 0) * 1000)}m` : `${(store?.distanceKm ?? 0).toFixed(1)}km`}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-y-1 border-t border-neutral-50 pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-lg font-black ${isSoldOut ? 'text-neutral-400' : 'text-neutral-900'}`}>
              {formatYen(product.rescuePrice)}
            </span>
            <span className="text-[11px] font-medium text-neutral-400 line-through">{formatYen(product.normalPrice)}</span>
          </div>
          {!isSoldOut && (
            <span className="shrink-0 rounded-lg bg-[#E6F2ED] px-2 py-0.5 text-[11px] font-bold text-[#0D4436]">
              {discountPercent}%OFF
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
