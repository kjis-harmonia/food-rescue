import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext'
import { useAdminDashboard } from '../../hooks/useAdminDashboard'
import { formatYen } from '../../lib/format'

type ChartRange = 'day' | 'week' | 'month'

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6.5 10.2a5.5 5.5 0 0 1 11 0c0 5 2 5.4 2 6.8h-15c0-1.4 2-1.8 2-6.8ZM10 20h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19.5c.5-4 2.8-6 7-6s6.5 2 7 6" strokeLinecap="round" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19 13.5v-3l-2-.7a7.8 7.8 0 0 0-.7-1.6l.9-1.9-2.1-2.1-1.9.9a7.8 7.8 0 0 0-1.6-.7L10.5 2h-3l-.7 2.4a7.8 7.8 0 0 0-1.6.7l-1.9-.9-2.1 2.1.9 1.9a7.8 7.8 0 0 0-.7 1.6L0 10.5v3l2.4.7c.2.6.4 1.1.7 1.6l-.9 1.9 2.1 2.1 1.9-.9c.5.3 1 .5 1.6.7l.7 2.4h3l.7-2.4c.6-.2 1.1-.4 1.6-.7l1.9.9 2.1-2.1-.9-1.9c.3-.5.5-1 .7-1.6l2.4-.7Z" strokeLinecap="round" strokeLinejoin="round" transform="translate(2 0) scale(.83)" />
    </svg>
  )
}

function TrendUpIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M4 16l6-6 4 4 6-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h5v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const chartPoints: Record<ChartRange, number[]> = {
  day: [20, 35, 28, 48, 40, 60, 52, 70],
  week: [40, 55, 50, 65, 60, 78, 72, 90],
  month: [30, 45, 60, 55, 70, 85, 80, 95],
}

