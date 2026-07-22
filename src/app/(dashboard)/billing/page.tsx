import { Suspense } from 'react'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import { BillingPage } from './components/BillingPage'
import bag from './i11n.json'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  return metadataFromI11n(copy.metadata, { locale, path: '/billing' })
}

export default function BillingRoutePage() {
  return (
    <Suspense fallback={null}>
      <BillingPage />
    </Suspense>
  )
}
