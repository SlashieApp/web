'use client'

import { Box, HStack, Heading, Image, Stack, Text } from '@chakra-ui/react'

import { useTaskDetail } from '../context/TaskDetailProvider'
import type { TaskDetailRecord } from '../helpers/taskDetailUtils'

function posterDisplayName(task: TaskDetailRecord): string {
  const profileName = task.poster?.profile?.name?.trim()
  if (profileName) return profileName
  return 'Task owner'
}

export function TaskOwnerCard() {
  const { task } = useTaskDetail()
  if (!task) return null

  const posterName = posterDisplayName(task)
  const posterAvatarUrl = task.poster?.profile?.avatarUrl?.trim() || null
  const posterInitials =
    posterName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || 'TO'

  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="xl"
      bg="bg.surface"
      p={{ base: 4, md: 5 }}
      w="full"
    >
      <HStack align="flex-start" gap={4} w="full">
        <Box
          flexShrink={0}
          boxSize="56px"
          borderRadius="full"
          bg="status.success.soft"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="status.success.fg"
          fontWeight={800}
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
        <Stack gap={1} flex={1} minW={0}>
          <Text
            fontSize="xs"
            fontWeight={700}
            color="text.muted"
            letterSpacing="0.06em"
            textTransform="uppercase"
          >
            Task owner
          </Text>
          <Heading size="sm" lineHeight="short">
            {posterName}
          </Heading>
        </Stack>
      </HStack>
    </Box>
  )
}
