import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HomeHeader } from '../../components/layout/HomeHeader'
import { CategoryTabs } from '../../components/ui/CategoryTabs'
import { FeaturedListingCard } from '../../components/ui/FeaturedListingCard'
import { ListingCard } from '../../components/ui/ListingCard'
import { StoreSpotlightCard } from '../../components/ui/StoreSpotlightCard'
import { useData } from '../../context/DataContext'
import { formatYen } from '../../lib/format'
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
              <p className="text-[11px] font-medium text-white/60">今日救われた食品</p>
              <p className="text-sm font-black tracking-tight text-white">
                <span className="text-base text-[#B4E36A]">42.5 kg</span> の廃棄を防ぎました
              </p>
            </div>
          </div>
          <div className="h-px bg-white/10" />
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-base">📍</span>
            <div>
              <p className="text-[11px] font-medium text-white/60">広島エリア・今すぐレスキュー可能</p>
              <p className="text-sm font-black tracking-tight text-white">
                あと <span className="text-base text-[#B4E36A]">{rescuableCount} 食</span> 救えます
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Map mock ─────────────────────────────────────────────────────────────────

const MAP_PINS = [
  { x: 24, y: 30, price: '¥450', name: 'CAFE LUMEN' },
  { x: 58, y: 55, price: '¥480', name: 'BAKERY MORI' },
  { x: 75, y: 22, price: '¥400', name: 'MARKET FRESH' },
]

function MapMockSection() {
  return (
    <section>
      <div className="flex items-center justify-between px-4">
        <h2 className="text-lg font-black tracking-tight text-neutral-900">マップで探す</h2>
        <span className="rounded-full bg-[#E6F2ED] px-2.5 py-1 text-[10px] font-bold text-[#0D4436]">近日公開</span>
      </div>
      <div className="relative mx-4 mt-3 overflow-hidden rounded-2xl shadow-sm" style={{ height: 196 }}>
        {/* Map background */}
        <div className="absolute inset-0" style={{ background: '#EAF0E4' }}>
          {/* Grid roads */}
          <div className="absolute bg-white/75" style={{ top: '43%', left: 0, right: 0, height: 13 }} />
          <div className="absolute bg-white/70" style={{ top: '70%', left: 0, right: 0, height: 9 }} />
          <div className="absolute bg-white/75" style={{ top: 0, bottom: 0, left: '37%', width: 12 }} />
          <div className="absolute bg-white/60" style={{ top: 0, bottom: 0, left: '67%', width: 9 }} />
          {/* City blocks */}
          <div className="absolute rounded-sm" style={{ top: '7%', left: '5%', width: '28%', height: '32%', background: '#D2DFCb' }} />
          <div className="absolute rounded-sm" style={{ top: '7%', left: '43%', width: '20%', height: '32%', background: '#CEDBCA' }} />
          <div className="absolute rounded-sm" style={{ top: '7%', left: '71%', width: '25%', height: '32%', background: '#D2DFCB' }} />
          <div className="absolute rounded-sm" style={{ top: '51%', left: '5%', width: '28%', height: '42%', background: '#CEDBCA' }} />
          <div className="absolute rounded-sm" style={{ top: '51%', left: '43%', width: '20%', height: '42%', background: '#D2DFCB' }} />
          <div className="absolute rounded-sm" style={{ top: '51%', left: '71%', width: '25%', height: '42%', background: '#C8D8C4' }} />
          {/* Park / green area */}
          <div className="absolute rounded-lg" style={{ top: '10%', left: '6%', width: '14%', height: '18%', background: '#B8D4B0' }} />

          {/* Store pins */}
          {MAP_PINS.map((pin) => (
            <div
              key={pin.name}
              className="absolute"
              style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: 'translate(-50%, -100%)' }}
            >
              <div className="flex flex-col items-center drop-shadow-md">
                <div className="whitespace-nowrap rounded-full bg-[#0D4436] px-2 py-0.5 text-[10px] font-black text-white">
                  {pin.price}
                </div>
                <div className="h-1.5 w-px bg-[#0D4436]" />
                <div className="h-1.5 w-1.5 rounded-full bg-[#0D4436]" />
              </div>
            </div>
          ))}

          {/* User location dot */}
          <div className="absolute" style={{ left: '50%', top: '46%', transform: 'translate(-50%, -50%)' }}>
            <div className="relative flex h-4 w-4 items-center justify-center">
              <div className="h-4 w-4 animate-ping rounded-full bg-blue-400 opacity-40" />
              <div className="absolute h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-md" />
            </div>
          </div>
        </div>

        {/* Bottom caption */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/35 to-transparent px-4 py-3">
          <p className="text-[11px] font-bold text-white/90">
            📍 広島市中区エリア — 全店舗をマップ表示する機能を準備中です
          </p>
        </div>
      </div>
    </section>
  )
}

