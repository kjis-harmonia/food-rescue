import { useState } from 'react'
import { useData, type ScanResult } from '../../context/DataContext'
import { useStoreDashboard } from '../../hooks/useStoreDashboard'
import { formatYen, isPickupWindowExpired } from '../../lib/format'
import { CURRENT_STORE_ID } from '../../lib/session'
import type { ReservationStatus } from '../../lib/types'

type Tab = 'active' | 'confirmed' | 'picked_up'

const customerNames = ['田中様', '佐藤様', '鈴木様', '高橋様']

function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 8V5a1 1 0 0 1 1-1h3M4 16v3a1 1 0 0 0 1 1h3M20 8V5a1 1 0 0 0-1-1h-3M20 16v3a1 1 0 0 1-1 1h-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 12h10" strokeLinecap="round" />
    </svg>
  )
}

function CameraScanIcon() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 9V6a1 1 0 0 1 1-1h3M6 23v3a1 1 0 0 0 1 1h3M26 9V6a1 1 0 0 0-1-1h-3M26 23v3a1 1 0 0 1-1 1h-3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="9" y="11" width="14" height="10" rx="2.5" />
      <circle cx="16" cy="16" r="3" />
      <path d="M13.5 11l.8-1.6h3.4l.8 1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

export function StoreReservations() {
  const { reservations, getProductById, getStoreById, markPickedUp } = useData()
  const [tab, setTab] = useState<Tab>('confirmed')
  const [scanningId, setScanningId] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const stats = useStoreDashboard(CURRENT_STORE_ID)
  const store = getStoreById(CURRENT_STORE_ID)

  const dashboardCards = [
    { label: '本日の売上', value: formatYen(stats.todayRevenue), trend: `本日 ${stats.todayMealsRescued}食分`, kind: 'default' as const },
    { label: '受取待ち', value: `${stats.pendingPickupCount} 件`, trend: 'QR確認待ち', kind: 'default' as const },
    { label: '救った食事', value: `${stats.totalMealsRescued} 食`, trend: `廃棄削減 約${stats.foodWasteSavedKg}kg`, kind: 'rescue' as const },
    { label: '店舗評価', value: (store?.rating ?? 4.9).toFixed(1), trend: '(128件のレビュー)', kind: 'muted' as const },
  ]

  const storeReservations = reservations
    .filter((reservation) => reservation.storeId === CURRENT_STORE_ID)
    .sort((a, b) => {
      const aTime = new Date(a.pickedUpAt ?? a.createdAt).getTime()
      const bTime = new Date(b.pickedUpAt ?? b.createdAt).getTime()
      return bTime - aTime
    })

  const statusForTab: Record<Tab, ReservationStatus | null> = { active: null, confirmed: 'confirmed', picked_up: 'picked_up' }
  const shownReservations = statusForTab[tab]
    ? storeReservations.filter((reservation) => reservation.status === statusForTab[tab])
    : storeReservations.filter((reservation) => reservation.status !== 'cancelled')

  const confirmedCount = storeReservations.filter((r) => r.status === 'confirmed').length
  const activeCount = storeReservations.filter((r) => r.status !== 'cancelled').length
  const pickedUpCount = storeReservations.filter((r) => r.status === 'picked_up').length

  const scanningReservation = storeReservations.find((r) => r.id === scanningId)
  const scanningProduct = scanningReservation ? getProductById(scanningReservation.productId) : undefined

  const handleScanLaunch = () => {
    const nextConfirmed = storeReservations.find((r) => r.status === 'confirmed')
    if (nextConfirmed) {
      setScanResult(null)
      setScanningId(nextConfirmed.id)
    }
  }

  const finishPickup = (reservationId: string) => {
    const result = markPickedUp(reservationId)
    if (!result.ok) {
      setScanResult(result)
      return
    }
    setScanningId(null)
    setScanResult(null)
    setTab('picked_up')
  }

  const isExpired = scanningProduct ? isPickupWindowExpired(scanningProduct.pickupEnd) : false

  return (
    <div>
      <div className="relative mx-4 mt-4 flex min-h-[240px] flex-col justify-between overflow-hidden rounded-3xl bg-[#0D4436] p-6 text-white shadow-lg">
        <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-1">
          <p className="text-[10px] font-bold tracking-widest text-[#A3E635]">受取確認</p>
          <p className="mt-1 text-xl font-bold leading-snug text-white">
            来店客のQRコードを
            <br />
            読み取る
          </p>
        </div>

        <button
          type="button"
          onClick={handleScanLaunch}
          className="relative flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-white py-6 text-sm font-black text-[#0D4436] shadow-md transition-all duration-200 active:scale-[0.97]"
        >
          <CameraScanIcon />
          カメラを起動する
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {dashboardCards.map((card) => (
          <div
            key={card.label}
            className="flex h-32 w-36 flex-shrink-0 flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.02)]"
          >
            <p className={`text-[10px] font-bold uppercase tracking-wider ${card.kind === 'rescue' ? 'text-[#0D4436]' : 'text-neutral-400'}`}>
              {card.label}
            </p>
            <p className={`mt-1 text-2xl font-black tracking-tighter ${card.kind === 'rescue' ? 'text-[#0D4436]' : 'text-neutral-900'}`}>
              {card.value}
            </p>
            {card.kind === 'rescue' ? (
              <span className="mt-auto w-fit rounded-md bg-[#0D4436] px-1.5 py-0.5 text-[9px] font-bold text-[#A3E635]">
                {card.trend}
              </span>
            ) : (
              <p className={`mt-auto text-[9px] font-medium ${card.kind === 'muted' ? 'text-neutral-400' : 'text-emerald-600'}`}>
                {card.trend}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mx-4 my-2 grid grid-cols-3 rounded-xl bg-neutral-100 p-1 text-center">
        <button
          type="button"
          onClick={() => setTab('confirmed')}
          className={
            tab === 'confirmed'
              ? 'flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#0D4436] py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 active:scale-[0.98] active:opacity-90'
              : 'flex cursor-pointer items-center justify-center gap-1 py-2.5 text-xs font-bold text-neutral-500 transition-all duration-200 active:scale-[0.98] active:opacity-90'
          }
        >
          予約一覧
          {tab === 'confirmed' && (
            <span className="rounded-full bg-[#A3E635] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#0D4436]">
              {confirmedCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab('active')}
          className={
            tab === 'active'
              ? 'flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#0D4436] py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 active:scale-[0.98] active:opacity-90'
              : 'flex cursor-pointer items-center justify-center gap-1 py-2.5 text-xs font-bold text-neutral-500 transition-all duration-200 active:scale-[0.98] active:opacity-90'
          }
        >
          {tab === 'active' ? (
            <>
              販売中
              <span className="rounded-full bg-[#A3E635] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#0D4436]">
                {activeCount}
              </span>
            </>
          ) : (
            `販売中(${activeCount})`
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab('picked_up')}
          className={
            tab === 'picked_up'
              ? 'flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#0D4436] py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 active:scale-[0.98] active:opacity-90'
              : 'flex cursor-pointer items-center justify-center gap-1 py-2.5 text-xs font-bold text-neutral-500 transition-all duration-200 active:scale-[0.98] active:opacity-90'
          }
        >
          {tab === 'picked_up' ? (
            <>
              受取完了
              <span className="rounded-full bg-[#A3E635] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#0D4436]">
                {pickedUpCount}
              </span>
            </>
          ) : (
            `受取完了(${pickedUpCount})`
          )}
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-32">
        {shownReservations.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-400">この一覧に表示する予約はありません。</p>
        ) : (
          shownReservations.map((reservation, index) => {
            const product = getProductById(reservation.productId)
            if (!product) return null
            const customerName = customerNames[index % customerNames.length]
            const isWaiting = reservation.status === 'confirmed'

            return (
              <button
                key={reservation.id}
                type="button"
                onClick={() => isWaiting && setScanningId(reservation.id)}
                className="flex cursor-pointer items-center justify-between rounded-2xl bg-white p-4 text-left shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all duration-200 active:scale-[0.98] active:bg-neutral-50"
              >
                <div className="flex min-w-0 flex-1 items-center">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-neutral-200/40 bg-neutral-100 font-sans text-sm font-bold text-neutral-600">
                    {customerName.slice(0, 1)}
                  </span>
                  <div className="mx-3 flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-bold tracking-tight text-neutral-900">{customerName}</p>
                    <p className="mt-0.5 truncate text-xs font-normal text-neutral-500">
                      {reservation.pickupStart} 受取 ・ {product.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] tracking-tight text-neutral-400">
                      ID: #{reservation.pickupCode}
                    </p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-1.5 text-right">
                  <p className="text-sm font-black tracking-tight text-neutral-900">
                    {formatYen(product.rescuePrice * reservation.quantity)}
                  </p>
                  {isWaiting ? (
                    <span className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-700">
                      QR確認待ち
                    </span>
                  ) : (
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      受取完了
                      {reservation.pickedUpAt &&
                        ` ${new Date(reservation.pickedUpAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>

      {scanningReservation && scanningProduct && (
        <div
          role="presentation"
          onClick={() => {
            setScanningId(null)
            setScanResult(null)
          }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-t-[2rem] bg-[#FBFBFA] p-6 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.18)]"
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-black tracking-tight text-neutral-900">受け取りを確認</p>
              <button
                type="button"
                onClick={() => {
                  setScanningId(null)
                  setScanResult(null)
                }}
                aria-label="閉じる"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-all duration-200 active:scale-[0.98] active:opacity-90"
              >
                <CloseIcon />
              </button>
            </div>

            {scanResult && !scanResult.ok && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
                <p className="text-base font-black text-red-600">
                  {scanResult.reason === 'already_used' && '⚠️ このチケットは使用済みです（二重受取エラー）'}
                  {scanResult.reason === 'cancelled' && '⚠️ キャンセル済みの注文です'}
                  {scanResult.reason === 'not_found' && '⚠️ チケットが見つかりません'}
                </p>
              </div>
            )}

            {isExpired && (!scanResult || scanResult.ok) && (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-center">
                <p className="text-xs font-bold text-amber-700">⏰ 受取予定時間（{scanningProduct.pickupEnd}）を過ぎています</p>
              </div>
            )}

            <div className="flex items-center justify-center rounded-2xl border border-[#0D4436]/10 bg-[#E6F2ED]/40 py-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0D4436] text-white">
                <ScanIcon />
              </div>
            </div>

            <p className="mt-4 text-center font-mono text-xs font-bold tracking-widest text-neutral-500">
              #{scanningReservation.pickupCode}
            </p>
            <p className="mt-1 text-center text-sm font-bold text-neutral-900">{scanningProduct.title}</p>
            <p className="mt-4 text-center text-xs leading-relaxed text-neutral-500">
              受取完了後、売上はStripe送金対象へ移動します。
            </p>

            <button
              type="button"
              onClick={() => finishPickup(scanningReservation.id)}
              className="mt-6 w-full cursor-pointer rounded-2xl bg-[#0D4436] py-4 text-sm font-black text-white shadow-[0_4px_12px_rgba(13,68,54,0.2)] transition-all duration-200 hover:bg-[#0A3329] active:scale-[0.98] active:opacity-90"
            >
              受取完了にする
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
