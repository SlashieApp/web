'use client'

import { Text } from '@chakra-ui/react'

import { useTaskDetail } from '../../context/TaskDetailProvider'

export function TaskIntroText() {
  const { task, isOwner } = useTaskDetail()
  if (!task) return null

  const copy = isOwner
    ? 'Compare worker quotes and manage your task here. Payment is arranged between you and your worker outside Slashie.'
    : 'Review the scope, budget, photos, and availability. Sign in with a worker account to send a quote.'

  return (
    <Text color="formLabelMuted" fontSize="sm">
      {copy}
    </Text>
  )
}
