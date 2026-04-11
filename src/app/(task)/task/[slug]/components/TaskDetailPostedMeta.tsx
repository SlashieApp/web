'use client'

import { Text } from '@chakra-ui/react'

import { formatRelativeTime } from '@/utils/formatRelativeTime'
import { GlassCard } from '@ui'

export type TaskDetailPostedMetaProps = {
  createdAt: string | number | Date
}

export function TaskDetailPostedMeta({ createdAt }: TaskDetailPostedMetaProps) {
  return (
    <GlassCard p={4} borderColor="border" boxShadow="ambient">
      <Text fontSize="sm" color="muted" fontWeight={500}>
        {formatRelativeTime(createdAt)}
      </Text>
    </GlassCard>
  )
}
