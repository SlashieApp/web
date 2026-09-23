import type { Metadata } from 'next'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'

import bag from './i11n.json'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  return metadataFromI11n(copy.metadata, { locale, path: '/tasks' })
}

export default function MyTasksLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
