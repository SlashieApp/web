'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'

import { GlassCard, Heading, Text } from '@ui'

import type { TaskDetailRecord } from './taskDetailUtils'

function posterDisplayName(task: TaskDetailRecord): string {
  const profileName = task.poster?.profile?.name?.trim()
  if (profileName) return profileName
  const first = task.poster?.firstName?.trim() ?? ''
  const last = task.poster?.lastName?.trim() ?? ''
  const combined = `${first} ${last}`.trim()
  return combined || 'Task owner'
}

export type TaskDetailPosterSummaryProps = {
  task: TaskDetailRecord
}

export function TaskDetailPosterSummary({
  task,
}: TaskDetailPosterSummaryProps) {
  const name = posterDisplayName(task)

  return (
    <GlassCard p={{ base: 5, md: 6 }} borderColor="border" boxShadow="ambient">
      <HStack align="flex-start" gap={4}>
        <Box
          flexShrink={0}
          boxSize="56px"
          borderRadius="full"
          bg="primary.100"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="primary.700"
          fontWeight={800}
          fontSize="sm"
        >
          {name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase() ?? '')
            .join('') || 'TO'}
        </Box>
        <Stack gap={1} flex={1} minW={0}>
          <Text
            fontSize="xs"
            fontWeight={700}
            color="muted"
            letterSpacing="0.06em"
          >
            TASK OWNER
          </Text>
          <Heading size="sm" lineHeight="short">
            {name}
          </Heading>
        </Stack>
      </HStack>
    </GlassCard>
  )
}
