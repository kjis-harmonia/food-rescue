import { motion } from 'framer-motion'
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { CheckoutModal } from '../../components/ui/CheckoutModal'
import { useData } from '../../context/DataContext'
import { formatDistance, formatYen } from '../../lib/format'
import type { PaymentMethod } from '../../lib/types'

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6">
      <path d="M12 20.5s-7.5-4.6-9.8-9.2C.6 7.8 2.4 4.2 6 3.6c2-.3 3.8.6 6 2.9 2.2-2.3 4-3.2 6-2.9 3.6.6 5.4 4.2 3.8 7.7-2.3 4.6-9.8 9.2-9.8 9.2z" />
    </svg>
  )
}

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3.5 8.5 12 4l8.5 4.5L12 13Z" strokeLinejoin="round" />
      <path d="M3.5 8.5V16l8.5 4.5 8.5-4.5V8.5M12 13v7.5" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
      <path d="M4 10h16M8 3.5v3M16 3.5v3" strokeLinecap="round" />
    </svg>
  )
}

function AllergyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9.5h.01M15 9.5h.01M8.5 14.5c1 1 2.2 1.5 3.5 1.5s2.5-.5 3.5-1.5" strokeLinecap="round" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3.5 19 6v6c0 4.5-3 7.5-7 8.5-4-1-7-4-7-8.5V6Z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CancelIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l-2.3 1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.2" />
    </svg>
  )
}

function QrTinyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M15 15h2v2h-2zM18 18h2v2h-2z" />
    </svg>
  )
}

