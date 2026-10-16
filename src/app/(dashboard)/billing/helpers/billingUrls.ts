import type { AppLocale } from '@/i18n/locales'
import { withLocale } from '@/i18n/navigation'

/**
 * Where Stripe sends people back: /billing in their language, with
 * `?checkout=` saying how Checkout ended. The API checks the origin only.
 */
export function billingReturnUrl(
  origin: string,
  locale: AppLocale,
  checkout?: 'success' | 'cancelled',
): string {
  const path = checkout ? `/billing?checkout=${checkout}` : '/billing'
  return `${origin}${withLocale(locale, path)}`
}
