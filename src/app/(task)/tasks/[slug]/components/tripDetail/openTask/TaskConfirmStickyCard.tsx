'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { showAppToast } from '@/utils/appToast'
import { Button, Card, SafetyNotice } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import { TASK_DETAIL_TAB } from '../../../helpers/taskDetailTabs'
import bag from '../../../i11n.json'

/** Compact owner completion pin: code + jump to the full booking card. */
export function TaskConfirmStickyCard() {
  const t = useI11n(bag)
  const { myOrder, setActiveTab } = useTaskDetail()
  const code = myOrder?.completionVerificationCode?.trim() ?? ''

  return (
    <Card layout="section" heading={t.sticky.confirmHeading}>
      <Stack gap={3}>
        <Text fontSize="sm" color="text.muted" lineHeight="short">
          {t.sticky.confirmBody}
        </Text>
        {code ? (
          <HStack gap={3} align="center" justify="space-between">
            <Text
              fontFamily="mono"
              fontSize="2xl"
              fontWeight={700}
              letterSpacing="0.2em"
            >
              {code}
            </Text>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                void navigator.clipboard.writeText(code).then(
                  () => {
                    showAppToast({
                      title: t.booking.codeCopiedTitle,
                      description: t.booking.codeCopiedDescription,
                      type: 'success',
                    })
                  },
                  () => {
                    showAppToast({
                      title: t.booking.codeCopyFailedTitle,
                      description: t.booking.codeCopyFailedDescription,
                      type: 'error',
                    })
                  },
                )
              }}
            >
              {t.booking.copyCode}
            </Button>
          </HStack>
        ) : (
          <Text fontSize="sm" color="text.muted">
            {t.booking.codePending}
          </Text>
        )}
        <SafetyNotice variant="inline" />
        <Button
          variant="primary"
          w="full"
          onClick={() => {
            setActiveTab(TASK_DETAIL_TAB.overview, {
              hash: 'task-order',
              scrollId: 'task-order',
            })
          }}
        >
          {t.cta.confirm}
        </Button>
      </Stack>
    </Card>
  )
}
