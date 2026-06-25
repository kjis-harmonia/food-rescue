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

const methodOptions: { key: PaymentMethod; label: string }[] = [
  { key: 'credit_card', label: 'クレジットカード' },
  { key: 'paypay', label: 'PayPay' },
  { key: 'apple_pay', label: 'Apple Pay' },
]

const walletLabel: Record<'paypay' | 'apple_pay', string> = {
  paypay: 'PayPay',
  apple_pay: 'Apple Pay',
}

const walletProcessingLabel: Record<'paypay' | 'apple_pay', string> = {
  paypay: 'PayPayアプリを起動中...',
  apple_pay: 'Apple Payで認証中...',
}

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
            className="w-full max-w-md rounded-t-[2rem] bg-[#FBFBFA] p-6 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.18)] md:rounded-[2rem]"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">お支払い</p>
                <p className="mt-0.5 text-lg font-black tracking-tight text-neutral-900">{formatYen(amount)}</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="閉じる"
                disabled={isProcessing}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-40"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {methodOptions.map((option) => {
                const isActive = method === option.key
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleSelectMethod(option.key)}
                    disabled={isProcessing}
                    className={[
                      'relative flex flex-col items-center gap-1 rounded-2xl border py-3 text-center text-xs font-bold transition-all duration-200 disabled:opacity-50',
                      isActive
                        ? 'border-[#0D4436] bg-[#E6F2ED] text-[#0D4436]'
                        : 'border-neutral-200 bg-white text-neutral-500',
                    ].join(' ')}
                  >
                    {isActive && (
                      <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0D4436] text-[9px] text-white">
                        ✓
                      </span>
                    )}
                    {option.label}
                  </button>
                )
              })}
            </div>

            {method === 'credit_card' ? (
              <>
                <div className="mt-4 rounded-2xl border border-[#0D4436]/10 bg-white p-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">カード番号</span>
                    <input
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                      disabled={isProcessing}
                      placeholder="4242 4242 4242 4242"
                      className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-mono tracking-wider outline-none focus:border-[#0D4436] disabled:bg-neutral-50"
                    />
                  </label>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">有効期限 (MM/YY)</span>
                      <input
                        inputMode="numeric"
                        value={expiry}
                        onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                        disabled={isProcessing}
                        placeholder="12/30"
                        className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-[#0D4436] disabled:bg-neutral-50"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">CVC</span>
                      <input
                        inputMode="numeric"
                        value={cvc}
                        onChange={(event) => setCvc(event.target.value.replace(/\D/g, '').slice(0, 4))}
                        disabled={isProcessing}
                        placeholder="123"
                        className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-[#0D4436] disabled:bg-neutral-50"
                      />
                    </label>
                  </div>
                </div>

                <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">
                  テストモードです。実際の課金は発生しません。テスト用カード番号 <span className="font-mono">4242 4242 4242 4242</span> /
                  任意の未来の有効期限 / 任意の3桁のCVCでお試しください。
                </p>
              </>
            ) : (
              <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0D4436]/15 bg-[#FBF8EE] py-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-2xl">
                  {method === 'paypay' ? '📱' : ''}
                </span>
                <p className="text-sm font-bold text-neutral-700">{walletLabel[method]}でお支払いします</p>
                <p className="max-w-[220px] text-[11px] leading-relaxed text-neutral-400">
                  テストモードです。実際の課金は発生しません。ボタンを押すとすぐに決済が完了します。
                </p>
              </div>
            )}

            {error && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-center">
                <p className="text-xs font-bold text-red-600">⚠️ {error}</p>
              </div>
            )}

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={isProcessing}
              className={[
                'mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black tracking-tight shadow-[0_4px_12px_rgba(13,68,54,0.2)] transition-all duration-300 disabled:opacity-60',
                method === 'credit_card'
                  ? 'bg-[#0D4436] text-white hover:bg-[#0A3329]'
                  : 'bg-amber-400 text-[#0D4436] hover:bg-amber-300',
              ].join(' ')}
            >
              {isProcessing ? (
                <>
                  <span className="block h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                  {method === 'credit_card' ? '処理中...' : walletProcessingLabel[method]}
                </>
              ) : method === 'credit_card' ? (
                `${formatYen(amount)} を支払う`
              ) : (
                `${walletLabel[method]}でレスキュー確定`
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
