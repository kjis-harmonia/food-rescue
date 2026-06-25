import { AnimatePresence, motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import type { Reservation } from '../../lib/types'

interface QrRedeemModalProps {
  reservation: Reservation | null
  title: string
  storeName: string
  onClose: () => void
}

export function QrRedeemModal({ reservation, title, storeName, onClose }: QrRedeemModalProps) {
  return (
    <AnimatePresence>
      {reservation && (
        <motion.div
          role="presentation"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">{storeName}</p>
            <p className="mt-1 px-4 text-base font-black tracking-tight text-neutral-900 break-keep">{title}</p>
            <p className="mt-1 text-xs font-medium text-neutral-500">
              本日 {reservation.pickupStart} 〜 {reservation.pickupEnd}
            </p>

            <div className="mx-2 my-5 flex flex-col items-center justify-center rounded-[2rem] border border-[#0D4436]/5 bg-[#E6F2ED]/40 p-5">
              <div className="flex h-48 w-48 items-center justify-center rounded-2xl bg-white p-4 shadow-sm">
                <QRCodeSVG value={reservation.id} size={160} level="M" />
              </div>
              <span className="mt-4 rounded-full bg-neutral-100 px-3 py-1.5 font-mono text-xs font-bold tracking-widest text-neutral-600">
                {reservation.pickupCode}
              </span>
            </div>

            <p className="mb-4 rounded-xl bg-[#E6F2ED]/60 p-3.5 text-center text-xs font-bold leading-relaxed text-[#0D4436]">
              🎁 お店のスタッフにこの画面を提示してください。スタッフが確認後、商品をお渡しします。
            </p>

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="mt-2 block w-full rounded-2xl bg-neutral-100 py-3.5 text-center text-sm font-bold text-neutral-600 transition-all hover:bg-neutral-200"
            >
              閉じる
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
