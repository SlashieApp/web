'use client'

import { useI11n } from '@/i18n/useI11n'
import { Stack, Text } from '@chakra-ui/react'
import { OrderStatus } from '@codegen/schema'
import { useCallback, useState } from 'react'
import bag from '../../i11n.json'

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
  const t = useI11n(bag)
  const v = t.verification

  const [expanded, setExpanded] = useState(initialExpanded)

  const onCodeChange = useCallback(
    (value: string) => {
      setVerificationCode(normalizeVerificationCode(value))
    },
    [setVerificationCode],
  )

  if (!myOrder || !permissions.showCompleteWithCode) return null

  const status = myOrder.status
  if (status !== OrderStatus.Active) {
    return (
      <Card
        layout="section"
        eyebrow={v.eyebrow}
        heading={v.awaitingHeading}
        bodyGap={2}
      >
        <Text fontSize="sm" color="text.muted">
          {v.inactiveBody}
        </Text>
      </Card>
    )
  }

  return (
    <Card
      layout="section"
      id="worker-job-panel"
      eyebrow={v.eyebrow}
      heading={v.completeHeading}
      bodyGap={3}
    >
      <Text fontSize="sm" color="text.muted">
        {v.instructions}
      </Text>

      {jobActionError ? (
        <Text fontSize="sm" color="status.danger.fg">
          {jobActionError}
        </Text>
      ) : null}

      {!expanded ? (
        <Button type="button" w="full" onClick={() => setExpanded(true)}>
          {v.enterCodeCta}
        </Button>
      ) : (
        <Stack gap={3}>
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder={v.placeholder}
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
            {v.submit}
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
            {v.cancel}
          </Button>
        </Stack>
      )}
    </Card>
  )
}
