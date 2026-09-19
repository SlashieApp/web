'use client'

import { useI11n } from '@/i18n/useI11n'
import { Stack, Text } from '@chakra-ui/react'
import { LuShare2 } from 'react-icons/lu'
import bag from '../../../i11n.json'

import { Button, Card } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import { TASK_DETAIL_TAB } from '../../../helpers/taskDetailTabs'
import { useShareTask } from './shareTask'

/** Owner sticky card: share the task, plus view-quotes when that is primary. */
export function TaskShareCard() {
  const t = useI11n(bag)
  const { task, permissions, setActiveTab } = useTaskDetail()
  const onShare = useShareTask(task?.title?.trim() || t.fallbackTask)

  if (!task || !permissions.isOwner) return null

  const quoteCount = task.quotes.length
  const showViewQuotes = permissions.isOpen && quoteCount > 0

  return (
    <Card
      layout="section"
      eyebrow={t.cta.shareEyebrow}
      heading={t.cta.shareHeading}
      bodyGap={3}
    >
      <Text fontSize="sm" color="text.muted" lineHeight="short">
        {t.cta.shareBody}
      </Text>
      <Stack gap={2}>
        {showViewQuotes ? (
          <Button
            variant="primary"
            w="full"
            onClick={() => setActiveTab(TASK_DETAIL_TAB.quotes)}
          >
            {t.cta.viewQuotes}
          </Button>
        ) : null}
        <Button
          variant={showViewQuotes ? 'secondary' : 'primary'}
          w="full"
          onClick={() => void onShare()}
        >
          <LuShare2 />
          {t.cta.shareTask}
        </Button>
      </Stack>
    </Card>
  )
}
