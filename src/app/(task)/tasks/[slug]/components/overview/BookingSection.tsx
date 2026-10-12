'use client'

import { Stack } from '@chakra-ui/react'
import { OrderStatus } from '@codegen/schema'
import { LuRepeat } from 'react-icons/lu'

import { ReportControl } from '@/content/trust/ReportControl'
import { useI11n } from '@/i18n/useI11n'
import { repostTaskHref } from '@/utils/taskHandoff'
import { Button, Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { canReviewCompletedOrder } from '../../helpers/reviewEligibility'
import bag from '../../i11n.json'
import { OrderReviewsCard } from '../ui/OrderReviewsCard'
import { AcceptedWorkerStatus } from './AcceptedWorkerStatus'
import { CustomerActiveOrderStatus } from './CustomerActiveOrderStatus'
import { OrderSection } from './OrderSection'

/**
 * Booking section: the live booking for either party (details plus the
 * Done/Failed, reschedule, cancel, and conflict states), and the order
 * record once it is completed or cancelled. Renders nothing for OPEN tasks
 * with no order. Order data is client-fetched (Task.gql) and read from context.
 */
export function BookingSection() {
  const {
    task,
    myOrder,
    me,
    permissions,
    orderReview,
    viewerHasSubmittedReview,
  } = useTaskDetail()
  const t = useI11n(bag)
  const reviews = t.reviews
  if (!task) return null

  const repost = permissions.canRepostTask ? (
    <Button asChild variant="secondary" alignSelf="flex-start">
      <Link href={repostTaskHref(task.id)} _hover={{ textDecoration: 'none' }}>
        <LuRepeat aria-hidden />
        {t.actions.repostTask}
      </Link>
    </Button>
  ) : null

  const reviewsCard =
    myOrder &&
    canReviewCompletedOrder({
      userId: me?.id,
      posterId: task.poster?.id,
      order: myOrder,
      taskCancelled: permissions.isCancelled,
    }) ? (
      <OrderReviewsCard
        copy={reviews}
        viewerReview={orderReview.viewerReview}
        counterpartyReview={orderReview.counterpartyReview}
        viewerHasSubmitted={viewerHasSubmittedReview}
        editHref={`/tasks/${task.id}/review?orderId=${encodeURIComponent(myOrder.id)}`}
        report={
          orderReview.counterpartyReview ? (
            <ReportControl
              kind="review"
              targetId={orderReview.counterpartyReview.id}
              targetTitle={reviews.theirs}
              variant="button"
            />
          ) : null
        }
      />
    ) : null

  if (permissions.isJobCompleted) {
    return myOrder ? (
      <Stack gap={4}>
        <OrderSection task={task} order={myOrder} showRecord />
        {reviewsCard}
        {repost}
      </Stack>
    ) : null
  }

  if (
    permissions.isClosed ||
    (myOrder && myOrder.status === OrderStatus.Cancelled)
  ) {
    return myOrder ? (
      <Stack gap={4}>
        <OrderSection task={task} order={myOrder} />
        {reviewsCard}
        {repost}
      </Stack>
    ) : null
  }

  if (!permissions.showOrderActions) return null

  return (
    // `task-order`: anchor target for "Open job details" links (quote accept
    // redirect + the Quotes module W6 state).
    <Stack gap={4} w="full" id="task-order" scrollMarginTop="140px">
      <CustomerActiveOrderStatus />
      <AcceptedWorkerStatus />
    </Stack>
  )
}
