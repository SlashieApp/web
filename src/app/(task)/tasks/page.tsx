import { redirect } from 'next/navigation'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import bag from './i11n.json'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  return metadataFromI11n(copy.metadata, { locale, path: '/tasks' })
}

/** Task browse moved to the unified map-first search surface. */
export default async function TasksBrowseRedirect() {
  const locale = await getRequestLocale()
  redirect(`/${locale}/search?mode=tasks`)
}
