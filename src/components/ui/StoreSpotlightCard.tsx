import { useData } from '../../context/DataContext'
import type { StoreInfo } from '../../lib/types'

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
      <path d="M12 3.5l2.5 5.4 5.8.6-4.3 4 1.2 5.9-5.2-3-5.2 3 1.2-5.9-4.3-4 5.8-.6Z" />
    </svg>
  )
}

export function StoreSpotlightCard({ store }: { store: StoreInfo }) {
  const { products } = useData()
  const rescuedCount = products
    .filter((product) => product.storeId === store.id)
    .reduce((sum, product) => sum + (product.quantityTotal - product.quantityLeft), 0)

  return (
    <div className="w-60 shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <img src={store.image} alt={store.name} className="aspect-[16/9] w-full object-cover" />
      <div className="p-3.5">
        <p className="text-sm font-bold text-neutral-900">{store.name}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs font-medium text-neutral-500">
            <StarIcon />
            {store.rating.toFixed(1)}
          </span>
          <span className="text-[11px] text-neutral-400">累計{rescuedCount.toLocaleString('ja-JP')}食レスキュー</span>
        </div>
      </div>
    </div>
  )
}
