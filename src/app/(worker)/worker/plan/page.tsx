import { Suspense } from 'react'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import { WorkerPlanRedirect } from './components/WorkerPlanRedirect'
import bag from './i11n.json'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  return metadataFromI11n(copy.metadata, { locale, path: '/worker/plan' })
}

/** Legacy route — canonical billing hub is `/billing`. */
export default async function WorkerPlanRedirectPage() {
  await getRequestLocale()
  return (
    <Suspense fallback={null}>
      <WorkerPlanRedirect />
    </Suspense>
  )
}
