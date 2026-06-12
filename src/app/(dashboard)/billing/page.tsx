import type { Metadata } from 'next'
import { Suspense } from 'react'

import { BillingPage } from './components/BillingPage'

export const metadata: Metadata = {
  title: 'Billing | Slashie',
  description:
    'Manage your Slashie Unlimited subscription and monthly quote allowance. Platform billing is separate from job payments between customers and workers.',
}

export default function BillingRoutePage() {
  return (
    <Suspense fallback={null}>
      <BillingPage />
    </Suspense>
  )
}
