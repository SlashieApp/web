'use client'

import { Box, Stack, Text } from '@chakra-ui/react'
import { OrderStatus } from '@codegen/schema'

import { formatRelativeTime } from '@/utils/formatRelativeTime'
import { Button, SectionCard } from '@ui'

import { useTaskDetail } from '../context/TaskDetailProvider'

export function TaskJobClosurePanels() {
  const {
    myOrder,
    isOrderWorker,
    isOrderCustomer,
    jobActionError,
    completingOrder,
    confirmingOrder,
    acknowledgingOrderPayment,
    onCompleteOrder,
    onConfirmOrder,
    onAcknowledgeOrderPayment,
  } = useTaskDetail()

  if (!myOrder) return null

  const status = myOrder.status
  const isClosed =
    status === OrderStatus.Closed || status === OrderStatus.Cancelled
  const paymentAcknowledged = Boolean(myOrder.workerPaymentAcknowledgedAt)

  if (isOrderWorker) {
    return (
      <SectionCard eyebrow="Your job" heading="Close out this job" bodyGap={3}>
        <Text fontSize="sm" color="formLabelMuted">
          Mark the job done when work is finished. Payment is handled directly
          with the customer — not through Slashie.
        </Text>

        {jobActionError ? (
          <Text fontSize="sm" color="red.500">
            {jobActionError}
          </Text>
        ) : null}

        {status === OrderStatus.Active ? (
          <Button
            type="button"
            w="full"
            loading={completingOrder}
            onClick={() => void onCompleteOrder()}
          >
            Mark job as done
          </Button>
        ) : isClosed ? (
          <Text fontSize="sm" color="formLabelMuted">
            This job is closed. Thanks for completing the work.
          </Text>
        ) : (
          <Stack gap={3}>
            <Text fontSize="sm" color="formLabelMuted">
              Waiting for the customer to confirm completion.
            </Text>
            {!paymentAcknowledged ? (
              <Button
                type="button"
                w="full"
                variant="secondary"
                loading={acknowledgingOrderPayment}
                onClick={() => void onAcknowledgeOrderPayment()}
              >
                Payment received
              </Button>
            ) : (
              <Box
                p={3}
                borderRadius="lg"
                bg="neutral.100"
                fontSize="sm"
                color="formLabelMuted"
              >
                Payment received noted{' '}
                {myOrder.workerPaymentAcknowledgedAt
                  ? formatRelativeTime(myOrder.workerPaymentAcknowledgedAt)
                  : ''}
                . The customer still needs to confirm the job.
              </Box>
            )}
          </Stack>
        )}
      </SectionCard>
    )
  }

  if (
    isOrderCustomer &&
    (status === OrderStatus.WorkCompleted ||
      status === OrderStatus.PaymentAcknowledged)
  ) {
    return (
      <SectionCard
        eyebrow="Confirm completion"
        heading="Is the job finished?"
        bodyGap={3}
      >
        <Text fontSize="sm" color="formLabelMuted">
          Confirm when you are satisfied with the work. This closes your order
          on Slashie. You pay the worker directly outside the app.
        </Text>

        {paymentAcknowledged ? (
          <Text fontSize="sm" color="formLabelMuted">
            Worker noted payment received{' '}
            {myOrder.workerPaymentAcknowledgedAt
              ? formatRelativeTime(myOrder.workerPaymentAcknowledgedAt)
              : ''}
            .
          </Text>
        ) : null}

        {jobActionError ? (
          <Text fontSize="sm" color="red.500">
            {jobActionError}
          </Text>
        ) : null}

        <Button
          type="button"
          w="full"
          loading={confirmingOrder}
          onClick={() => void onConfirmOrder()}
        >
          Confirm job complete
        </Button>
      </SectionCard>
    )
  }

  if (isOrderCustomer && isClosed) {
    return (
      <SectionCard eyebrow="Order" heading="Job closed" bodyGap={2}>
        <Text fontSize="sm" color="formLabelMuted">
          This order is closed on Slashie.
        </Text>
      </SectionCard>
    )
  }

  return null
}
