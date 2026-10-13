import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'

import bag from './i11n.json'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  const { orderId } = await params
  // Private screen: keep it out of search results.
  return metadataFromI11n(copy.metadata, {
    locale,
    path: `/dashboard/orders/${orderId}`,
    noIndex: true,
  })
}

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
