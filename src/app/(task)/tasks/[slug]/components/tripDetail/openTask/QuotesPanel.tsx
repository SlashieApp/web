'use client'

import { LuShare2 } from 'react-icons/lu'

import { Button, Card, EmptyState, Link } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import { QuotesSection } from '../../quoteSection/QuotesSection'
import { WorkerOrderVerificationPanel } from '../../quoteSection/WorkerOrderVerificationPanel'
import { useShareTask } from './shareTask'

/**
 * Quotes content. The selected/booked worker sees "Complete job & confirm
 * payment" here. Owner with no quotes gets the empty state + Share/Edit; every
 * other case (owner with quotes, worker, visitor) renders `QuotesSection` — the
 * list of other quotes plus the button to the quote page.
 */
export function QuotesPanel() {
  const { task, permissions } = useTaskDetail()
  const onShare = useShareTask(task?.title?.trim() || 'Task')

  if (!task) return null

  // The booked worker completes the job (enters the customer's code) here.
  if (permissions.showCompleteWithCode) return <WorkerOrderVerificationPanel />

  const ownerEmpty =
    permissions.isOwner && permissions.isOpen && task.quotes.length === 0

  if (!ownerEmpty) return <QuotesSection />

  return (
    <Card layout="section" heading="Quotes">
      <EmptyState
        title="No quotes yet"
        description="Share your task to reach more nearby workers."
      >
        <Button variant="primary" w="full" onClick={() => void onShare()}>
          <LuShare2 />
          Share task
        </Button>
        <Link
          href={`/tasks/${task.id}/edit`}
          _hover={{ textDecoration: 'none' }}
          display="block"
        >
          <Button variant="secondary" w="full">
            Edit task
          </Button>
        </Link>
      </EmptyState>
    </Card>
  )
}
