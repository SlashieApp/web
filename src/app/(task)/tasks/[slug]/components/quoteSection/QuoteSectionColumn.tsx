import { Stack, type StackProps } from '@chakra-ui/react'
import type { TaskQuery } from '@codegen/schema'

import type { TaskDetailRecord } from '../../helpers/taskDetailUtils'
import { TaskClosedOrderBlock } from '../TaskClosedOrderBlock'
import { TaskOwnerCard } from '../TaskOwnerCard'
import { WorkerOrderVerificationPanel } from '../WorkerOrderVerificationPanel'
import { QuotePaymentTrustCard } from './QuotePaymentTrustCard'
import { QuotesSection } from './QuotesSection'

type QuoteSectionColumnProps = StackProps & {
  task: TaskDetailRecord
  order: TaskQuery['order']
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
          <TaskClosedOrderBlock task={task} order={order} />
        </>
      ) : (
        <>
          <QuotesSection />
          <QuotePaymentTrustCard />
        </>
      )}
    </Stack>
  )
}
