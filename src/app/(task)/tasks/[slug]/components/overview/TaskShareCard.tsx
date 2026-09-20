'use client'

import { HStack } from '@chakra-ui/react'
import { LuPencil, LuShare2 } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { Button, Card, IconButton, Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import bag from '../../i11n.json'
import { TaskDetailPinCard } from '../ui/TaskDetailPinCard'
import { useShareTask } from './shareTask'

type TaskShareCardProps = {
  compact?: boolean
}

/** Owner share card — compact when pinned as the mobile CTA. */
export function TaskShareCard({ compact = false }: TaskShareCardProps) {
  const { task, permissions } = useTaskDetail()
  const t = useI11n(bag)
  const onShare = useShareTask(task?.title?.trim() || t.fallbackTask)

  if (!task) return null

  const edit = permissions.canEditTask ? (
    <IconButton
      asChild
      variant="ghost"
      size={compact ? 'sm' : undefined}
      aria-label={t.cta.editAria}
    >
      <Link href={`/tasks/${task.id}/edit`} _hover={{ textDecoration: 'none' }}>
        <LuPencil />
      </Link>
    </IconButton>
  ) : null

  const shareButton = (
    <Button
      variant="primary"
      size={compact ? 'sm' : undefined}
      w={compact ? undefined : 'full'}
      onClick={() => void onShare()}
    >
      <LuShare2 />
      {t.cta.shareTask}
    </Button>
  )

  if (compact) {
    return (
      <TaskDetailPinCard
        title={t.share.pinHeading}
        subtitle={t.share.pinBody}
        action={
          <HStack gap={1}>
            {shareButton}
            {edit}
          </HStack>
        }
      />
    )
  }

  return (
    <Card
      {...TASK_DETAIL_SECTION_CARD}
      eyebrow={t.share.pinHeading}
      description={t.share.pinBody}
    >
      <HStack gap={2} align="center">
        {shareButton}
        {edit}
      </HStack>
    </Card>
  )
}
