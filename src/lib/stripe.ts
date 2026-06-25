import { loadStripe, type Stripe } from '@stripe/stripe-js'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ''

export const isStripeConfigured = Boolean(publishableKey) && !publishableKey.includes('placeholder')

if (!isStripeConfigured) {
  console.warn(
    '[stripe] VITE_STRIPE_PUBLISHABLE_KEY が未設定です。.env.local に pk_test_... を設定してください（決済はテスト用シミュレーションで継続します）。',
  )
}

let stripePromise: Promise<Stripe | null> | null = null

/** The real Stripe.js client (for a future Stripe Elements integration). */
export function getStripeClient() {
  if (!isStripeConfigured) return Promise.resolve(null)
  if (!stripePromise) stripePromise = loadStripe(publishableKey)
  return stripePromise
}

export interface CardInput {
  cardNumber: string
  expiry: string // "MM/YY"
  cvc: string
}

export type CardValidationError =
  | 'invalid_number'
  | 'invalid_expiry'
  | 'expired'
  | 'invalid_cvc'

export function validateCard(card: CardInput): CardValidationError | null {
  const digits = card.cardNumber.replace(/\s+/g, '')
  if (!/^\d{13,19}$/.test(digits) || !luhnCheck(digits)) return 'invalid_number'

  const match = /^(\d{2})\/(\d{2})$/.exec(card.expiry.trim())
  if (!match) return 'invalid_expiry'
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return 'invalid_expiry'
  const now = new Date()
  const expiryEnd = new Date(year, month, 0, 23, 59, 59)
  if (expiryEnd < now) return 'expired'

  if (!/^\d{3,4}$/.test(card.cvc.trim())) return 'invalid_cvc'

  return null
}

function luhnCheck(digits: string) {
  let sum = 0
  let shouldDouble = false
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = Number(digits[i])
    if (shouldDouble) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

// Stripe's documented test-mode card numbers (see
// https://docs.stripe.com/testing#cards). Used to simulate the
// success/decline outcomes a real Stripe test-mode charge would produce.
const DECLINE_TEST_CARDS: Record<string, string> = {
  '4000000000000002': 'カードが拒否されました（do not honor）。',
  '4000000000009995': '残高不足のため決済できませんでした。',
  '4000000000000069': 'カードの有効期限が切れています。',
  '4000000000000127': 'CVCが正しくありません。',
}

export type ChargeResult =
  | { success: true; paymentIntentId: string; chargeId: string }
  | { success: false; error: string }

/**
 * Simulates a Stripe test-mode charge entirely on the client.
 *
 * IMPORTANT: a real Stripe charge cannot be created safely from frontend
 * code alone — creating a PaymentIntent requires the *secret* key, which
 * must live on a server (this project has none yet, e.g. a Supabase Edge
 * Function). This function exists so the checkout UX, validation, and
 * Supabase write-through (orders/payments) can be fully built now; swapping
 * this for a real `stripe.confirmCardPayment()` call against a server-created
 * PaymentIntent is a drop-in replacement once a backend exists.
 */
export async function simulateTestModeCharge(card: CardInput, amount: number): Promise<ChargeResult> {
  const validationError = validateCard(card)
  if (validationError) {
    return { success: false, error: describeValidationError(validationError) }
  }

  await new Promise((resolve) => window.setTimeout(resolve, 900))

  const digits = card.cardNumber.replace(/\s+/g, '')
  const declineReason = DECLINE_TEST_CARDS[digits]
  if (declineReason) {
    return { success: false, error: declineReason }
  }

  // `amount` isn't used by the simulation itself, but a real integration
  // would pass it to the PaymentIntent creation call on the server.
  void amount

  const suffix = Math.random().toString(36).slice(2, 11)
  return {
    success: true,
    paymentIntentId: `pi_test_${suffix}`,
    chargeId: `ch_test_${suffix}`,
  }
}

function describeValidationError(error: CardValidationError) {
  switch (error) {
    case 'invalid_number':
      return 'カード番号が正しくありません。'
    case 'invalid_expiry':
      return '有効期限の形式が正しくありません（MM/YY）。'
    case 'expired':
      return 'カードの有効期限が切れています。'
    case 'invalid_cvc':
      return 'CVCが正しくありません。'
  }
}
