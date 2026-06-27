import { Link } from 'react-router-dom'
import { LiveCountdown } from './LiveCountdown'
import { useData } from '../../context/DataContext'
import { formatDistance, formatYen } from '../../lib/format'
import type { Product } from '../../lib/types'

export function FeaturedListingCard({ product }: { product: Product }) {
  const { getStoreById } = useData()
  const store = getStoreById(product.storeId)
  const savings = product.normalPrice - product.rescuePrice
  const displayTitle = product.surpriseBag ? `${store?.name ?? ''}のお楽しみレスキューバッグ` : product.title

  return (
    <Link
      to={`/products/${product.id}`}
      className="relative block w-[calc(100vw-32px)] shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition hover:opacity-95"
    >
      <div className="relative">
        <img src={product.image} alt={displayTitle} className="aspect-[16/10] w-full object-cover" />
        <span className="absolute left-3 top-3">
          <LiveCountdown pickupEnd={product.pickupEnd} variant="featured" />
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-neutral-900/80 px-2.5 py-1 text-[11px] font-black text-white backdrop-blur-sm">
          残り{product.quantityLeft}個
        </span>
      </div>

      <div className="p-4">
        <div className="flex justify-between text-[11px] font-bold text-neutral-500">
          <span className="truncate">{store?.name} ・ {formatDistance(store?.distanceKm ?? 0)}</span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-base font-bold text-neutral-900">{displayTitle}</p>
        <p className="mt-0.5 text-xs text-neutral-400">受取 {product.pickupStart}〜{product.pickupEnd}</p>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight text-neutral-950">{formatYen(product.rescuePrice)}</span>
          <span className="text-sm text-neutral-400 line-through">{formatYen(product.normalPrice)}</span>
          <span className="rounded-md bg-[#0D4436] px-2 py-1 text-xs font-black text-white">
            {formatYen(savings)}お得
          </span>
        </div>
      </div>
    </Link>
  )
}
