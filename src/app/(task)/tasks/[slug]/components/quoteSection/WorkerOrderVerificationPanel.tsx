'use client'

import { Stack, Text } from '@chakra-ui/react'
import { OrderStatus } from '@codegen/schema'
import { useCallback, useState } from 'react'

import { Button, Card, Input } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'

function normalizeVerificationCode(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 6)
}

type WorkerOrderVerificationPanelProps = {
  /** Storybook: start with code entry visible. */
  initialExpanded?: boolean
}

export function WorkerOrderVerificationPanel({
  initialExpanded = false,
}: WorkerOrderVerificationPanelProps = {}) {
  const {
    myOrder,
    permissions,
    jobActionError,
    verificationCode,
    setVerificationCode,
    completingOrderWithVerification,
    onCompleteOrderWithVerification,
  } = useTaskDetail()

  const [expanded, setExpanded] = useState(initialExpanded)

  const onCodeChange = useCallback(
    (value: string) => {
      setVerificationCode(normalizeVerificationCode(value))
    },
    [setVerificationCode],
  )

  if (!myOrder || !permissions.isOrderWorker) return null

  const status = myOrder.status
  if (status !== OrderStatus.Active) {
    return (
      <Card
        layout="section"
        eyebrow="Your job"
        heading="Awaiting update"
        bodyGap={2}
      >
        <Text fontSize="sm" color="formLabelMuted">
          This order is no longer active. Refresh the page or contact support if
          something looks wrong.
        </Text>
      </Card>
    )
  }

  return (
    <Card
      layout="section"
      id="worker-job-panel"
      eyebrow="Your job"
      heading="Complete job & confirm payment"
      bodyGap={3}
    >
      <Text fontSize="sm" color="formLabelMuted">
        When the customer is happy with the work and has paid you directly, ask
        them for their 6-digit completion code. Enter it here to close the job
        on Slashie.
      </Text>

      {jobActionError ? (
        <Text fontSize="sm" color="red.500">
          {jobActionError}
        </Text>
      ) : null}

      {!expanded ? (
        <Button type="button" w="full" onClick={() => setExpanded(true)}>
          Complete job & confirm payment
        </Button>
      ) : (
        <Stack gap={3}>
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            value={verificationCode}
            maxLength={6}
            onChange={(e) => onCodeChange(e.target.value)}
            fontFamily="mono"
            letterSpacing="0.15em"
            textAlign="center"
            fontSize="lg"
          />
          <Button
            type="button"
            w="full"
            loading={completingOrderWithVerification}
            disabled={verificationCode.length !== 6}
            onClick={() => void onCompleteOrderWithVerification()}
          >
            Submit code & close job
          </Button>
          <Button
            type="button"
            w="full"
            variant="ghost"
            size="sm"
            onClick={() => {
              setExpanded(false)
              setVerificationCode('')
            }}
          >
            Cancel
          </Button>
        </Stack>
      )}
    </Card>
  )
}
