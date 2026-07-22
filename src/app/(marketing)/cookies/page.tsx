import { LegalPageLayout } from '@/app/(marketing)/components/LegalPageLayout'
import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import { Footer } from '@/ui'

import messages from './i11n.json'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(messages, locale)

  return metadataFromI11n(copy.metadata, { locale, path: '/cookies' })
}

export default async function CookiesPage() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(messages, locale)

  return (
    <>
      <LegalPageLayout document={copy} />
      <Footer variant="minimal" />
    </>
  )
}
