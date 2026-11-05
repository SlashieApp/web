import { APP_HOME } from '@/utils/appRoutes'
import { Button, Link, StatusCard } from '@ui'

import { TaskNotFoundTracker } from '../analytics/TaskNotFoundTracker'

/**
 * "Task not found", rendered by the detail and quote pages: the shared
 * `StatusCard` (R6), centred in the page container at the one card width.
 * The quote page has no site header or shell, so it passes `fullPage`.
 */
export function TaskNotFoundCard({
  eyebrow,
  heading,
  description,
  browseLabel,
  fullPage = false,
}: {
  eyebrow?: string
  heading: string
  description: string
  /** Way out to search; the quote route has no header or bottom nav. */
  browseLabel: string
  /** The card is the whole page (the quote route has no shell around it). */
  fullPage?: boolean
}) {
  return (
    <StatusCard
      fullPage={fullPage}
      eyebrow={eyebrow}
      title={heading}
      body={description}
      actions={
        <Button asChild variant="secondary" size="form">
          <Link href={APP_HOME} _hover={{ textDecoration: 'none' }}>
            {browseLabel}
          </Link>
        </Button>
      }
    >
      <TaskNotFoundTracker />
    </StatusCard>
  )
}
