import { Suspense } from 'react'

import { WorkerPlanRedirect } from './components/WorkerPlanRedirect'

/** Legacy route — canonical billing hub is `/billing`. */
export default function WorkerPlanRedirectPage() {
  return (
    <Suspense fallback={null}>
      <WorkerPlanRedirect />
    </Suspense>
  )
}
