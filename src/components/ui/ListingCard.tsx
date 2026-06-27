import { Link } from 'react-router-dom'
import { LiveCountdown } from './LiveCountdown'
import { useData } from '../../context/DataContext'
import { formatDistance, formatYen } from '../../lib/format'
import type { Product } from '../../lib/types'

export function ListingCard({ product }: { product: Product }) {
  const { getStoreById } = useData()
  const store = getStoreById(product.storeId)
  const isSoldOut = product.status !== 'active' || product.quantityLeft <= 0
  const savings = product.normalPrice - product.rescuePrice
  const displayTitle = product.surpriseBag ? `${store?.name ?? ''}のお楽しみレスキューバッグ` : product.title

  return (
    <Link to={`/products/${product.id}`} className="block w-full cursor-pointer transition hover:opacity-95">
      <div className="relative">
        <img
          src={product.image}
          alt={displayTitle}
          className={[
            'aspect-[4/3] w-full rounded-2xl object-cover shadow-sm',
            isSoldOut ? 'grayscale opacity-60' : '',
          ].join(' ')}
        />

        {isSoldOut ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-neutral-600 shadow-sm backdrop-blur-sm">
              {product.status === 'ended' ? 'レスキュー完了' : 'Sold Out'}
            </span>
          </span>
        ) : (
          <>
            <span className="absolute left-2 top-2 rounded-full bg-neutral-900/80 px-2 py-1 text-[10px] font-black text-white backdrop-blur-sm">
              残り{product.quantityLeft}個
            </span>
            <span className="absolute right-2 top-2">
              <LiveCountdown pickupEnd={product.pickupEnd} variant="card" />
            </span>
          </>
        )}
      </div>

      <div className="flex justify-between text-[11px] font-bold text-neutral-500 mt-2">
        <span className="truncate">{store?.name} ・ {formatDistance(store?.distanceKm ?? 0)}</span>
      </div>
      <p className="text-sm font-bold text-neutral-800 line-clamp-1 mt-0.5">{displayTitle}</p>
      <p className="text-[11px] text-neutral-400 mt-0.5">受取 {product.pickupStart}〜{product.pickupEnd}</p>

      <div className="mt-1 flex flex-col gap-0.5">
        <span className="text-base font-black text-neutral-950">{formatYen(product.rescuePrice)}</span>
        {!isSoldOut && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 line-through">{formatYen(product.normalPrice)}</span>
            <span className="whitespace-nowrap rounded-md bg-[#0D4436] px-1.5 py-0.5 text-[10px] font-black text-white">
              {formatYen(savings)}お得
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
