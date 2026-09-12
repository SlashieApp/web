'use client'

import { Stack } from '@chakra-ui/react'

import { ReportControl, SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TaskOwnerCard } from '../TaskOwnerCard'
import { BookingSection } from './openTask/BookingSection'
import { PhotosCard } from './openTask/PhotosCard'
import { QuotesPanel } from './openTask/QuotesPanel'
import { TaskDetailsCard } from './openTask/TaskDetailsCard'
import { TrustCard } from './openTask/TrustCard'

/**
 * The two task-detail section groups, shared verbatim by both form factors:
 * desktop renders info as the left column and quotes as the right column;
 * mobile renders them as the Info and Quotes tabs.
 */

export function TaskInfoSections() {
  const { task, permissions, pending } = useTaskDetail()
  return (
    <Stack gap={5} w="full" minW={0} pointerEvents="auto">
      {/* "Your booking" section (active order / closed); null otherwise. */}
      <BookingSection />
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
      {/* Quotes stay visible across states (shows the selected quote once
          awarded); the payments/trust note sits directly under them. */}
      <QuotesPanel />
      <TrustCard />
    </Stack>
  )
}
