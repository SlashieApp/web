import { Stack, type StackProps } from '@chakra-ui/react'
import type { TaskQuery } from '@codegen/schema'

import { TASK_DETAIL_COLUMN_GAP } from '../../helpers/taskDetailLayout'
import type { TaskDetailRecord } from '../../helpers/taskDetailUtils'
import { TaskOwnerCard } from '../TaskOwnerCard'
import { OrderSection } from '../orderSection/OrderSection'
import { QuotePaymentTrustCard } from './QuotePaymentTrustCard'
import { QuotesSection } from './QuotesSection'
import { WorkerOrderVerificationPanel } from './WorkerOrderVerificationPanel'

type QuoteSectionColumnProps = Omit<StackProps, 'order'> & {
  task: TaskDetailRecord
  order: NonNullable<TaskQuery['task']>['viewerOrder'] | null | undefined
}

export function QuoteSectionColumn({
  task,
  order,
  ...props
}: QuoteSectionColumnProps) {
  return (
    <Stack
      id="task-quote"
      scrollMarginTop="96px"
      gap={TASK_DETAIL_COLUMN_GAP}
      w="full"
      {...props}
    >
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
