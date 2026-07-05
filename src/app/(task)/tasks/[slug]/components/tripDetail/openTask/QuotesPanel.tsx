'use client'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import { QuotesModule } from '../../quoteSection/QuotesModule'
import { WorkerOrderVerificationPanel } from '../../quoteSection/WorkerOrderVerificationPanel'

/**
 * Quotes column content. The booked worker with an ACTIVE order sees the
 * existing job verification panel instead of the Quotes module (W9: never
 * duplicate job UI inside Quotes); every other viewer/state renders the
 * 12-state `QuotesModule`.
 */
export function QuotesPanel() {
  const { task, permissions } = useTaskDetail()

  if (!task) return null

  // The booked worker completes the job (enters the customer's code) here.
  if (permissions.showCompleteWithCode) return <WorkerOrderVerificationPanel />

  return <QuotesModule />
}
