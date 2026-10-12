'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import {
  budgetKindLabel,
  taskAvailabilityRangeLabel,
} from '@/app/(task)/tasks/[slug]/helpers/taskDetailUtils'

import bag from '../../../i11n.json'

export function TaskQuoteSummaryCard() {
  const { task } = useTaskDetail()
  const t = useI11n(bag)
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
      rounded="lg"
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      boxShadow="e1"
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
        <Box
          w="72px"
          h="72px"
          rounded="lg"
          bg="status.success.soft"
          flexShrink={0}
        />
      )}
      <Stack gap={1} minW={0}>
        <Text fontWeight={700} fontSize="sm" lineClamp={2} color="text.link">
          {task.title}
        </Text>
        {locationLine ? (
          <Text fontSize="xs" color="text.muted" lineClamp={2}>
            {locationLine}
          </Text>
        ) : null}
        {/* FE-70: the quoting worker sees only the approximate area. */}
        <Text fontSize="xs" color="text.muted">
          {t.locationNote}
        </Text>
        <Text fontSize="xs" color="text.muted">
          {when}
        </Text>
        {kind ? (
          <Text fontSize="xs" fontWeight={600} color="text.link">
            {kind}
          </Text>
        ) : null}
      </Stack>
    </HStack>
  )
}
