'use client'

import { Stack } from '@chakra-ui/react'

import { ReportControl, SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TaskOwnerCard } from '../TaskOwnerCard'
import { TaskActivitySections } from './TaskActivitySections'
import { TaskDetailStatusCallout } from './TaskDetailMoneyChrome'
import { PhotosCard } from './openTask/PhotosCard'
import { QuotesPanel } from './openTask/QuotesPanel'
import { TaskDetailsCard } from './openTask/TaskDetailsCard'
import { TrustCard } from './openTask/TrustCard'

/**
 * The three task-detail section groups, shared by both form factors as
 * Overview · Quotes · Activity tabs.
 */

export function TaskInfoSections() {
  const { task, permissions, pending } = useTaskDetail()
  return (
    <Stack gap={5} w="full" minW={0} pointerEvents="auto">
      <TaskDetailStatusCallout />
      <TaskDetailsCard />
      {pending || permissions.isOwner ? null : <TaskOwnerCard />}
      <PhotosCard />
      {task ? (
        <Stack gap={2}>
          <SafetyNotice variant="inline" />
          <ReportControl
            kind="task"
            targetId={task.id}
            targetTitle={task.title?.trim() || undefined}
            variant="button"
          />
        </Stack>
      ) : null}
    </Stack>
  )
}

export function TaskQuoteSections() {
  return (
    <Stack gap={5} w="full" minW={0} pointerEvents="auto">
      <QuotesPanel />
      <TrustCard />
    </Stack>
  )
}

export { TaskActivitySections }
