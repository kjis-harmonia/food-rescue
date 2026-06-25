import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext'
import { QrRedeemModal } from '../../components/ui/QrRedeemModal'
import { formatYen } from '../../lib/format'

type TabKey = 'active' | 'history'

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MyBag() {
  const { reservations, getProductById, getStoreById, cancelReservation, simulatePickupReminder } = useData()
  const [activeTab, setActiveTab] = useState<TabKey>('active')
  const [qrModalReservationId, setQrModalReservationId] = useState<string | null>(null)

  const sorted = useMemo(
    () => [...reservations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reservations],
  )

  const activeReservations = sorted.filter((r) => r.status === 'confirmed')
  const historyReservations = sorted.filter((r) => r.status !== 'confirmed')
  const visibleReservations = activeTab === 'active' ? activeReservations : historyReservations

  const qrModalReservation = sorted.find((r) => r.id === qrModalReservationId) ?? null
  const qrModalProduct = qrModalReservation ? getProductById(qrModalReservation.productId) : undefined
  const qrModalStore = qrModalReservation ? getStoreById(qrModalReservation.storeId) : undefined
  const qrModalTitle = qrModalProduct
    ? qrModalProduct.surpriseBag
      ? `${qrModalStore?.name ?? ''}のお楽しみレスキューバッグ`
      : qrModalProduct.title
    : ''

  return (
    <div className="min-h-screen bg-[#FBFBFA] pb-24">
      <h1 className="px-4 pb-2 pt-6 text-2xl font-black tracking-tight text-neutral-900">マイバッグ</h1>

      <div className="mx-4 mb-5 flex rounded-xl bg-neutral-100/80 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={
            activeTab === 'active'
              ? 'flex-1 rounded-lg bg-white py-2 text-center text-sm font-bold text-neutral-900 shadow-sm transition-all'
              : 'flex-1 rounded-lg py-2 text-center text-sm font-medium text-neutral-500 transition-all hover:text-neutral-700'
          }
        >
          予約中
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={
            activeTab === 'history'
              ? 'flex-1 rounded-lg bg-white py-2 text-center text-sm font-bold text-neutral-900 shadow-sm transition-all'
              : 'flex-1 rounded-lg py-2 text-center text-sm font-medium text-neutral-500 transition-all hover:text-neutral-700'
          }
        >
          過去の履歴
        </button>
      </div>

      {visibleReservations.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400">
          {activeTab === 'active' ? '予約中のレスキュー品はありません' : '過去の履歴はまだありません'}
        </p>
      ) : (
        <div>
          {visibleReservations.map((reservation) => {
            const product = getProductById(reservation.productId)
            const store = getStoreById(reservation.storeId)
            if (!product) return null

            const displayTitle = product.surpriseBag
              ? `${store?.name ?? ''}のお楽しみレスキューバッグ`
              : product.title
            const isConfirmed = reservation.status === 'confirmed'
            const isCancelled = reservation.status === 'cancelled'

            return (
              <div
                key={reservation.id}
                onClick={() => isConfirmed && setQrModalReservationId(reservation.id)}
                className={[
                  'relative mx-4 mb-4 overflow-hidden rounded-[2rem] border border-neutral-100 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.015)]',
                  isConfirmed ? 'cursor-pointer' : '',
                  isCancelled ? 'opacity-55' : '',
                ].join(' ')}
              >
                <span
                  className={
                    isConfirmed
                      ? 'absolute right-4 top-4 rounded-lg border border-[#0D4436]/10 bg-[#E6F2ED] px-2.5 py-1 text-[11px] font-bold text-[#0D4436]'
                      : 'absolute right-4 top-4 rounded-lg bg-neutral-100 px-2.5 py-1 text-[11px] font-bold text-neutral-400'
                  }
                >
                  {isConfirmed ? '予約済み' : isCancelled ? 'キャンセル済み' : '受取完了'}
                </span>

                <div className="flex items-start gap-4">
                  <img
                    src={product.image}
                    alt={displayTitle}
                    className="h-20 w-20 flex-shrink-0 rounded-2xl bg-neutral-100 object-cover"
                  />
                  <div className="flex flex-1 flex-col pr-16">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">{store?.name}</p>
                    <p className="mt-0.5 text-base font-bold tracking-tight text-neutral-800">{displayTitle}</p>
                    <span className="mt-2 flex w-fit items-center gap-1.5 rounded-lg bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-600">
                      <ClockIcon />
                      {reservation.pickupStart} 〜 {reservation.pickupEnd}
                    </span>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-black text-neutral-900">
                        {formatYen(product.rescuePrice * reservation.quantity)}
                      </span>
                      <span className="text-xs font-medium text-neutral-400">{reservation.quantity}個</span>
                    </div>
                  </div>
                </div>

                {isConfirmed && (
                  <>
                    <div className="mt-3 border-t border-dashed border-neutral-100 pt-3">
                      <p className="text-right text-[11px] font-bold text-[#0D4436]">タップして受取用コードを表示 ＞</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          simulatePickupReminder(reservation.id)
                        }}
                        className="text-[11px] font-medium text-neutral-300 hover:text-neutral-400"
                      >
                        30分前リマインドを試す（デモ）
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          cancelReservation(reservation.id)
                        }}
                        className="text-[11px] font-medium text-neutral-300 hover:text-neutral-400"
                      >
                        予約をキャンセル
                      </button>
                    </div>
                  </>
                )}

                {reservation.status === 'picked_up' && (
                  <p className="mt-3 border-t border-dashed border-neutral-100 pt-3 text-center text-xs text-neutral-400">
                    レスキューにご協力いただき、ありがとうございました。
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <QrRedeemModal
        reservation={qrModalReservation}
        title={qrModalTitle}
        storeName={qrModalStore?.name ?? ''}
        onClose={() => setQrModalReservationId(null)}
      />
    </div>
  )
}
