import type { Metadata } from 'next'

import {
  type AppLocale,
  DEFAULT_LOCALE,
  type I11nKey,
  LOCALE_TO_I11N_KEY,
} from './locales'
import { withLocale } from './navigation'

export type PageI11nBag<T extends Record<string, unknown>> = {
  en: T
  zh_hk: T
}

/**
 * Pick the locale bundle from a colocated `i11n.json`.
 * Falls back to English when a key is missing.
 */
export function loadPageI11n<T extends Record<string, unknown>>(
  bag: PageI11nBag<T>,
  locale: AppLocale,
): T {
  const key: I11nKey = LOCALE_TO_I11N_KEY[locale]
  return (bag[key] ?? bag.en) as T
}

type MetadataFields = {
  title?: string
  description?: string
}

/**
 * Build Next.js metadata from a page i11n bundle + canonical path
 * (path without locale prefix, e.g. `/pricing`).
 * English canonicals omit `/en`; `zh-hk` keeps the slug.
 */
export function metadataFromI11n(
  copy: MetadataFields,
  opts: {
    locale: AppLocale
    /** Path without locale, e.g. `/home` or `/pricing`. */
    path: string
    siteName?: string
  },
): Metadata {
  const title = copy.title ?? 'Slashie'
  const description = copy.description ?? ''
  const localizedPath = withLocale(opts.locale, opts.path)
  const siteName = opts.siteName ?? 'Slashie'

  return {
    title,
    description,
    alternates: {
      canonical: localizedPath,
      languages: {
        en: withLocale('en', opts.path),
        'zh-HK': withLocale('zh-hk', opts.path),
      },
    },
    openGraph: {
      type: 'website',
      siteName,
      title,
      description,
      url: localizedPath,
      locale: opts.locale === 'zh-hk' ? 'zh_HK' : 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

/** Replace `{name}` placeholders in a message string. */
export function formatMessage(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  )
}

export { DEFAULT_LOCALE }
