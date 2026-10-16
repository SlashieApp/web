import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'

import bag from './i11n.json'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  const { slug } = await params
  // Private screen: keep it out of search results.
  return metadataFromI11n(copy.metadata, {
    locale,
    path: `/tasks/${slug}/edit`,
    noIndex: true,
  })
}

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
