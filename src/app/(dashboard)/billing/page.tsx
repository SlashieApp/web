import { Suspense } from 'react'

import { BillingScreen } from './components/BillingScreen'

export default function BillingPage() {
  // The Checkout return reads `?checkout=`, which needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <BillingScreen />
    </Suspense>
  )
}
