import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'

import { UnsubscribeScreen } from './UnsubscribeScreen'
import bag from './i11n.json'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  // Token links: keep out of search results.
  return metadataFromI11n(copy.metadata, {
    locale,
    path: '/unsubscribe',
    noIndex: true,
  })
}

/** `/unsubscribe?token=…` from marketing emails (FE-214). Public, no auth gate. */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const { token } = await searchParams
  const value = (Array.isArray(token) ? token[0] : token)?.trim() || null
  return <UnsubscribeScreen token={value} />
}
