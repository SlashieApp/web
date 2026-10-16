import { Suspense } from 'react'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import { BrandLoading } from '@/ui/BrandLoading/BrandLoading'
import { WorkerSetupAuthGate, WorkerSetupScreen } from './components'
import { WorkerSetupProvider } from './context/WorkerSetupProvider'
import bag from './i11n.json'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  // Sign-in only, so nothing for search engines to index.
  return metadataFromI11n(copy.metadata, {
    locale,
    path: '/worker/setup',
    noIndex: true,
  })
}

/** /worker/setup: views in ./views, the flow in WorkerSetupScreen. */
export default async function WorkerSetupPage() {
  const locale = await getRequestLocale()
  return (
    <Suspense key={locale} fallback={<BrandLoading />}>
      <WorkerSetupAuthGate>
        <WorkerSetupProvider>
          <WorkerSetupScreen />
        </WorkerSetupProvider>
      </WorkerSetupAuthGate>
    </Suspense>
  )
}
