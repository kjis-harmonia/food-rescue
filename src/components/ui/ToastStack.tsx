import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useData } from '../../context/DataContext'
import type { NotificationType } from '../../lib/types'

const accentByType: Record<NotificationType, string> = {
  new_product: 'border-l-[#0D4436]',
  reservation: 'border-l-orange-500',
  pickup_reminder: 'border-l-amber-500',
  soldout: 'border-l-[#A3E635]',
  cancellation: 'border-l-red-400',
  pickup_complete: 'border-l-emerald-500',
  announcement: 'border-l-indigo-500',
  coupon: 'border-l-amber-400',
}

const TOAST_LIFESPAN_MS = 4500

export function ToastStack() {
  const { toasts, dismissToast } = useData()

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[200] flex w-full max-w-[320px] flex-col gap-2.5">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} type={toast.type} message={toast.message} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function Toast({
  type,
  message,
  onDismiss,
}: {
  type: NotificationType
  message: string
  onDismiss: () => void
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, TOAST_LIFESPAN_MS)
    return () => window.clearTimeout(timer)
  }, [onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      onClick={onDismiss}
      className={`pointer-events-auto cursor-pointer rounded-2xl border-l-4 bg-white p-3.5 text-left shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${accentByType[type]}`}
    >
      <p className="text-xs font-bold leading-relaxed text-neutral-800">{message}</p>
    </motion.div>
  )
}
