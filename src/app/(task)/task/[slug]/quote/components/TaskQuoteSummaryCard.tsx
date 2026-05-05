'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  budgetKindLabel,
  taskAvailabilityRangeLabel,
} from '../../helpers/taskDetailUtils'

export function TaskQuoteSummaryCard() {
  const { task } = useTaskDetail()
  if (!task) return null
  const thumb = task.images?.[0]?.trim()
  const locationLine = taskPublicLocationLabel(task)
  const kind = budgetKindLabel(task.budget?.type)
  const when = taskAvailabilityRangeLabel(task)

  return (
    <HStack
      align="start"
      gap={3}
      p={3}
      rounded="xl"
      bg="cardBg"
      boxShadow="card"
    >
      {thumb ? (
        <Box w="72px" h="72px" rounded="lg" overflow="hidden" flexShrink={0}>
          <img
            src={thumb}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      ) : (
        <Box w="72px" h="72px" rounded="lg" bg="badgeBg" flexShrink={0} />
      )}
      <Stack gap={1} minW={0}>
        <Text
          fontWeight={700}
          fontSize="sm"
          lineClamp={2}
          color="secondary.900"
        >
          {task.title}
        </Text>
        {locationLine ? (
          <Text fontSize="xs" color="formLabelMuted" lineClamp={2}>
            {locationLine}
          </Text>
        ) : null}
        <Text fontSize="xs" color="formLabelMuted">
          {when}
        </Text>
        {kind ? (
          <Text fontSize="xs" fontWeight={600} color="secondary.600">
            {kind}
          </Text>
        ) : null}
      </Stack>
    </HStack>
  )
}
