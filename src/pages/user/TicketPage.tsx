import { AnimatePresence, motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ConfettiBurst } from '../../components/ui/ConfettiBurst'
import { useData } from '../../context/DataContext'
import { formatYen } from '../../lib/format'

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.2" />
    </svg>
  )
}

function HeartCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M7.5 12.5l3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TicketPage() {
  const { reservationId } = useParams<{ reservationId: string }>()
  const { reservations, getProductById, getStoreById, markPickedUp, endProduct } = useData()

  const reservation = reservations.find((r) => r.id === reservationId)

  if (!reservation) {
    return <Navigate to="/bag" replace />
  }

  const product = getProductById(reservation.productId)
  const store = getStoreById(reservation.storeId)
  const displayTitle = product?.surpriseBag ? `${store?.name ?? ''}のお楽しみレスキューバッグ` : product?.title
  const isPickedUp = reservation.status === 'picked_up'

  const handleStoreScan = () => {
    const result = markPickedUp(reservation.id)
    if (!result.ok) {
      if (result.reason === 'already_used') alert('⚠️ このチケットは使用済みです（二重受取エラー）')
      else if (result.reason === 'cancelled') alert('⚠️ キャンセル済みの注文です')
      return
    }
    if (product) endProduct(product.id)
  }

  const mapsHref = store?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`
    : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-white px-5 pb-32 pt-10 text-center"
    >
      {!isPickedUp && <ConfettiBurst />}

      <p className="text-sm font-bold tracking-tighter text-[#0D4436]">予約完了</p>
      <h1 className="mt-1 text-2xl font-black tracking-tighter text-neutral-900">レスキュー成立！🎉</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {store?.name} ・ {displayTitle}
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="relative mx-auto mt-7 max-w-xs overflow-hidden rounded-[24px] bg-white shadow-xl"
      >
        <div className="flex flex-col items-center px-6 pt-7">
          <AnimatePresence mode="wait">
            {isPickedUp ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="flex h-44 w-44 flex-col items-center justify-center gap-2 rounded-2xl bg-[#E6F2ED] text-[#0D4436]"
              >
                <HeartCheckIcon />
                <p className="px-4 text-sm font-black tracking-tighter">受け取りありがとうございました。</p>
              </motion.div>
            ) : (
              <motion.span
                key="qr"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-44 w-44 items-center justify-center rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
              >
                <QRCodeSVG value={reservation.id} size={144} level="M" />
              </motion.span>
            )}
          </AnimatePresence>
          <span className="mt-4 rounded-full bg-neutral-100 px-3 py-1.5 font-mono text-xs font-bold tracking-widest text-neutral-600">
            {reservation.pickupCode}
          </span>
        </div>

        <div className="relative my-5 px-6">
          <div className="border-t border-dashed border-neutral-200" />
          <span className="absolute -left-[26px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white" />
          <span className="absolute -right-[26px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white" />
        </div>

        <div className="px-6 pb-7">
          {product && (
            <p className="mb-3 text-sm font-bold tracking-tighter text-neutral-800">
              {formatYen(product.rescuePrice * reservation.quantity)}（{reservation.quantity}個）
            </p>
          )}
          <p className="mb-3 text-xs text-neutral-400">
            受取 {reservation.pickupStart} 〜 {reservation.pickupEnd}
          </p>
          <motion.span
            layout
            className={[
              'inline-block rounded-full px-4 py-1.5 text-xs font-black tracking-tighter',
              isPickedUp ? 'bg-[#E6F2ED] text-[#0D4436]' : 'bg-orange-50 text-orange-600',
            ].join(' ')}
          >
            {isPickedUp ? '[ ✅ 受取済み ]' : '[ 🕒 未受取 ]'}
          </motion.span>
        </div>
      </motion.div>

      <p className="mx-auto mt-6 max-w-xs text-sm font-bold tracking-tighter text-neutral-700">
        {isPickedUp ? 'またのご利用をお待ちしています。' : '店舗スタッフへこのQRをご提示ください。'}
      </p>
      {!isPickedUp && (
        <p className="mt-1 text-xs leading-relaxed text-neutral-400">
          スタッフがQRコードを確認後、商品をお渡しします。
        </p>
      )}

      {mapsHref && (
        <a
          href={mapsHref}
          target="_blank"
          rel="noreferrer"
          className="mx-auto mt-6 flex max-w-xs items-center gap-3 rounded-2xl bg-neutral-50 p-3.5 text-left transition-all duration-200 active:scale-[0.98]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0D4436] text-white">
            <MapPinIcon />
          </span>
          <span className="flex-1">
            <span className="block text-xs font-bold tracking-tighter text-neutral-800">店舗までのルート</span>
            <span className="block text-[11px] text-neutral-400">{store?.address}</span>
          </span>
          <span className="text-xs font-bold text-[#0D4436]">経路 ＞</span>
        </a>
      )}

      <div className="mt-6 flex flex-col gap-2.5">
        {!isPickedUp && (
          <button
            type="button"
            onClick={handleStoreScan}
            className="w-full rounded-2xl border border-dashed border-neutral-300 bg-white py-3.5 text-sm font-bold tracking-tighter text-neutral-400 transition-all duration-200 active:scale-[0.98]"
          >
            【店舗側】QRスキャン（デモ）
          </button>
        )}
        <motion.div whileTap={{ scale: 0.97 }}>
          <Link
            to="/bag"
            className="block w-full rounded-2xl bg-[#0D4436] py-4 text-[15px] font-black tracking-tighter text-white shadow-sm transition-all duration-300 hover:bg-[#0a3328]"
          >
            マイバッグで確認する
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
