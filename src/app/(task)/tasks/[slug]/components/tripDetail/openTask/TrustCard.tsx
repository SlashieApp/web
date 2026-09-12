'use client'

import { Stack } from '@chakra-ui/react'

import { ReportControl, SafetyNotice } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'

/**
 * C2C pay + meet-safely panel, plus a report entry so visitors do not have to
 * hunt through Terms.
 */
export function TrustCard() {
  const { task } = useTaskDetail()

  return (
    <Stack gap={3} w="full">
      <SafetyNotice variant="panel" />
      {task ? (
        <ReportControl
          kind="task"
          targetId={task.id}
          targetTitle={task.title?.trim() || undefined}
          variant="button"
        />
      ) : null}
    </Stack>
  )
}
