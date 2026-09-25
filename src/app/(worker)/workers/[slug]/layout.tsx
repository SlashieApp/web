import type { Metadata } from 'next'

import { fetchWorkerProfileUserId } from '@/app/helpers/legacyProfileRedirect'
import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'

import bag from './i11n.json'

/**
 * Retired `/workers/[workerId]`. The page 301s when the document id maps.
 * Metadata stays noindex; canonical is the user profile when the lookup hits.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const locale = await getRequestLocale()
  const { slug } = await params
  const copy = loadPageI11n(bag, locale)
  const lookup = await fetchWorkerProfileUserId(slug)
  const canonicalPath =
    lookup.status === 'ok' ? `/profile/${lookup.userId}` : `/workers/${slug}`
  const base = metadataFromI11n(copy.metadata, { locale, path: canonicalPath })

  return {
    ...base,
    robots: { index: false, follow: false },
    alternates: { ...base.alternates, canonical: canonicalPath },
  }
}

export default function WorkerProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
