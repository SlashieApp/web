import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'

import bag from './i11n.json'

const PAGE_PATH = '/tasks/create'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  // Sign-in only, so nothing for search engines to index.
  return metadataFromI11n(copy.metadata, {
    locale,
    path: PAGE_PATH,
    noIndex: true,
  })
}

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
