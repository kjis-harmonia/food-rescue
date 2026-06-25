/**
 * Analytics extension point. No SDK is wired up yet — this exists so a real
 * one (Vercel Analytics, Google Analytics, PostHog, etc.) is a one-line
 * addition later instead of a search-and-replace across the app.
 *
 * To wire up Vercel Analytics:
 *   npm install @vercel/analytics
 *   import { inject } from '@vercel/analytics'
 *   // inside initAnalytics(): inject()
 *
 * To wire up Google Analytics (gtag.js):
 *   add the gtag.js <script> loader to index.html, then inside
 *   trackEvent(): window.gtag?.('event', name, properties)
 */

const isProd = import.meta.env.PROD

export function initAnalytics() {
  if (!isProd) return
  // Real SDK init goes here once one is chosen.
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (!isProd) {
    console.debug('[analytics:dev]', name, properties)
    return
  }
  // Real SDK event forwarding goes here once one is chosen.
}
