import { useEffect, useState } from 'react'
import { validateCard } from '../../lib/stripe'
import { Sheet } from './Sheet'

interface PaymentMethodsModalProps {
  open: boolean
  onClose: () => void
}

interface SavedCard {
  id: string
  brand: 'Visa' | 'Mastercard' | 'JCB' | 'Amex'
  last4: string
  isDefault: boolean
}

interface WalletLinkState {
  paypay: boolean
  apple_pay: boolean
}

const STORAGE_KEY = 'food-rescue:payment-methods'
const WALLET_STORAGE_KEY = 'food-rescue:wallet-links'

const defaultCards: SavedCard[] = [{ id: 'card-default', brand: 'Visa', last4: '4242', isDefault: true }]
const defaultWalletLinks: WalletLinkState = { paypay: false, apple_pay: false }

const walletOptions: { key: keyof WalletLinkState; label: string; emoji: string }[] = [
  { key: 'paypay', label: 'PayPay', emoji: '📱' },
  { key: 'apple_pay', label: 'Apple Pay', emoji: '' },
]

function detectBrand(cardNumber: string): SavedCard['brand'] {
  const digits = cardNumber.replace(/\s+/g, '')
  if (digits.startsWith('4')) return 'Visa'
  if (digits.startsWith('34') || digits.startsWith('37')) return 'Amex'
  if (digits.startsWith('35')) return 'JCB'
  return 'Mastercard'
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

export function PaymentMethodsModal({ open, onClose }: PaymentMethodsModalProps) {
  const [cards, setCards] = useState<SavedCard[]>(defaultCards)
  const [walletLinks, setWalletLinks] = useState<WalletLinkState>(defaultWalletLinks)
  const [isAdding, setIsAdding] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setCards(JSON.parse(saved))
      } catch {
        // ignore malformed local data
      }
    }
    const savedWallets = localStorage.getItem(WALLET_STORAGE_KEY)
    if (savedWallets) {
      try {
        setWalletLinks(JSON.parse(savedWallets))
      } catch {
        // ignore malformed local data
      }
    }
  }, [])

  const toggleWalletLink = (key: keyof WalletLinkState) => {
    const next = { ...walletLinks, [key]: !walletLinks[key] }
    setWalletLinks(next)
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(next))
  }

  const persist = (next: SavedCard[]) => {
    setCards(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const handleAddCard = () => {
    const validationError = validateCard({ cardNumber, expiry, cvc })
    if (validationError) {
      setError('カード情報を確認してください。')
      return
    }
    const digits = cardNumber.replace(/\s+/g, '')
    const newCard: SavedCard = {
      id: `card-${Date.now()}`,
      brand: detectBrand(cardNumber),
      last4: digits.slice(-4),
      isDefault: cards.length === 0,
    }
    persist([...cards, newCard])
    setCardNumber('')
    setExpiry('')
    setCvc('')
    setError('')
    setIsAdding(false)
  }

  const handleSetDefault = (id: string) => {
    persist(cards.map((card) => ({ ...card, isDefault: card.id === id })))
  }

  const handleDelete = (id: string) => {
    const remaining = cards.filter((card) => card.id !== id)
    if (remaining.length > 0 && !remaining.some((card) => card.isDefault)) {
      remaining[0].isDefault = true
    }
    persist(remaining)
  }

  return (
    <Sheet open={open} title="お支払い方法" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">クレジットカード</p>
        {cards.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400">登録されたカードはありません。</p>
        ) : (
          cards.map((card) => (
            <div key={card.id} className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4">
              <span className="flex h-9 w-14 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-[10px] font-black tracking-wide text-white">
                {card.brand}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-bold text-neutral-900">•••• •••• •••• {card.last4}</p>
                {card.isDefault && <p className="text-[11px] font-bold text-[#0D4436]">デフォルト</p>}
              </div>
              {!card.isDefault && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(card.id)}
                  className="shrink-0 rounded-lg bg-neutral-100 px-2.5 py-1.5 text-[11px] font-bold text-neutral-600"
                >
                  デフォルトに設定
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(card.id)}
                aria-label="削除"
                className="shrink-0 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-500"
              >
                削除
              </button>
            </div>
          ))
        )}

        {isAdding ? (
          <div className="rounded-2xl border border-neutral-100 bg-white p-4">
            <div className="flex flex-col gap-3">
              <input
                inputMode="numeric"
                value={cardNumber}
                onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                placeholder="4242 4242 4242 4242"
                className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-[#0D4436]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  inputMode="numeric"
                  value={expiry}
                  onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                  placeholder="MM/YY"
                  className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-[#0D4436]"
                />
                <input
                  inputMode="numeric"
                  value={cvc}
                  onChange={(event) => setCvc(event.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="CVC"
                  className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-[#0D4436]"
                />
              </div>
            </div>
            {error && <p className="mt-2 text-xs font-bold text-red-500">⚠️ {error}</p>}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 rounded-xl bg-neutral-100 py-2.5 text-center text-sm font-bold text-neutral-600"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleAddCard}
                className="flex-1 rounded-xl bg-[#0D4436] py-2.5 text-center text-sm font-bold text-white"
              >
                追加する
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-full rounded-xl bg-neutral-100 py-3 text-center text-sm font-bold text-neutral-700"
          >
            ＋ カードを追加
          </button>
        )}

        <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">その他の決済手段</p>
        {walletOptions.map((wallet) => {
          const isLinked = walletLinks[wallet.key]
          return (
            <div key={wallet.key} className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-base">
                {wallet.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-neutral-900">{wallet.label}</p>
                <p className="text-[11px] font-bold text-neutral-400">{isLinked ? '連携済み' : '未連携'}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleWalletLink(wallet.key)}
                className={
                  isLinked
                    ? 'shrink-0 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-500'
                    : 'shrink-0 rounded-lg bg-[#0D4436] px-2.5 py-1.5 text-[11px] font-bold text-white'
                }
              >
                {isLinked ? '連携を解除' : '連携する'}
              </button>
            </div>
          )
        })}
      </div>
    </Sheet>
  )
}
