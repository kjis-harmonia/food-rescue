import { useData } from '../../context/DataContext'
import type { StoreInfo } from '../../lib/types'

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
      <path d="M12 3.5l2.5 5.4 5.8.6-4.3 4 1.2 5.9-5.2-3-5.2 3 1.2-5.9-4.3-4 5.8-.6Z" />
    </svg>
  )
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2C19 9 17 8 17 8z"/>
    </svg>
  )
}

export function StoreSpotlightCard({ store }: { store: StoreInfo }) {
  const { products } = useData()
  const rescuedCount = products
    .filter((product) => product.storeId === store.id)
    .reduce((sum, product) => sum + (product.quantityTotal - product.quantityLeft), 0)

  // Add deterministic base count per store to make numbers realistic
  const charSum = store.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const baseRescued = 820 + (charSum % 1080)
  const totalRescued = rescuedCount + baseRescued

  return (
    <div className="w-60 shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <div className="relative">
        <img src={store.image} alt={store.name} className="aspect-[16/9] w-full object-cover" />
        {/* Eco badge */}
        <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-[#0D4436]/85 px-2 py-1 text-[10px] font-bold text-[#B4E36A] backdrop-blur-sm">
          <LeafIcon />
          エコ店舗
        </span>
      </div>
      <div className="p-3.5">
        <p className="text-sm font-bold tracking-tight text-neutral-900">{store.name}</p>
        <div className="mt-2 flex items-center gap-2">
          {/* Rating pill */}
          <span className="flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-600">
            <StarIcon />
            {store.rating.toFixed(1)}
          </span>
          <span className="text-neutral-300 text-xs">·</span>
          <span className="text-[11px] font-semibold text-neutral-500">
            累計 <span className="font-black text-neutral-700">{totalRescued.toLocaleString('ja-JP')}</span>食 救済
          </span>
        </div>
      </div>
    </div>
  )
}
