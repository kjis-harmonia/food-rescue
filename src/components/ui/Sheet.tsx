import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface SheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Sheet({ open, title, onClose, children }: SheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="presentation"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-[#FBFBFA] shadow-[0_-20px_60px_rgba(0,0,0,0.18)] md:max-h-[80vh] md:rounded-[2rem]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-[#FBFBFA]/95 px-5 py-4 backdrop-blur-md">
              <p className="text-sm font-black tracking-tight text-neutral-900">{title}</p>
              <button
                type="button"
                onClick={onClose}
                aria-label="閉じる"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-all duration-200 active:scale-[0.98]"
              >
                ×
              </button>
            </div>
            <div className="px-5 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
