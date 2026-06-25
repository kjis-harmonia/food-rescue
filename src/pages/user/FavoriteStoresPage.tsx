import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { formatDistance } from '../../lib/format'

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill={filled ? '#F5A623' : 'none'} stroke="#F5A623" strokeWidth="1.4">
      <path d="M12 3.5l2.6 5.4 5.9.6-4.4 4 1.2 5.8L12 16.3l-5.3 3 1.2-5.8-4.4-4 5.9-.6Z" strokeLinejoin="round" />
    </svg>
  )
}

export function FavoriteStoresPage() {
  const navigate = useNavigate()
  const { products, stores, favoriteIds, toggleFavorite, getProductsByStore } = useData()

  const favoriteStoreIds = Array.from(
    new Set(
      favoriteIds
        .map((productId) => products.find((product) => product.id === productId)?.storeId)
        .filter((storeId): storeId is string => Boolean(storeId)),
    ),
  )
  const favoriteStores = favoriteStoreIds
    .map((storeId) => stores.find((store) => store.id === storeId))
    .filter((store): store is (typeof stores)[number] => Boolean(store))

  const handleUnfollow = (storeId: string) => {
    favoriteIds
      .filter((productId) => products.find((product) => product.id === productId)?.storeId === storeId)
      .forEach((productId) => toggleFavorite(productId))
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-12">
      <div className="flex items-center gap-3 border-b border-neutral-100 bg-white px-4 py-4">
        <button
          type="button"
          onClick={() => navigate('/mypage')}
          aria-label="戻る"
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100"
        >
          <BackArrowIcon />
        </button>
        <h1 className="text-lg font-black tracking-tight text-neutral-900">お気に入り店舗</h1>
      </div>

      {favoriteStores.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400">お気に入りの店舗はまだありません</p>
      ) : (
        <div className="flex flex-col gap-3 px-4 py-4">
          {favoriteStores.map((store) => {
            const activeCount = getProductsByStore(store.id).filter((product) => product.status === 'active').length
            const fullStars = Math.round(store.rating)

            return (
              <div key={store.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
                <img src={store.image} alt={store.name} className="h-16 w-16 flex-shrink-0 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-neutral-900">{store.name}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <StarIcon key={index} filled={index < fullStars} />
                    ))}
                    <span className="ml-1 text-[11px] font-medium text-neutral-500">{store.rating.toFixed(1)}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    {formatDistance(store.distanceKm)} ・ 現在{activeCount}件出品中
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUnfollow(store.id)}
                  className="shrink-0 rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-bold text-neutral-600"
                >
                  フォロー解除
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