const trustItems = [
  { icon: <ShieldIcon />, label: '事前決済のみ・店舗での後払いなし' },
  { icon: <CancelIcon />, label: 'キャンセルは受取開始30分前まで無料' },
  { icon: <QrTinyIcon />, label: '受取はQRコードの提示だけで完了' },
]

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getProductById, getStoreById, toggleFavorite, isFavorite, createReservation } = useData()
  const product = id ? getProductById(id) : undefined
  const [quantity, setQuantity] = useState(1)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  if (!product) {
    return <Navigate to="/products" replace />
  }

  const store = getStoreById(product.storeId)
  const isSoldOut = product.status !== 'active' || product.quantityLeft <= 0
  const favorite = isFavorite(product.id)
  const maxQuantity = Math.min(product.quantityLeft, 5)
  const savings = product.normalPrice - product.rescuePrice
  const displayTitle = product.surpriseBag ? `${store?.name ?? ''}のお楽しみレスキューバッグ` : product.title
  const mapsHref = store?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`
    : undefined

  const handlePaymentSuccess = (paymentIntentId: string, method: PaymentMethod) => {
    setIsCheckoutOpen(false)
    const reservation = createReservation(product.id, quantity, paymentIntentId, method)
    navigate(`/tickets/${reservation.id}`, { replace: true })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white pb-32"
    >
      <div className="relative">
        <img src={product.image} alt={displayTitle} className="aspect-[4/3] w-full object-cover" />

        <button
          type="button"
          onClick={() => navigate('/products')}
          aria-label="戻る"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-neutral-800 shadow-sm backdrop-blur-sm"
        >
          <BackArrowIcon />
        </button>

        <motion.button
          type="button"
          aria-label="お気に入りに追加"
          whileTap={{ scale: 1.3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          onClick={() => toggleFavorite(product.id)}
          className={[
            'absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur-sm',
            favorite ? 'text-[#FF6B35]' : 'text-neutral-800',
          ].join(' ')}
        >
          <HeartIcon active={favorite} />
        </motion.button>
      </div>

      <div className="px-5 pt-5">
        <h1 className="text-2xl font-black tracking-tighter text-neutral-900">{displayTitle}</h1>

        <div className="mt-2.5 flex items-center gap-2">
          <img src={store?.image} alt={store?.name} className="h-6 w-6 rounded-full object-cover" />
          <span className="text-sm font-medium text-neutral-600">{store?.name}</span>
          <span className="text-neutral-300">・</span>
          <span className="text-sm font-medium text-neutral-500">{formatDistance(store?.distanceKm ?? 0)}</span>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#E6F2ED] px-4 py-3.5 text-[#0D4436]">
          <ClockIcon />
          <span className="text-lg font-black tracking-tighter">受取 {product.pickupStart}〜{product.pickupEnd}</span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-neutral-500">
          {product.surpriseBag ? product.surpriseHint : product.description}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-neutral-50 p-3">
          <div className="flex flex-col items-center gap-1 text-center">
            <BoxIcon />
            <span className="text-[11px] font-medium text-neutral-500">残り{product.quantityLeft}個</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <CalendarIcon />
            <span className="text-[11px] font-medium text-neutral-500">当日中にお召し上がりください</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <AllergyIcon />
            <span className="text-[11px] font-medium text-neutral-500">アレルギーは店舗にご確認ください</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="my-6 rounded-2xl bg-neutral-50 p-5"
        >
          <div className="flex items-baseline gap-2 tracking-tighter">
            <span className="text-base text-neutral-400 line-through">{formatYen(product.normalPrice)}</span>
            <span className="text-neutral-400">➔</span>
            <span className="text-3xl font-black text-neutral-900">{formatYen(product.rescuePrice)}</span>
          </div>
          {!isSoldOut && (
            <span className="mt-2 inline-block rounded-md bg-[#0D4436] px-2 py-1 text-xs font-black text-white">
              {formatYen(savings)}お得
            </span>
          )}

          {!isSoldOut && (
            <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
              <span className="text-xs font-bold text-neutral-400">数量</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm text-neutral-600 transition-transform duration-150 active:scale-90 disabled:opacity-30"
                >
                  −
                </button>
                <span className="min-w-4 text-center text-sm font-black tracking-tighter">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  disabled={quantity >= maxQuantity}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm text-neutral-600 transition-transform duration-150 active:scale-90 disabled:opacity-30"
                >
                  ＋
                </button>
              </div>
            </div>
          )}
        </motion.div>

        <div className="flex flex-col gap-2.5">
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 text-xs font-medium text-neutral-500">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                {item.icon}
              </span>
              {item.label}
            </div>
          ))}
        </div>

        {store && (
          <div className="mt-6 rounded-2xl border border-neutral-100 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">お店について</p>
            <p className="mt-1.5 text-sm font-bold tracking-tight text-neutral-900">{store.name}</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-500">{store.description}</p>

            {mapsHref && (
              <a
                href={mapsHref}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center gap-3 rounded-2xl bg-neutral-50 p-3.5 text-left transition-all duration-200 active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0D4436] text-white">
                  <MapPinIcon />
                </span>
                <span className="flex-1">
                  <span className="block text-xs font-bold tracking-tighter text-neutral-800">店舗までのルート</span>
                  <span className="block text-[11px] text-neutral-400">{store.address}</span>
                </span>
                <span className="text-xs font-bold text-[#0D4436]">経路 ＞</span>
              </a>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex h-[72px] max-w-[480px] items-center border-t border-neutral-100 bg-white/80 px-5 backdrop-blur-md [padding-bottom:env(safe-area-inset-bottom)]">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          disabled={isSoldOut}
          onClick={() => setIsCheckoutOpen(true)}
          className="w-full rounded-2xl bg-[#0D4436] py-4 text-base font-black tracking-tighter text-white shadow-[0_4px_12px_rgba(13,68,54,0.2)] transition-all duration-300 hover:bg-[#0A3329] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none"
        >
          {isSoldOut ? '受付終了しました' : `レスキューを確定する（${formatYen(product.rescuePrice * quantity)}）`}
        </motion.button>
      </div>

      <CheckoutModal
        open={isCheckoutOpen}
        amount={product.rescuePrice * quantity}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </motion.div>
  )
}
