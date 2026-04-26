'use client'

import { Text } from '@chakra-ui/react'

import { formatRelativeTime } from '@/utils/formatRelativeTime'
import { Card } from '@ui'

export type TaskDetailPostedMetaProps = {
  createdAt: string | number | Date
}

export function TaskDetailPostedMeta({ createdAt }: TaskDetailPostedMetaProps) {
  return (
    <Card p={4} maxW="full" w="full">
      <Text fontSize="sm" color="formLabelMuted" fontWeight={500}>
        {formatRelativeTime(createdAt)}
      </Text>
    </Card>
  )
}
