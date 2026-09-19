'use client'

import { useI11n } from '@/i18n/useI11n'
import { Stack } from '@chakra-ui/react'
import bag from '../../../i11n.json'

import { Button, Card, SafetyNotice } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import { TASK_DETAIL_TAB } from '../../../helpers/taskDetailTabs'

/** Owner confirm-code chrome — highest-priority mobile sticky. */
export function TaskCompletionCard() {
  const t = useI11n(bag)
  const { permissions, setActiveTab } = useTaskDetail()

  if (!permissions.showCustomerCompletionCode) return null

  return (
    <Card layout="section" bodyGap={3}>
      <Stack gap={2}>
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
