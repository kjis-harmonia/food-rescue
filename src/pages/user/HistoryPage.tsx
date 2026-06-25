import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { foodWasteKgToCo2Kg, mealsToFoodWasteKg } from '../../lib/eco'
import { formatYen } from '../../lib/format'

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function formatHistoryDate(iso: string) {
  const date = new Date(iso)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}/${m}/${d}`
}

export function HistoryPage() {
  const navigate = useNavigate()
  const { reservations, getProductById, getStoreById } = useData()

  const history = useMemo(
    () =>
      [...reservations]
        .filter((reservation) => reservation.status !== 'cancelled')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reservations],
  )

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
        <h1 className="text-lg font-black tracking-tight text-neutral-900">レスキューヒストリー</h1>
      </div>

      {history.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400">まだレスキュー履歴はありません</p>
      ) : (
        <div className="px-4">
          {history.map((reservation) => {
            const product = getProductById(reservation.productId)
            const store = getStoreById(reservation.storeId)
            if (!product) return null

            const displayTitle = product.surpriseBag ? `${store?.name ?? ''}のお楽しみレスキューバッグ` : product.title
            const savings = (product.normalPrice - product.rescuePrice) * reservation.quantity
            const wasteKg = mealsToFoodWasteKg(reservation.quantity)
            const co2Kg = foodWasteKgToCo2Kg(wasteKg)

            return (
              <div key={reservation.id} className="flex items-center gap-4 border-b border-neutral-100 py-4 last:border-none">
                <img src={product.image} alt={displayTitle} className="h-16 w-16 flex-shrink-0 rounded-xl bg-neutral-100 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-neutral-900">{store?.name}</p>
                  <p className="mt-0.5 truncate text-xs font-normal text-neutral-500">{displayTitle}</p>
                  <p className="mt-1 font-mono text-[10px] text-neutral-400">
                    {formatHistoryDate(reservation.createdAt)} ・ {reservation.status === 'picked_up' ? '受取済み' : '受取待ち'}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold text-emerald-600">
                    🌍 CO2削減 約{co2Kg.toFixed(1)}kg
                  </p>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end text-right">
                  <span className="text-sm font-bold text-neutral-900">{formatYen(product.rescuePrice * reservation.quantity)}</span>
                  <span className="mt-1 text-[11px] font-bold text-[#0D4436]">{formatYen(savings)}お得</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
