import { useMemo, useState } from 'react'
import foodRescueLogo from '../../assets/food-rescue.png'
import { NotificationPanel } from '../../components/ui/NotificationPanel'
import { useData } from '../../context/DataContext'
import { useUserGamification } from '../../hooks/useUserGamification'
import { formatYen } from '../../lib/format'

type IconProps = { className?: string }

function BellIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.5 10.2a5.5 5.5 0 0 1 11 0c0 5 2 5.4 2 6.8h-15c0-1.4 2-1.8 2-6.8ZM10 20h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SettingsIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19 13.5v-3l-2-.7a7.8 7.8 0 0 0-.7-1.6l.9-1.9-2.1-2.1-1.9.9a7.8 7.8 0 0 0-1.6-.7L10.5 2h-3l-.7 2.4a7.8 7.8 0 0 0-1.6.7l-1.9-.9-2.1 2.1.9 1.9a7.8 7.8 0 0 0-.7 1.6L0 10.5v3l2.4.7c.2.6.4 1.1.7 1.6l-.9 1.9 2.1 2.1 1.9-.9c.5.3 1 .5 1.6.7l.7 2.4h3l.7-2.4c.6-.2 1.1-.4 1.6-.7l1.9.9 2.1-2.1-.9-1.9c.3-.5.5-1 .7-1.6l2.4-.7Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" transform="translate(2 0) scale(.83)" />
    </svg>
  )
}

function UserIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 20c.4-4 2.6-6 6.5-6s6.1 2 6.5 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function CardIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 9h18M7 15h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function HelpIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9.8 9a2.3 2.3 0 0 1 4.4 1c0 1.7-2.2 2-2.2 3.7M12 17.3h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const categoryDisplay: Record<string, string> = {
  bakery: 'パン・スイーツ',
  cafe: 'カフェ',
  restaurant: 'レストラン',
  deli: 'デリ・惣菜',
  grocery: '青果',
}

const settings = [
  { label: 'アカウント情報', icon: UserIcon },
  { label: 'お支払い方法', icon: CardIcon },
  { label: '通知設定', icon: BellIcon },
  { label: 'ヘルプ・お問い合わせ', icon: HelpIcon },
]

