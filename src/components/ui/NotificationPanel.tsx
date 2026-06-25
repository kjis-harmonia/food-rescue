import { AnimatePresence, motion } from 'framer-motion'
import { useData } from '../../context/DataContext'
import type { NotificationAudience } from '../../lib/types'

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  return `${Math.floor(hours / 24)}日前`
}

interface NotificationPanelProps {
  audience: NotificationAudience
  open: boolean
  onClose: () => void
  align?: 'left' | 'right'
}

export function NotificationPanel({ audience, open, onClose, align = 'right' }: NotificationPanelProps) {
  const { notifications, markNotificationsRead } = useData()
  const items = notifications.filter((notification) => notification.audience === audience)

  return (
    <AnimatePresence>
      {open && (
        <>
          <div role="presentation" onClick={onClose} className="fixed inset-0 z-[150]" />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full z-[160] mt-2 w-80 max-w-[88vw] overflow-hidden rounded-2xl bg-white text-left shadow-[0_20px_50px_rgba(0,0,0,0.18)] ${align === 'right' ? 'right-0' : 'left-0'}`}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
              <p className="text-sm font-black tracking-tight text-neutral-900">通知</p>
              <button
                type="button"
                onClick={() => markNotificationsRead(audience)}
                className="text-xs font-bold text-[#0D4436]"
              >
                すべて既読にする
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="py-10 text-center text-xs text-neutral-400">通知はありません</p>
              ) : (
                items.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-b border-neutral-50 px-4 py-3 last:border-none ${notification.read ? '' : 'bg-[#E6F2ED]/40'}`}
                  >
                    <p className="text-xs font-bold leading-relaxed text-neutral-800">{notification.message}</p>
                    <p className="mt-1 text-[10px] font-medium text-neutral-400">{timeAgo(notification.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