// ── Savings ranking ───────────────────────────────────────────────────────────

const RANKING_DATA = [
  { rank: 1, name: 'ひらた 慶一郎', rescues: 12, saved: 4200 },
  { rank: 2, name: 'やまだ こうた', rescues: 11, saved: 3850 },
  { rank: 3, name: 'なかむら さやか', rescues: 9, saved: 3100 },
  { rank: 4, name: 'いとう まさき', rescues: 8, saved: 2750 },
  { rank: 5, name: 'たなか ゆか', rescues: 7, saved: 2400 },
]

const RANK_MEDAL = ['🥇', '🥈', '🥉']
const AVATAR_COLORS = [
  'bg-amber-100 text-amber-700',
  'bg-slate-100 text-slate-600',
  'bg-orange-100 text-orange-700',
  'bg-blue-50 text-blue-600',
  'bg-green-50 text-green-600',
]

function SavingsRankingSection() {
  return (
    <section>
      <div className="flex items-center justify-between px-4">
        <h2 className="text-lg font-black tracking-tight text-neutral-900">今週の節約ランキング 🏆</h2>
        <span className="text-xs font-semibold text-neutral-400">広島エリア</span>
      </div>
      <div className="mx-4 mt-3 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        {RANKING_DATA.map((entry, i) => (
          <div
            key={entry.rank}
            className={[
              'flex items-center gap-3 px-4 py-3',
              i < RANKING_DATA.length - 1 ? 'border-b border-neutral-50' : '',
              i === 0 ? 'bg-amber-50/60' : '',
            ].join(' ')}
          >
            <span className="w-6 shrink-0 text-center text-base leading-none">
              {RANK_MEDAL[i] ?? <span className="text-[11px] font-black text-neutral-400">{entry.rank}</span>}
            </span>
            <div className={['flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black', AVATAR_COLORS[i]].join(' ')}>
              {entry.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-neutral-800">{entry.name}</p>
              <p className="text-[11px] text-neutral-400">{entry.rescues}食 レスキュー済み</p>
            </div>
            <span className={['text-sm font-black', i === 0 ? 'text-amber-600' : 'text-[#0D4436]'].join(' ')}>
              {formatYen(entry.saved)} 節約
            </span>
          </div>
        ))}
        <div className="border-t border-neutral-100 px-4 py-3 text-center">
          <p className="text-[11px] text-neutral-400">あなたもレスキューしてランクインしよう！</p>
        </div>
      </div>
    </section>
  )
}

// ── Rail ─────────────────────────────────────────────────────────────────────

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

// ── Page ─────────────────────────────────────────────────────────────────────

export function Home() {
  const { products, stores } = useData()
  const [activeCategory, setActiveCategory] = useState<StoreCategory | 'all'>('all')

  const allActiveProducts = useMemo(() => products.filter((p) => p.status === 'active'), [products])

  const endingSoon = useMemo(
    () => [...allActiveProducts].sort((a, b) => a.pickupEnd.localeCompare(b.pickupEnd)).slice(0, 4),
    [allActiveProducts],
  )

  const nearby = useMemo(
    () =>
      allActiveProducts
        .filter((p) => {
          if (activeCategory === 'all') return true
          return stores.find((s) => s.id === p.storeId)?.category === activeCategory
        })
        .sort((a, b) => {
          const da = stores.find((s) => s.id === a.storeId)?.distanceKm ?? 0
          const db = stores.find((s) => s.id === b.storeId)?.distanceKm ?? 0
          return da - db
        }),
    [allActiveProducts, stores, activeCategory],
  )

  const popularStores = useMemo(() => [...stores].sort((a, b) => b.rating - a.rating), [stores])

  const rescuableCount = useMemo(
    () => allActiveProducts.reduce((sum, p) => sum + p.quantityLeft, 0),
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
          <HorizontalRail title="もうすぐ終了 ⚡">
            {endingSoon.map((product, i) =>
              i === 0 ? (
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
              {nearby.map((p) => (
                <ListingCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        <MapMockSection />

        <HorizontalRail title="人気のお店">
          {popularStores.map((store) => (
            <StoreSpotlightCard key={store.id} store={store} />
          ))}
        </HorizontalRail>

        <SavingsRankingSection />
      </div>
    </div>
  )
}