function formatHistoryDate(iso: string) {
  const date = new Date(iso)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${m}/${d}`
}

export function MyPage() {
  const { products, stores, favoriteIds, reservations, getProductById, getStoreById, notifications } = useData()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const unreadCount = notifications.filter((notification) => notification.audience === 'user' && !notification.read).length

  const validReservations = useMemo(
    () => [...reservations].filter((r) => r.status !== 'cancelled').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reservations],
  )

  const mealsSaved = validReservations.reduce((sum, r) => sum + r.quantity, 0)
  const moneySaved = validReservations.reduce((sum, r) => {
    const product = getProductById(r.productId)
    return product ? sum + (product.normalPrice - product.rescuePrice) * r.quantity : sum
  }, 0)

  const gamification = useUserGamification()
  const { co2SavedKg, treesEquivalent, level, badges } = gamification

  const lastReservation = validReservations[0]
  const lastProduct = lastReservation ? getProductById(lastReservation.productId) : undefined
  const lastSavings = lastReservation && lastProduct ? (lastProduct.normalPrice - lastProduct.rescuePrice) * lastReservation.quantity : 0

  const history = validReservations.slice(0, 5)

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

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-12">
      <div className="flex items-center justify-between bg-white px-4 pt-6">
        <span className="flex h-9 w-32 items-center overflow-hidden whitespace-nowrap">
          <img src={foodRescueLogo} alt="フードレスキュー" className="h-full w-full object-cover object-top" />
        </span>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              aria-label="通知"
              onClick={() => setNotificationsOpen((current) => !current)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 font-mono text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel audience="user" open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
          </div>
          <button type="button" aria-label="設定" className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100">
            <SettingsIcon />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-neutral-100 bg-white px-4 py-6">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80"
            alt="ゲストユーザー"
            className="h-14 w-14 rounded-full bg-neutral-100 object-cover"
          />
          <div className="min-w-0">
            <p className="text-lg font-bold tracking-tight text-neutral-900">ゲストユーザー</p>
            <p className="mt-0.5 text-xs font-normal text-neutral-500">おいしいを、救おう。</p>
            <span className="mt-1 w-fit rounded-md bg-neutral-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              GREEN MEMBER
            </span>
          </div>
        </div>
        <ChevronIcon className="h-4 w-4 shrink-0 text-neutral-300" />
      </div>

      <div className="mx-4 mt-4 rounded-2xl bg-[#0B2C24] p-5 text-white">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">あなたのインパクト</p>
          <button type="button" className="text-xs font-semibold text-white/90 underline decoration-white/30 underline-offset-4">
            詳細 ＞
          </button>
        </div>

        <div className="grid grid-cols-3 divide-x divide-white/10 pl-1 text-left">
          <div className="flex flex-col justify-between pl-0">
            <p className="text-[11px] font-medium text-neutral-400">救った食事</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-white">
              {mealsSaved}
              <span className="ml-0.5 text-xs font-normal text-neutral-400">食</span>
            </p>
            <p className="mt-1 text-[10px] font-medium text-[#A3E635]">
              {lastReservation ? `+${lastReservation.quantity} 食 (直近の予約)` : 'まだ実績がありません'}
            </p>
          </div>

          <div className="flex flex-col justify-between pl-3">
            <p className="text-[11px] font-medium text-neutral-400">削減したCO2</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-white">
              {co2SavedKg.toFixed(1)}
              <span className="ml-0.5 text-xs font-normal text-neutral-400">kg</span>
            </p>
            <p className="mt-1 text-[10px] font-medium text-neutral-400">約 {treesEquivalent} 本の木分</p>
          </div>

          <div className="flex flex-col justify-between pl-3">
            <p className="text-[11px] font-medium text-neutral-400">節約できた金額</p>
            <p className="mt-1 text-xl font-bold tracking-tight text-white">{formatYen(moneySaved)}</p>
            <p className="mt-1 text-[10px] font-medium text-[#A3E635]">
              {lastReservation ? `+${formatYen(lastSavings)} (直近の予約)` : 'まだ実績がありません'}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4 rounded-2xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-[#0D4436] px-2.5 py-1 text-xs font-black tracking-tight text-white">
            Lv.{level.level}
          </span>
          <p className="text-xs font-bold text-neutral-400">
            {level.xpIntoLevel.toLocaleString('ja-JP')} / {level.xpForNextLevel.toLocaleString('ja-JP')} XP
          </p>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0D4436] to-[#A3E635] transition-all duration-500 ease-out"
            style={{ width: `${level.progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] font-medium text-neutral-400">
          次のレベルまであと {(level.xpForNextLevel - level.xpIntoLevel).toLocaleString('ja-JP')} XP
        </p>
      </div>

      <div className="mx-4 mt-8">
        <div className="mb-4 flex items-center justify-between px-1">
          <p className="text-sm font-bold tracking-tight text-neutral-900">獲得バッジ</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={[
                'flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center transition-all duration-300',
                badge.achieved ? 'bg-[#0B2C24] shadow-[0_4px_16px_rgba(13,68,54,0.18)]' : 'bg-neutral-100',
              ].join(' ')}
            >
              <span className={['text-2xl', badge.achieved ? '' : 'opacity-30 grayscale'].join(' ')}>{badge.emoji}</span>
              <p className={['text-[11px] font-bold leading-tight', badge.achieved ? 'text-white' : 'text-neutral-400'].join(' ')}>
                {badge.label}
              </p>
              <p className={['text-[9px] leading-tight', badge.achieved ? 'text-[#A3E635]' : 'text-neutral-400'].join(' ')}>
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-8">
        <div className="mb-4 flex items-center justify-between px-1">
          <p className="text-sm font-bold tracking-tight text-neutral-900">レスキューヒストリー</p>
          <button type="button" className="text-xs font-semibold text-neutral-400">すべて見る</button>
        </div>

        {history.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400">まだレスキュー履歴はありません</p>
        ) : (
          <div>
            {history.map((reservation) => {
              const product = getProductById(reservation.productId)
              const store = getStoreById(reservation.storeId)
              if (!product) return null
              const displayTitle = product.surpriseBag ? `${store?.name ?? ''}のお楽しみレスキューバッグ` : product.title

              return (
                <div key={reservation.id} className="flex items-center gap-4 border-b border-neutral-100 py-4 last:border-none">
                  <img src={product.image} alt={displayTitle} className="h-16 w-16 flex-shrink-0 rounded-xl bg-neutral-100 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-neutral-900">{store?.name}</p>
                    <p className="mt-0.5 truncate text-xs font-normal text-neutral-500">{displayTitle}</p>
                    {store && (
                      <span className="mt-1.5 w-fit rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-700">
                        {categoryDisplay[store.category]}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end text-right">
                    <span className="font-mono text-[10px] text-neutral-400">
                      {formatHistoryDate(reservation.createdAt)} {reservation.pickupStart}
                    </span>
                    <span className="mt-1 text-sm font-bold text-neutral-900">
                      {formatYen(product.rescuePrice * reservation.quantity)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="mx-4 mt-8">
        <div className="mb-4 flex items-center justify-between px-1">
          <p className="text-sm font-bold tracking-tight text-neutral-900">お気に入り店舗</p>
          <button type="button" className="text-xs font-semibold text-neutral-400">すべて見る</button>
        </div>

        {favoriteStores.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400">お気に入りの店舗はまだありません</p>
        ) : (
          <div className="grid grid-cols-5 gap-3">
            {favoriteStores.map((store) => (
              <div key={store.id} className="flex min-w-0 flex-col items-center">
                <div className="aspect-square w-full overflow-hidden rounded-full border border-neutral-200/60 bg-white p-0.5 shadow-sm">
                  <img src={store.image} alt={store.name} className="h-full w-full rounded-full object-cover" />
                </div>
                <p className="mt-1 w-full truncate text-center text-[10px] font-medium tracking-tight text-neutral-600">{store.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-12 mt-8 border-b border-t border-neutral-100 bg-white">
        {settings.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              type="button"
              className="flex w-full items-center justify-between border-b border-neutral-100 px-4 py-4 text-left last:border-none active:bg-neutral-50"
            >
              <span className="flex items-center gap-3 text-sm font-medium text-neutral-900">
                <Icon className="h-5 w-5 text-neutral-700" />
                {item.label}
              </span>
              <ChevronIcon className="h-4 w-4 text-neutral-300" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
