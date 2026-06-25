import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useStoreDashboard } from '../../hooks/useStoreDashboard'
import { formatYen } from '../../lib/format'
import { CURRENT_STORE_ID } from '../../lib/session'
import { RescueForm } from './ProductForm'

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
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

const todayLabel = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' })
  .format(new Date())
  .toUpperCase()

export function StoreHome() {
  const { getStoreById, getProductsByStore, reservations } = useData()
  const [showForm, setShowForm] = useState(false)
  const store = getStoreById(CURRENT_STORE_ID)
  const products = getProductsByStore(CURRENT_STORE_ID)
  const activeProducts = products.filter((product) => product.status === 'active')
  const storeReservations = reservations.filter((reservation) => reservation.storeId === CURRENT_STORE_ID)
  const activeReservationCount = storeReservations.filter((reservation) => reservation.status !== 'cancelled').length
  const stats = useStoreDashboard(CURRENT_STORE_ID)

  return (
    <div className="px-4 pb-32 pt-5">
      <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">TODAY, {todayLabel}</p>
      <h1 className="mt-0.5 text-xl font-black tracking-tight text-neutral-900">{store?.name ?? 'BAKERY MORI'} 様</h1>
      <p className="mt-1 text-xs font-medium text-neutral-500">本日のレスキュー状況です。</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="flex h-24 flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">本日の売上</p>
          <p className="text-2xl font-black tracking-tighter text-neutral-900">{formatYen(stats.todayRevenue)}</p>
          <span className="w-fit rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
            本日 {stats.todayMealsRescued}食分
          </span>
        </div>

        <div className="flex h-24 flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">予約</p>
          <p className="text-2xl font-black tracking-tighter text-neutral-900">{activeReservationCount} 件</p>
          <p className="text-xs font-medium text-neutral-500">うち受取待ち {stats.pendingPickupCount}件</p>
        </div>

        <div className="flex h-24 flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">レスキュー</p>
          <p className="text-2xl font-black tracking-tighter text-[#0D4436]">{stats.totalMealsRescued} 食</p>
          <p className="text-xs font-semibold text-[#0D4436]">廃棄削減 約{stats.foodWasteSavedKg}kg</p>
        </div>

        <div className="flex h-24 flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">評価</p>
          <p className="text-2xl font-black tracking-tighter text-neutral-900">{(store?.rating ?? 4.9).toFixed(1)}</p>
          <p className="text-xs font-medium text-neutral-500">(128件のレビュー)</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0D4436] py-4 text-sm font-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all duration-200 active:scale-[0.98]"
      >
        <PlusIcon />
        レスキューバッグを出品
      </button>

      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">現在出品中</h2>
        <Link to="/store/products" className="text-xs font-bold uppercase tracking-wider text-neutral-400">すべて見る</Link>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {activeProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400">現在出品中の商品はありません。</p>
        ) : (
          activeProducts.map((product) => {
            const booked = storeReservations
              .filter((reservation) => reservation.productId === product.id && reservation.status !== 'cancelled')
              .reduce((sum, reservation) => sum + reservation.quantity, 0)
            return (
              <div key={product.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
                <img src={product.image} alt={product.title} className="h-16 w-16 flex-shrink-0 rounded-xl object-cover" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm font-bold text-neutral-900">{product.title}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs font-medium text-neutral-500">
                    残り{product.quantityLeft}個 ・ {booked}件予約済み
                  </p>
                  <p className="mt-0.5 text-sm font-black tracking-tight text-neutral-900">{formatYen(product.rescuePrice)}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">人気商品ランキング</h2>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {stats.topProducts.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-400">まだ予約データがありません。</p>
        ) : (
          stats.topProducts.map((entry, index) => (
            <div
              key={entry.product.id}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_4px_16px_rgba(0,0,0,0.02)]"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#E6F2ED] text-xs font-black text-[#0D4436]">
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate text-sm font-bold text-neutral-900">{entry.product.title}</p>
                <p className="mt-0.5 text-xs font-medium text-neutral-500">
                  {entry.orderCount}件予約 ・ {entry.quantitySold}個販売
                </p>
              </div>
              <p className="flex-shrink-0 text-sm font-black tracking-tight text-neutral-900">{formatYen(entry.revenue)}</p>
            </div>
          ))
        )}
      </div>

      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">曜日別レスキュー数</h2>
      </div>

      <div className="mt-3 flex h-32 items-end gap-2 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
        {(() => {
          const maxQuantity = Math.max(1, ...stats.weekdaySeries.map((day) => day.quantity))
          return stats.weekdaySeries.map((day) => (
            <div key={day.label} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-20 w-full items-end">
                <div
                  className="w-full rounded-md bg-[#0D4436]"
                  style={{ height: `${Math.max(4, (day.quantity / maxQuantity) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-neutral-400">{day.label}</span>
            </div>
          ))
        })()}
      </div>

      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">時間帯別レスキュー数</h2>
      </div>

      {stats.hourlySeries.length === 0 ? (
        <p className="mt-3 py-6 text-center text-sm text-neutral-400">まだ予約データがありません。</p>
      ) : (
        <div className="mt-3 flex h-32 items-end gap-2 overflow-x-auto rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
          {(() => {
            const maxQuantity = Math.max(1, ...stats.hourlySeries.map((hour) => hour.quantity))
            return stats.hourlySeries.map((hour) => (
              <div key={hour.hour} className="flex h-full min-w-9 flex-1 flex-col items-center gap-1.5">
                <div className="flex h-20 w-full items-end">
                  <div
                    className="w-full rounded-md bg-[#A3E635]"
                    style={{ height: `${Math.max(4, (hour.quantity / maxQuantity) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-neutral-400">{hour.label}</span>
              </div>
            ))
          })()}
        </div>
      )}

      {showForm && (
        <div
          role="presentation"
          onClick={() => setShowForm(false)}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-[#FBFBFA] shadow-[0_-20px_60px_rgba(0,0,0,0.18)]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-[#FBFBFA]/95 px-5 py-4 backdrop-blur-md">
              <p className="text-sm font-black tracking-tight text-neutral-900">レスキューバッグを出品</p>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="閉じる"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-all duration-200 active:scale-[0.98]"
              >
                <CloseIcon />
              </button>
            </div>
            <RescueForm onComplete={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