function SalesChart({ range }: { range: ChartRange }) {
  const points = chartPoints[range]
  const max = Math.max(...points)
  const min = Math.min(...points)
  const width = 280
  const height = 100
  const stepX = width / (points.length - 1)

  const coords = points.map((value, index) => {
    const x = index * stepX
    const y = height - ((value - min) / (max - min || 1)) * (height - 16) - 8
    return [x, y]
  })

  const linePath = coords.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`
  const [lastX, lastY] = coords[coords.length - 1]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-28 w-full overflow-visible">
      <defs>
        <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D4436" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0D4436" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#salesFill)" />
      <path d={linePath} fill="none" stroke="#0D4436" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="4" fill="#0D4436" />
      <g transform={`translate(${Math.min(lastX - 36, width - 64)}, ${Math.max(lastY - 26, 0)})`}>
        <rect width="56" height="20" rx="10" fill="#ECFDF3" />
        <text x="28" y="14" textAnchor="middle" fontSize="11" fontWeight="800" fill="#16A34A">
          +18% ↑
        </text>
      </g>
    </svg>
  )
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  return `${Math.floor(hours / 24)}日前`
}

export function AdminHome() {
  const { stores, reservations, getProductById, getStoreById, notifications, createSystemAnnouncement, createCouponBroadcast } =
    useData()
  const [chartRange, setChartRange] = useState<ChartRange>('day')
  const [announcementDraft, setAnnouncementDraft] = useState('')
  const [couponDraft, setCouponDraft] = useState({ code: '', message: '' })
  const platformStats = useAdminDashboard()

  const announcements = useMemo(
    () => notifications.filter((notification) => notification.type === 'announcement' || notification.type === 'coupon'),
    [notifications],
  )

  const handleBroadcastAnnouncement = () => {
    if (!announcementDraft.trim()) return
    createSystemAnnouncement(announcementDraft.trim())
    setAnnouncementDraft('')
  }

  const handleBroadcastCoupon = () => {
    if (!couponDraft.code.trim() || !couponDraft.message.trim()) return
    createCouponBroadcast(couponDraft.code.trim(), couponDraft.message.trim())
    setCouponDraft({ code: '', message: '' })
  }

  const activeReservations = useMemo(() => reservations.filter((r) => r.status !== 'cancelled'), [reservations])
  const pickedUpReservations = useMemo(() => reservations.filter((r) => r.status === 'picked_up'), [reservations])
  const confirmedReservations = useMemo(() => reservations.filter((r) => r.status === 'confirmed'), [reservations])

  const totalSales = activeReservations.reduce((sum, r) => {
    const product = getProductById(r.productId)
    return product ? sum + product.rescuePrice * r.quantity : sum
  }, 0)
  const totalRescued = pickedUpReservations.reduce((sum, r) => sum + r.quantity, 0)

  const endingWithin30 = useMemo(() => {
    const now = new Date()
    return confirmedReservations.filter((r) => {
      const [h, m] = r.pickupEnd.split(':').map(Number)
      const end = new Date()
      end.setHours(h, m, 0, 0)
      let diff = Math.round((end.getTime() - now.getTime()) / 60000)
      if (diff < 0) diff += 24 * 60
      return diff <= 30
    }).length
  }, [confirmedReservations])

  const unconfirmedCount = 1
  const todayTaskTotal = confirmedReservations.length + endingWithin30 + unconfirmedCount

  const kpis = [
    { label: '今日の売上', value: formatYen(totalSales), trend: '+12%', accent: true },
    { label: '受取待ち', value: `${confirmedReservations.length}件` },
    { label: '加盟店', value: `${stores.length}店舗` },
    { label: 'レスキュー', value: `${totalRescued}食` },
  ]

  const newOrders = useMemo(
    () => [...reservations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
    [reservations],
  )

  const storeRanking = platformStats.storeRanking.slice(0, 5)

  return (
    <div className="px-3 py-6 md:px-8 md:py-8">
      {/* 0. Header */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">FOOD RESCUE 本部</p>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="通知" className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 active:scale-[0.97]">
            <BellIcon />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
          <button type="button" aria-label="管理者" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 active:scale-[0.97]">
            <UserIcon />
          </button>
          <button type="button" aria-label="設定" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 active:scale-[0.97]">
            <SettingsIcon />
          </button>
        </div>
      </div>

      {/* 1. 本日対応アラート */}
      <section className="rounded-[28px] bg-[#0D4436] p-6 text-white shadow-[0_8px_30px_rgba(13,68,54,0.18)]">
        <p className="text-xs font-bold uppercase tracking-widest text-white/60">GOOD MORNING</p>
        <p className="mt-1 text-5xl font-black tracking-tighter">{todayTaskTotal}</p>
        <p className="mt-1 text-sm font-bold text-white/80">本日対応のタスクがあります</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-orange-500 px-3.5 py-1.5 text-xs font-black text-white">
            受取待ち {confirmedReservations.length}件
          </span>
          <span className="rounded-full bg-rose-500/90 px-3.5 py-1.5 text-xs font-black text-white">
            あと30分以内 {endingWithin30}件
          </span>
          <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-black text-white">
            未確認 {unconfirmedCount}件
          </span>
        </div>
      </section>

      {/* 2. 今日の数字 */}
      <section className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label}>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">{kpi.label}</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <p className={['text-3xl font-black tracking-tighter md:text-4xl', kpi.accent ? 'text-neutral-900' : 'text-neutral-900'].join(' ')}>
                {kpi.value}
              </p>
              {kpi.trend && (
                <span className="flex items-center gap-0.5 text-xs font-black text-emerald-500">
                  <TrendUpIcon />
                  {kpi.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        {/* 3. 今日の新規注文 */}
        <section className="rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] md:p-5">
          <h2 className="mb-4 text-sm font-black tracking-tight text-neutral-900">今日の新規注文</h2>
          {newOrders.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-400">注文はまだありません。</p>
          ) : (
            <div className="flex flex-col gap-3">
              {newOrders.map((reservation) => {
                const product = getProductById(reservation.productId)
                const store = getStoreById(reservation.storeId)
                if (!product) return null
                const isPickedUp = reservation.status === 'picked_up'
                const isCancelled = reservation.status === 'cancelled'

                return (
                  <div
                    key={reservation.id}
                    className={[
                      'flex items-center gap-3 rounded-2xl px-5 py-3.5',
                      isCancelled ? 'bg-neutral-100' : isPickedUp ? 'bg-[#0D4436]' : 'bg-orange-500',
                    ].join(' ')}
                  >
                    <img src={product.image} alt={product.title} className="h-12 w-12 shrink-0 rounded-xl border-2 border-white/40 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className={['truncate text-sm font-bold', isCancelled ? 'text-neutral-500' : 'text-white'].join(' ')}>
                        {product.title}
                      </p>
                      <p className={['mt-0.5 truncate text-xs', isCancelled ? 'text-neutral-400' : 'text-white/75'].join(' ')}>
                        {store?.name} ・ 受取 {reservation.pickupStart}〜{reservation.pickupEnd}
                      </p>
                      <p className={['mt-0.5 font-mono text-[11px]', isCancelled ? 'text-neutral-400' : 'text-white/60'].join(' ')}>
                        #{reservation.pickupCode}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <p className={['text-sm font-black', isCancelled ? 'text-neutral-600' : 'text-white'].join(' ')}>
                        {formatYen(product.rescuePrice * reservation.quantity)}
                      </p>
                      <span className={['rounded-full px-2.5 py-1 text-[11px] font-black', isCancelled ? 'bg-neutral-200 text-neutral-500' : 'bg-white/20 text-white'].join(' ')}>
                        {isCancelled ? 'キャンセル' : isPickedUp ? '受取済み' : '受取待ち'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <div className="space-y-6">
          {/* 4. 売上サマリー */}
          <section className="rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black tracking-tight text-neutral-900">売上サマリー</h2>
              <div className="flex rounded-full bg-neutral-100 p-0.5">
                {(['day', 'week', 'month'] as ChartRange[]).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setChartRange(range)}
                    className={[
                      'rounded-full px-2.5 py-1 text-[11px] font-bold transition-all duration-200',
                      chartRange === range ? 'bg-[#0D4436] text-white' : 'text-neutral-400',
                    ].join(' ')}
                  >
                    {range === 'day' ? '日次' : range === 'week' ? '週次' : '月次'}
                  </button>
                ))}
              </div>
            </div>
            <SalesChart range={chartRange} />
          </section>

          {/* 4.5 プラットフォーム手数料 */}
          <section className="rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] md:p-5">
            <h2 className="mb-3 text-sm font-black tracking-tight text-neutral-900">プラットフォーム手数料</h2>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">総売上</p>
                <p className="mt-1 text-sm font-black tracking-tight text-neutral-900">{formatYen(platformStats.totalPlatformSales)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">手数料(10%)</p>
                <p className="mt-1 text-sm font-black tracking-tight text-[#0D4436]">{formatYen(platformStats.platformFee)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">加盟店取り分</p>
                <p className="mt-1 text-sm font-black tracking-tight text-neutral-900">{formatYen(platformStats.netToStores)}</p>
              </div>
            </div>
          </section>

          {/* 5. 売上ランキング */}
          <section className="rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] md:p-5">
            <h2 className="mb-3 text-sm font-black tracking-tight text-neutral-900">加盟店 売上ランキング</h2>
            <div className="space-y-3">
              {storeRanking.length === 0 ? (
                <p className="py-6 text-center text-xs text-neutral-400">まだ売上データがありません。</p>
              ) : (
                storeRanking.map(({ store, revenue, mealsRescued }, index) => (
                  <div key={store.id} className="flex items-center gap-3">
                    <span className="w-4 text-center text-xs font-black text-neutral-300">{index + 1}</span>
                    <img src={store.image} alt={store.name} className="h-9 w-9 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-neutral-800">{store.name}</p>
                      <p className="text-[11px] text-neutral-400">累計{mealsRescued.toLocaleString('ja-JP')}食</p>
                    </div>
                    <span className="shrink-0 text-sm font-black tracking-tighter text-neutral-900">{formatYen(revenue)}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 6. お知らせ・クーポン配信 */}
          <section className="rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] md:p-5">
            <h2 className="mb-3 text-sm font-black tracking-tight text-neutral-900">お知らせ配信</h2>
            <div className="flex gap-2">
              <input
                value={announcementDraft}
                onChange={(event) => setAnnouncementDraft(event.target.value)}
                placeholder="全店舗・全ユーザーへのお知らせを入力"
                className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-[#0D4436]"
              />
              <button
                type="button"
                onClick={handleBroadcastAnnouncement}
                className="shrink-0 rounded-xl bg-[#0D4436] px-3 py-2 text-xs font-bold text-white"
              >
                配信
              </button>
            </div>

            <h3 className="mb-2 mt-4 text-xs font-bold text-neutral-500">クーポン配信（シミュレーション）</h3>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  value={couponDraft.code}
                  onChange={(event) => setCouponDraft((current) => ({ ...current, code: event.target.value }))}
                  placeholder="コード (例: RESCUE500)"
                  className="w-32 shrink-0 rounded-xl border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-[#0D4436]"
                />
                <input
                  value={couponDraft.message}
                  onChange={(event) => setCouponDraft((current) => ({ ...current, message: event.target.value }))}
                  placeholder="クーポン内容（例: 500円オフ）"
                  className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-[#0D4436]"
                />
              </div>
              <button
                type="button"
                onClick={handleBroadcastCoupon}
                className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white"
              >
                クーポンを配信
              </button>
            </div>

            <div className="mt-4 space-y-3 border-t border-neutral-100 pt-3">
              {announcements.length === 0 ? (
                <p className="py-4 text-center text-xs text-neutral-400">配信履歴はありません。</p>
              ) : (
                announcements.slice(0, 6).map((item) => (
                  <div key={item.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-black ${
                          item.type === 'coupon' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-500 text-white'
                        }`}
                      >
                        {item.type === 'coupon' ? 'クーポン' : 'お知らせ'}
                      </span>
                      <span className="text-[11px] text-neutral-400">{timeAgo(item.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-xs font-medium leading-snug text-neutral-700">{item.message}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
