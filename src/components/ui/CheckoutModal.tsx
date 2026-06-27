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

function IconPayPayBadge({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="16" height="16" rx="4" fill="#FF0033" />
      <text x="4" y="12.5" fontFamily="'Helvetica Neue', Arial, sans-serif" fontWeight="900" fontSize="10" fill="white">P</text>
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

// PayPay large wordmark (center panel)
function PayPayWordmark() {
  return (
    <div
      className="select-none text-[2.75rem] font-black leading-none tracking-tight text-[#FF0033]"
      style={{ fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif", letterSpacing: '-0.04em' }}
      aria-label="PayPay"
    >
      PayPay
    </div>
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

// ── Tab options ──────────────────────────────────────────────────────────────

const methodOptions: { key: PaymentMethod; label: string }[] = [
  { key: 'credit_card', label: 'カード' },
  { key: 'paypay', label: 'PayPay' },
  { key: 'apple_pay', label: 'Apple Pay' },
]


const walletProcessingLabel: Record<'paypay' | 'apple_pay', string> = {
  paypay: 'PayPayアプリを起動中...',
  apple_pay: 'Apple Payで認証中...',
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
                    {opt.key === 'credit_card' && (
                      <IconCard className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {opt.key === 'paypay' && (
                      <IconPayPayBadge className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {opt.key === 'apple_pay' && (
                      <IconApple className="h-3.5 w-3.5 shrink-0" />
                    )}
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
              ) : method === 'paypay' ? (
                <motion.div
                  key="paypay"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                >
                  {/* PayPay premium panel */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF4F4] via-white to-[#FFF9F0] py-9 text-center shadow-[inset_0_0_0_1px_rgba(255,0,51,0.10)]">
                    {/* Ambient glow */}
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_70%_0%,rgba(255,0,51,0.07),transparent)]" />
                    <div className="relative flex flex-col items-center gap-2.5">
                      <PayPayWordmark />
                      <p className="text-[11px] font-medium tracking-wide text-neutral-400">
                        テストモード — 課金は発生しません
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="apple_pay"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                >
                  {/* Apple Pay premium dark panel */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#232323] to-[#141414] py-9 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07),0_2px_16px_rgba(0,0,0,0.3)]">
                    {/* Subtle sheen */}
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_30%_0%,rgba(255,255,255,0.05),transparent)]" />
                    <div className="relative flex flex-col items-center gap-2.5">
                      <ApplePayMark />
                      <p className="text-[11px] font-medium tracking-wide text-white/35">
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
                  : method === 'paypay'
                  ? 'bg-gradient-to-b from-[#D4A520] via-[#C49510] to-[#B08408] text-white shadow-[0_4px_16px_rgba(180,130,8,0.45),inset_0_1px_0_rgba(255,255,255,0.18)]'
                  : 'bg-gradient-to-b from-[#2C2C2E] to-[#111111] text-white shadow-[0_4px_18px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.09)]',
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
              ) : method === 'paypay' ? (
                <span>
                  <span className="opacity-80">PayPayで</span>
                  {'  '}
                  {formatYen(amount)} を支払う
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <IconApple className="h-[1.1rem] w-auto" color="white" />
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
