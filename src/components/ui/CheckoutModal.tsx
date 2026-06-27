import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { formatYen } from '../../lib/format'
import { simulateTestModeCharge, simulateWalletCharge } from '../../lib/stripe'
import type { PaymentMethod } from '../../lib/types'

interface CheckoutModalProps {
  open: boolean
  amount: number
  onClose: () => void
  onSuccess: (paymentIntentId: string, method: PaymentMethod) => void
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 19)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

// ── Premium SVG brand marks ──────────────────────────────────────────────────

function IconCard({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="5" width="18" height="3" fill="currentColor" opacity="0.25" />
      <rect x="4" y="11" width="5" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

function IconApple({ className, color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

// Google "G" colorful logo
function IconGoogleG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// Google Pay tab badge (14px icon)
function IconGooglePayBadge({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="16" height="16" rx="4" fill="white" />
      <rect width="16" height="16" rx="4" stroke="#E0E0E0" strokeWidth="0.75" />
      <path d="M13.28 8.15c0-.47-.04-.92-.12-1.35H8v2.55h2.96c-.13.82-.62 1.52-1.33 1.99v1.66h2.14c1.25-1.15 1.97-2.84 1.97-4.85z" fill="#4285F4" />
      <path d="M8 14c1.48 0 2.73-.49 3.63-1.33l-2.14-1.66c-.59.4-1.34.63-1.49.63-1.72 0-3.18-1.16-3.7-2.72H2.1v1.71C3 12.73 5.3 14 8 14z" fill="#34A853" />
      <path d="M4.3 9.5c-.13-.4-.21-.82-.21-1.25 0-.44.08-.86.21-1.25V5.29H2.1C1.6 6.21 1.3 7.07 1.3 8s.3 1.79.8 2.71L4.3 9.5z" fill="#FBBC05" />
      <path d="M8 4.28c.97 0 1.84.33 2.52.99l1.89-1.89C11.27 2.25 9.78 1.6 8 1.6 5.3 1.6 3 2.87 2.1 4.71l2.2 1.71C4.82 5.24 6.28 4.28 8 4.28z" fill="#EA4335" />
    </svg>
  )
}

// Apple Pay mark (center panel)
function ApplePayMark() {
  return (
    <div className="flex items-center gap-3">
      <IconApple className="h-10 w-auto" color="white" />
      <span
        className="text-[2.2rem] font-thin tracking-tight text-white"
        style={{ fontFamily: "-apple-system, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", fontWeight: 300 }}
      >
        Pay
      </span>
    </div>
  )
}

// Google Pay mark (center panel)
function GooglePayMark() {
  return (
    <div className="flex items-center gap-3">
      <IconGoogleG className="h-11 w-11" />
      <span
        className="text-[2.2rem] font-light tracking-tight text-neutral-700"
        style={{ fontFamily: "'Google Sans', 'Roboto', Arial, sans-serif", fontWeight: 300 }}
      >
        Pay
      </span>
    </div>
  )
}

// ── Tab options ──────────────────────────────────────────────────────────────

const methodOptions: { key: PaymentMethod; label: string }[] = [
  { key: 'credit_card', label: 'カード' },
  { key: 'apple_pay', label: 'Apple Pay' },
  { key: 'google_pay', label: 'Google Pay' },
]

const walletProcessingLabel: Record<'apple_pay' | 'google_pay', string> = {
  apple_pay: 'Apple Payで認証中...',
  google_pay: 'Google Payで認証中...',
}

// ── Component ────────────────────────────────────────────────────────────────

export function CheckoutModal({ open, amount, onClose, onSuccess }: CheckoutModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('credit_card')
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [expiry, setExpiry] = useState('12/30')
  const [cvc, setCvc] = useState('123')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleClose = () => {
    if (isProcessing) return
    setError('')
    onClose()
  }

  const handleSelectMethod = (next: PaymentMethod) => {
    if (isProcessing) return
    setError('')
    setMethod(next)
  }

  const handleSubmit = async () => {
    if (isProcessing) return
    setError('')
    setIsProcessing(true)

    const result =
      method === 'credit_card'
        ? await simulateTestModeCharge({ cardNumber, expiry, cvc }, amount)
        : await simulateWalletCharge(method, amount)

    if (!result.success) {
      setError(result.error)
      setIsProcessing(false)
      return
    }

    onSuccess(result.paymentIntentId, method)
    setIsProcessing(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="presentation"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-[6px] md:items-center"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md rounded-t-[2rem] bg-[#F5F5F3] p-6 pb-10 shadow-[0_-28px_90px_rgba(0,0,0,0.24)] md:rounded-[2rem]"
          >
            {/* ── Header ── */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  お支払い
                </p>
                <p className="mt-0.5 text-2xl font-black tracking-[-0.03em] text-neutral-900">
                  {formatYen(amount)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="閉じる"
                disabled={isProcessing}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/8 text-neutral-500 text-xs font-semibold transition-all duration-150 hover:bg-black/12 active:scale-90 disabled:opacity-40"
              >
                ✕
              </button>
            </div>

            {/* ── Segmented tab selector (iOS-style) ── */}
            <div className="mb-4 grid grid-cols-3 gap-1 rounded-[14px] bg-black/[0.07] p-1">
              {methodOptions.map((opt) => {
                const isActive = method === opt.key
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectMethod(opt.key)}
                    disabled={isProcessing}
                    className={[
                      'relative flex items-center justify-center gap-1.5 rounded-[10px] px-1 py-2.5 text-[11px] font-bold transition-all duration-200 disabled:opacity-50',
                      isActive
                        ? 'bg-white text-neutral-900 shadow-[0_1px_5px_rgba(0,0,0,0.13),0_0_0_0.5px_rgba(0,0,0,0.08)]'
                        : 'text-neutral-500 hover:text-neutral-700',
                    ].join(' ')}
                  >
                    {opt.key === 'credit_card' && <IconCard className="h-3.5 w-3.5 shrink-0" />}
                    {opt.key === 'apple_pay' && <IconApple className="h-3.5 w-3.5 shrink-0" />}
                    {opt.key === 'google_pay' && <IconGooglePayBadge className="h-3.5 w-3.5 shrink-0" />}
                    <span className="leading-none">{opt.label}</span>
                  </button>
                )
              })}
            </div>

            {/* ── Payment panel ── */}
            <AnimatePresence mode="wait" initial={false}>
              {method === 'credit_card' ? (
                <motion.div
                  key="credit_card"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                >
                  <div className="rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.11em] text-neutral-400">
                        カード番号
                      </span>
                      <input
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        disabled={isProcessing}
                        placeholder="4242 4242 4242 4242"
                        className="rounded-xl border border-neutral-200 bg-neutral-50/60 px-3 py-2.5 text-sm font-mono tracking-wider text-neutral-800 outline-none transition-all focus:border-[#0D4436] focus:bg-white focus:shadow-[0_0_0_3px_rgba(13,68,54,0.08)] disabled:bg-neutral-50"
                      />
                    </label>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.11em] text-neutral-400">
                          有効期限
                        </span>
                        <input
                          inputMode="numeric"
                          value={expiry}
                          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                          disabled={isProcessing}
                          placeholder="MM / YY"
                          className="rounded-xl border border-neutral-200 bg-neutral-50/60 px-3 py-2.5 text-sm font-mono text-neutral-800 outline-none transition-all focus:border-[#0D4436] focus:bg-white focus:shadow-[0_0_0_3px_rgba(13,68,54,0.08)] disabled:bg-neutral-50"
                        />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.11em] text-neutral-400">
                          CVC
                        </span>
                        <input
                          inputMode="numeric"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          disabled={isProcessing}
                          placeholder="• • •"
                          className="rounded-xl border border-neutral-200 bg-neutral-50/60 px-3 py-2.5 text-sm font-mono text-neutral-800 outline-none transition-all focus:border-[#0D4436] focus:bg-white focus:shadow-[0_0_0_3px_rgba(13,68,54,0.08)] disabled:bg-neutral-50"
                        />
                      </label>
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">
                    テストモードです。実際の課金は発生しません。
                    テスト用カード <span className="font-mono text-neutral-500">4242 4242 4242 4242</span>{' '}
                    / 任意の未来の有効期限 / 任意の3桁のCVCでお試しください。
                  </p>
                </motion.div>
              ) : method === 'apple_pay' ? (
                <motion.div
                  key="apple_pay"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                >
                  {/* Apple Pay premium dark panel */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#232323] to-[#141414] py-9 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07),0_2px_16px_rgba(0,0,0,0.3)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_30%_0%,rgba(255,255,255,0.05),transparent)]" />
                    <div className="relative flex flex-col items-center gap-2.5">
                      <ApplePayMark />
                      <p className="text-[11px] font-medium tracking-wide text-white/35">
                        テストモード — 課金は発生しません
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="google_pay"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                >
                  {/* Google Pay clean light panel */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F8FBFF] to-[#EEF4FF] py-9 text-center shadow-[inset_0_0_0_1px_rgba(26,115,232,0.12)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_0%,rgba(26,115,232,0.05),transparent)]" />
                    <div className="relative flex flex-col items-center gap-2.5">
                      <GooglePayMark />
                      <p className="text-[11px] font-medium tracking-wide text-neutral-400">
                        テストモード — 課金は発生しません
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Error ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center"
                >
                  <p className="text-xs font-semibold text-red-600">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Pay button ── */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isProcessing}
              className={[
                'mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl py-[15px] text-[13px] font-black tracking-tight transition-all duration-200 disabled:opacity-55 active:scale-[0.98]',
                method === 'credit_card'
                  ? 'bg-gradient-to-b from-[#0E5443] to-[#093D30] text-white shadow-[0_4px_16px_rgba(13,68,54,0.38),inset_0_1px_0_rgba(255,255,255,0.12)]'
                  : method === 'apple_pay'
                  ? 'bg-gradient-to-b from-[#2C2C2E] to-[#111111] text-white shadow-[0_4px_18px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.09)]'
                  : 'bg-gradient-to-b from-[#1A73E8] to-[#1557B0] text-white shadow-[0_4px_16px_rgba(26,115,232,0.42),inset_0_1px_0_rgba(255,255,255,0.18)]',
              ].join(' ')}
            >
              {isProcessing ? (
                <>
                  <span className="block h-4 w-4 animate-spin rounded-full border-[1.8px] border-white/25 border-t-white" />
                  <span className="font-bold tracking-wide">
                    {method === 'credit_card' ? '処理中...' : walletProcessingLabel[method]}
                  </span>
                </>
              ) : method === 'credit_card' ? (
                <span>{formatYen(amount)} を支払う</span>
              ) : method === 'apple_pay' ? (
                <span className="flex items-center gap-2">
                  <IconApple className="h-[1.1rem] w-auto" color="white" />
                  <span>Pay で {formatYen(amount)} を支払う</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <IconGoogleG className="h-4 w-4" />
                  <span>Pay で {formatYen(amount)} を支払う</span>
                </span>
              )}
            </motion.button>

            {/* ── Security note ── */}
            <p className="mt-3 flex items-center justify-center gap-1 text-[10px] text-neutral-400">
              <svg className="h-3 w-3 shrink-0" viewBox="0 0 14 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 0L1 2.5V7c0 3.87 2.55 7.5 6 8.5 3.45-1 6-4.63 6-8.5V2.5L7 0zm-1 11.5l-2.5-2.5 1.05-1.05L6 9.4l3.45-3.45 1.05 1.05L6 11.5z" />
              </svg>
              SSL / TLS 暗号化で保護されています
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
