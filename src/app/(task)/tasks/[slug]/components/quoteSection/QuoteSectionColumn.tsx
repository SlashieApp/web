import { Stack, type StackProps } from '@chakra-ui/react'
import type { TaskQuery } from '@codegen/schema'

import type { TaskDetailRecord } from '../../helpers/taskDetailUtils'
import { TaskOwnerCard } from '../TaskOwnerCard'
import { WorkerOrderVerificationPanel } from '../WorkerOrderVerificationPanel'
import { OrderSection } from '../orderSection/OrderSection'
import { QuotePaymentTrustCard } from './QuotePaymentTrustCard'
import { QuotesSection } from './QuotesSection'

type QuoteSectionColumnProps = Omit<StackProps, 'order'> & {
  task: TaskDetailRecord
  order: TaskQuery['order'] | null | undefined
}

export function QuoteSectionColumn({
  task,
  order,
  ...props
}: QuoteSectionColumnProps) {
  return (
    <Stack id="task-quote" scrollMarginTop="96px" gap={4} w="full" {...props}>
      <TaskOwnerCard />
      {order ? (
        <>
          <WorkerOrderVerificationPanel />
          <OrderSection task={task} order={order} />
        </>
      ) : null}
      <QuotesSection />
      {!order ? <QuotePaymentTrustCard /> : null}
    </Stack>
  )
}
