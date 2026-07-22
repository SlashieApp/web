import { readLocaleCookie } from './localeCookie'
import { type AppLocale, DEFAULT_LOCALE, normalizeLocale } from './locales'
import { type Messages, enMessages } from './messages/en'
import { zhTWMessages } from './messages/zh-TW'

export type { Messages }

const dictionaries = {
  en: enMessages,
  'zh-TW': zhTWMessages,
} as const satisfies Record<AppLocale, Messages>

export function getDictionary(locale: AppLocale | null | undefined): Messages {
  return dictionaries[normalizeLocale(locale)]
}

export function formatMessage(
  message: string,
  params: Record<string, string | number>,
): string {
  return Object.entries(params).reduce(
    (formatted, [key, value]) =>
      formatted.replaceAll(`{${key}}`, String(value)),
    message,
  )
}

export function getLocalizedMetadata(locale: AppLocale | null | undefined) {
  const messages = getDictionary(locale)
  return {
    landing: messages.landing.metadata,
    pricing: messages.pricing.metadata,
  }
}

export async function getRequestLocale(): Promise<AppLocale> {
  if (typeof window !== 'undefined') return DEFAULT_LOCALE
  const { cookies } = await import('next/headers')
  return readLocaleCookie(await cookies())
}
