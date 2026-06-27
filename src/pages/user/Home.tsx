import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HomeHeader } from '../../components/layout/HomeHeader'
import { CategoryTabs } from '../../components/ui/CategoryTabs'
import { FeaturedListingCard } from '../../components/ui/FeaturedListingCard'
import { ListingCard } from '../../components/ui/ListingCard'
import { StoreSpotlightCard } from '../../components/ui/StoreSpotlightCard'
import { useData } from '../../context/DataContext'
import type { StoreCategory } from '../../lib/types'

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4-4" strokeLinecap="round" />
    </svg>
  )
}

function MissionStats({ rescuableCount }: { rescuableCount: number }) {
  return (
    <div className="mx-4 mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D4436] via-[#0F5040] to-[#1A6B52] shadow-[0_4px_20px_rgba(13,68,54,0.28)]">
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">本日の実績 — LIVE</p>
        <div className="mt-2.5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-base">🌍</span>
            <div>
              <p className="text-[11px] text-white/60 font-medium">今日救われた食品</p>
              <p className="text-sm font-black tracking-tight text-white">
                <span className="text-[#B4E36A] text-base">42.5 kg</span> の廃棄を防ぎました
              </p>
            </div>
          </div>
          <div className="h-px bg-white/10" />
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-base">📍</span>
            <div>
              <p className="text-[11px] text-white/60 font-medium">広島エリア・今すぐレスキュー可能</p>
              <p className="text-sm font-black tracking-tight text-white">
                あと <span className="text-[#B4E36A] text-base">{rescuableCount} 食</span> 救えます
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HorizontalRail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="px-4 text-lg font-black tracking-tight text-neutral-900">{title}</h2>
      <div className="mt-4 flex space-x-4 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  )
}

export function Home() {
  const { products, stores } = useData()
  const [activeCategory, setActiveCategory] = useState<StoreCategory | 'all'>('all')

  const allActiveProducts = useMemo(() => products.filter((product) => product.status === 'active'), [products])

  const endingSoon = useMemo(
    () => [...allActiveProducts].sort((a, b) => a.pickupEnd.localeCompare(b.pickupEnd)).slice(0, 4),
    [allActiveProducts],
  )

  const nearby = useMemo(
    () =>
      allActiveProducts
        .filter((product) => {
          if (activeCategory === 'all') return true
          const store = stores.find((s) => s.id === product.storeId)
          return store?.category === activeCategory
        })
        .sort((a, b) => {
          const storeA = stores.find((s) => s.id === a.storeId)
          const storeB = stores.find((s) => s.id === b.storeId)
          return (storeA?.distanceKm ?? 0) - (storeB?.distanceKm ?? 0)
        }),
    [allActiveProducts, stores, activeCategory],
  )

  const popularStores = useMemo(() => [...stores].sort((a, b) => b.rating - a.rating), [stores])
  const rescuableCount = useMemo(
    () => allActiveProducts.reduce((sum, p) => sum + p.quantityLeft, 0),
    [allActiveProducts],
  )

  const recommended = useMemo(
    () => [...allActiveProducts].sort((a, b) => b.normalPrice - b.rescuePrice - (a.normalPrice - a.rescuePrice)),
    [allActiveProducts],
  )

  return (
    <div className="bg-white pb-24">
      <HomeHeader />

      <div className="px-4 pt-4">
        <Link
          to="/products"
          className="flex items-center gap-2.5 rounded-[24px] border border-neutral-200 bg-white px-5 py-3.5 text-sm text-neutral-400 shadow-sm"
        >
          <SearchIcon />
          <span>エリアやお店を探す</span>
        </Link>
      </div>

      <MissionStats rescuableCount={rescuableCount} />

      <div className="mt-5">
        <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
      </div>

      <div className="space-y-10 pt-6">
        {endingSoon.length > 0 && (
          <HorizontalRail title="あと1時間で終了 ⚡">
            {endingSoon.map((product, index) =>
              index === 0 ? (
                <FeaturedListingCard key={product.id} product={product} />
              ) : (
                <div key={product.id} className="w-40 shrink-0">
                  <ListingCard product={product} />
                </div>
              ),
            )}
          </HorizontalRail>
        )}

        <section>
          <h2 className="px-4 text-lg font-black tracking-tight text-neutral-900">近くのレスキュー品</h2>
          {nearby.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-neutral-400">このカテゴリーのレスキュー品は現在ありません</p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 px-4">
              {nearby.map((product) => (
                <ListingCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        <HorizontalRail title="人気のお店">
          {popularStores.map((store) => (
            <StoreSpotlightCard key={store.id} store={store} />
          ))}
        </HorizontalRail>

        {recommended.length > 0 && (
          <HorizontalRail title="あなたへのおすすめ ✨">
            {recommended.map((product) => (
              <div key={product.id} className="w-44 shrink-0">
                <ListingCard product={product} />
              </div>
            ))}
          </HorizontalRail>
        )}
      </div>
    </div>
  )
}
