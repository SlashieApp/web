'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'
import { LuPencil, LuShare2 } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { Button, Card, IconButton, Link } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import { TASK_DETAIL_TAB } from '../../../helpers/taskDetailTabs'
import bag from '../../../i11n.json'
import { useShareTask } from './shareTask'

/**
 * Owner sticky body: share the task. When quotes exist this is still one
 * card — view-quotes is an action here, not a second pin.
 */
export function TaskShareCard() {
  const t = useI11n(bag)
  const { task, permissions, setActiveTab } = useTaskDetail()
  const onShare = useShareTask(task?.title?.trim() || t.fallbackTask)

  if (!task) return null

  const hasQuotes = task.quotes.length > 0
  const editHref = `/tasks/${task.id}/edit`

  return (
    <Card layout="section" heading={t.share.heading} p={4}>
      <Stack gap={3}>
        <Text fontSize="sm" color="text.muted" lineHeight="short">
          {t.share.body}
        </Text>
        <HStack gap={2} align="center">
          {hasQuotes ? (
            <Button
              variant="primary"
              flex="1"
              onClick={() => setActiveTab(TASK_DETAIL_TAB.quotes)}
            >
              {t.cta.viewQuotes}
            </Button>
          ) : null}
          <Button
            variant={hasQuotes ? 'secondary' : 'primary'}
            flex="1"
            onClick={() => void onShare()}
          >
            <LuShare2 />
            {t.cta.shareTask}
          </Button>
          {permissions.canEditTask ? (
            <IconButton asChild variant="ghost" aria-label={t.cta.editAria}>
              <Link href={editHref} _hover={{ textDecoration: 'none' }}>
                <LuPencil />
              </Link>
            </IconButton>
          ) : null}
        </HStack>
      </Stack>
    </Card>
  )
}
