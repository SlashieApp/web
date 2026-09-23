'use client'

import { useI11n } from '@/i18n/useI11n'
import { Stack, Text } from '@chakra-ui/react'
import { OrderStatus } from '@codegen/schema'
import { useCallback, useState } from 'react'
import bag from '../../i11n.json'

import { Button, Card, Input, SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'

function normalizeVerificationCode(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 6)
}

type WorkerOrderVerificationPanelProps = {
  /** Storybook: start with code entry visible. */
  initialExpanded?: boolean
  /** Render the form inside another card (the agreed-price card). */
  embedded?: boolean
}

export function WorkerOrderVerificationPanel({
  initialExpanded = false,
  embedded = false,
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
    if (embedded) return null
    return (
      <Card
        {...TASK_DETAIL_SECTION_CARD}
        eyebrow={v.awaitingHeading}
        description={v.inactiveBody}
      />
    )
  }

  const form = (
    <Stack gap={3} w="full">
      {embedded ? (
        <Text fontSize="sm" color="text.muted" lineHeight="short">
          {v.instructions}
        </Text>
      ) : null}
      <SafetyNotice variant="complete" />

      {jobActionError ? (
        <Text fontSize="sm" color="status.danger.fg">
          {jobActionError}
        </Text>
      ) : null}

      {!expanded ? (
        <Button
          type="button"
          w="full"
          variant={embedded ? 'secondary' : 'primary'}
          onClick={() => setExpanded(true)}
        >
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
    </Stack>
  )

  if (embedded) return form

  return (
    <Card
      {...TASK_DETAIL_SECTION_CARD}
      id="worker-job-panel"
      scrollMarginTop="140px"
      eyebrow={v.completeHeading}
      description={v.instructions}
    >
      {form}
    </Card>
  )
}
