'use client'

import { Heading, Stack } from '@chakra-ui/react'

import { Tag } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { centerColumnStatusLabel } from '../../helpers/taskDetailUtils'

export function MainSectionHeader() {
  const { task, isOwner } = useTaskDetail()
  if (!task) return null

  const taskStatusLabel = centerColumnStatusLabel(task, isOwner)

  return (
    <Stack gap={4} w="full">
      <Tag color="primary">{taskStatusLabel}</Tag>
      <Heading
        size={{ base: 'xl', md: '2xl' }}
        fontWeight={800}
        lineHeight="short"
      >
        {task.title}
      </Heading>
    </Stack>
  )
}
