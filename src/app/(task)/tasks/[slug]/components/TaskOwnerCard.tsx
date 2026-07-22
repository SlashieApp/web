'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, HStack, Heading, Image } from '@chakra-ui/react'
import bag from '../i11n.json'

import { Card } from '@ui'

import { useTaskDetail } from '../context/TaskDetailProvider'
import type { TaskDetailRecord } from '../helpers/taskDetailUtils'

function posterDisplayName(task: TaskDetailRecord, fallback: string): string {
  const profileName = task.poster?.profile?.name?.trim()
  if (profileName) return profileName
  return fallback
}

export function TaskOwnerCard() {
  const { task } = useTaskDetail()
  const t = useI11n(bag)
  if (!task) return null

  const posterName = posterDisplayName(task, t.details.ownerFallback)
  const posterAvatarUrl = task.poster?.profile?.avatarUrl?.trim() || null
  const posterInitials =
    posterName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || 'TO'

  return (
    <Card layout="section" heading={t.details.owner}>
      <HStack align="center" gap={3} w="full">
        <Box
          flexShrink={0}
          boxSize="48px"
          borderRadius="full"
          bg="status.success.soft"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="status.success.fg"
          fontWeight={700}
          fontSize="sm"
          overflow="hidden"
        >
          {posterAvatarUrl ? (
            <Image
              src={posterAvatarUrl}
              alt={`${posterName} avatar`}
              w="full"
              h="full"
              objectFit="cover"
            />
          ) : (
            posterInitials
          )}
        </Box>
        <Heading size="sm" lineHeight="short" minW={0}>
          {posterName}
        </Heading>
      </HStack>
    </Card>
  )
}
