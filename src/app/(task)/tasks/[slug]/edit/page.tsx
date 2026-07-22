import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'

import PageContent from './PageContent'
import bag from './i11n.json'

const PAGE_PATH = '/tasks/[slug]/edit'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  return metadataFromI11n(copy.metadata, { locale, path: PAGE_PATH })
}

export default async function Page() {
  const locale = await getRequestLocale()
  return <PageContent key={locale} />
}
