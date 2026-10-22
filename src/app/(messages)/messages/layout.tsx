import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'

import { InboxSearchProvider } from './context/InboxSearchProvider'
import bag from './i11n.json'

const PAGE_PATH = '/messages'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  return metadataFromI11n(copy.metadata, { locale, path: PAGE_PATH })
}

/**
 * Holds the inbox's search text and filter (FE-362): this layout stays put
 * as a conversation opens, where the page, and the list in it, would remount.
 */
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <InboxSearchProvider>{children}</InboxSearchProvider>
}
