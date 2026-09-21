'use client'

import { Box, HStack } from '@chakra-ui/react'
import { LuPencil, LuShare2 } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { Button, Card, IconButton, Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  TASK_DETAIL_RAIL_CARD,
  TASK_DETAIL_SECTION_CARD,
} from '../../helpers/taskDetailLayout'
import bag from '../../i11n.json'
import { TaskDetailPinCard } from '../ui/TaskDetailPinCard'
import { useShareTask } from './shareTask'

type TaskShareCardProps = {
  compact?: boolean
  rail?: boolean
}

/** Owner share card — compact pin on mobile, compact rail CTA on web. */
export function TaskShareCard({
  compact = false,
  rail = false,
}: TaskShareCardProps) {
  const { task, permissions } = useTaskDetail()
  const t = useI11n(bag)
  const onShare = useShareTask(task?.title?.trim() || t.fallbackTask)

  if (!task) return null

  const dense = compact || rail
  const edit = permissions.canEditTask ? (
    <IconButton
      asChild
      variant="ghost"
      size={dense ? 'sm' : undefined}
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
      size={dense ? 'sm' : undefined}
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

  if (rail) {
    return (
      <Card
        {...TASK_DETAIL_RAIL_CARD}
        eyebrow={t.share.pinHeading}
        description={t.share.pinBody}
      >
        <HStack gap={2} align="center" w="full">
          <Box flex="1" minW={0}>
            {shareButton}
          </Box>
          {edit}
        </HStack>
      </Card>
    )
  }

  return (
    <Card
      {...TASK_DETAIL_SECTION_CARD}
      eyebrow={t.share.pinHeading}
      description={t.share.pinBody}
    >
      <HStack gap={2} align="center" w="full">
        <Box flex="1" minW={0}>
          {shareButton}
        </Box>
        {edit}
      </HStack>
    </Card>
  )
}
