'use client'

import { WorkerQuotesLayout } from './components/WorkerQuotesLayout'
import { WorkerQuotesProvider } from './context/WorkerQuotesProvider'

export default function MyQuotesPage() {
  return (
    <WorkerQuotesProvider>
      <WorkerQuotesLayout />
    </WorkerQuotesProvider>
  )
}
