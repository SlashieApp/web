'use client'

import { Stack } from '@chakra-ui/react'

import { useTaskDetail } from '../../context/TaskDetailProvider'

import { TaskMainContent } from './TaskMainContent'
import { TaskMainHeader } from './TaskMainHeader'

export function TaskMainSection() {
  const { task } = useTaskDetail()
  if (!task) return null

  return (
    <Stack gap={{ base: 6, lg: 8 }}>
      <TaskMainHeader />
      <TaskMainContent />
    </Stack>
  )
}
