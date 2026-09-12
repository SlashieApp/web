'use client'

import { Box } from '@chakra-ui/react'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { StatusHeader } from './StatusHeader'
import { TASK_DETAIL_CTA_CLEARANCE, TaskDetailCtaBar } from './TaskDetailCtaBar'
import { TaskDetailSectionTabs } from './TaskDetailSectionTabs'

/**
 * Mobile (<lg) task-detail: map hero, then sticky title + status + budget +
 * Overview / Quotes / Activity tabs, then a floating role CTA.
 */
export function TaskDetailMobile() {
  const { task, pending } = useTaskDetail()

  if (!task && !pending) return null

  return (
    <Box pb={TASK_DETAIL_CTA_CLEARANCE}>
      <StatusHeader />
      <TaskDetailSectionTabs fitted px={4} />
      <TaskDetailCtaBar />
    </Box>
  )
}
