import { Suspense } from 'react'

import { Box } from '@chakra-ui/react'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import { WorkerSetupAuthGate, WorkerSetupScreen } from './components'
import { WorkerSetupProvider } from './context/WorkerSetupProvider'
import bag from './i11n.json'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  return metadataFromI11n(copy.metadata, { locale, path: '/worker/setup' })
}

export default async function WorkerSetupPage() {
  const locale = await getRequestLocale()
  return (
    <Suspense key={locale} fallback={<Box minH="100dvh" bg="bg.subtle" />}>
      <WorkerSetupAuthGate>
        <WorkerSetupProvider>
          <WorkerSetupScreen />
        </WorkerSetupProvider>
      </WorkerSetupAuthGate>
    </Suspense>
  )
}
