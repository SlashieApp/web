import type { Metadata } from 'next'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'

import bag from './i11n.json'

/**
 * Retired `/user/[id]`. The page 301s (proxy) or permanently redirects.
 * Metadata stays noindex and points at `/profile/[id]`.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const locale = await getRequestLocale()
  const { id } = await params
  const copy = loadPageI11n(bag, locale)
  const canonicalPath = `/profile/${id}`
  const base = metadataFromI11n(copy.metadata, { locale, path: canonicalPath })

  return {
    ...base,
    robots: { index: false, follow: false },
    alternates: { ...base.alternates, canonical: canonicalPath },
  }
}

export default function PublicUserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
