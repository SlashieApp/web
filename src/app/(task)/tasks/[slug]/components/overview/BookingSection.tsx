'use client'

import { Stack } from '@chakra-ui/react'

import { ReportControl } from '@/content/trust/ReportControl'
import { useI11n } from '@/i18n/useI11n'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { isOrderCompletedStatus } from '../../helpers/taskDetailCompleted'
import bag from '../../i11n.json'
import { OrderReviewsCard } from '../ui/OrderReviewsCard'
import { AcceptedWorkerStatus } from './AcceptedWorkerStatus'
import { CustomerActiveOrderStatus } from './CustomerActiveOrderStatus'
import { OrderSection } from './OrderSection'

/**
 * Booking section — the "Your booking" info for an active order (completion code
 * for the customer; job + complete-with-code for the worker) and the order
 * summary once the job is completed or the task is closed. Completed jobs hide
 * the in-progress booking chrome and keep the agreement record.
 * Renders nothing for OPEN tasks with no order. Order data is client-fetched
 * (Task.gql) and read from context.
 */
export function BookingSection() {
  const { task, myOrder, permissions, orderReview, viewerHasSubmittedReview } =
    useTaskDetail()
  const reviews = useI11n(bag).reviews
  if (!task) return null

  const reviewsCard =
    myOrder &&
    isOrderCompletedStatus(myOrder.status) &&
    !permissions.isCancelled &&
    (permissions.isOwner || permissions.isOrderWorker) ? (
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
      </Stack>
    ) : null
  }

  if (permissions.isClosed) {
    return myOrder ? (
      <Stack gap={4}>
        <OrderSection task={task} order={myOrder} />
        {reviewsCard}
      </Stack>
    ) : null
  }

  const hasBooking =
    permissions.showCustomerCompletionCode ||
    permissions.showWorkerJobBanner ||
    permissions.showCompleteWithCode
  if (!hasBooking) return null

  return (
    // `task-order`: anchor target for "Open job details" links (quote accept
    // redirect + the Quotes module W6 state).
    <Stack gap={4} w="full" id="task-order" scrollMarginTop="140px">
      <CustomerActiveOrderStatus />
      <AcceptedWorkerStatus />
    </Stack>
  )
}
