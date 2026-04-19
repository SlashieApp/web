'use client'

import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { Box, Stack } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'

import {
  type TaskBudgetViewerContext,
  type TaskDetailRecord,
  taskBudgetDisplayLine,
} from './taskDetailUtils'

export type TaskDetailHeroProps = {
  task: TaskDetailRecord
  statusBadgeLabel: string
  budgetViewer: TaskBudgetViewerContext
  viewerUserId?: string | null
}

export function TaskDetailHero({
  task,
  statusBadgeLabel,
  budgetViewer,
  viewerUserId,
}: TaskDetailHeroProps) {
  const locationLine = taskPublicLocationLabel(task)
  const budgetLine = taskBudgetDisplayLine(task, budgetViewer, viewerUserId)

  return (
    <Box p={{ base: 5, md: 6 }} borderColor="cardBorder" boxShadow="ambient">
      <Stack gap={4}>
        <Box
          as="span"
          display="inline-flex"
          alignSelf="flex-start"
          alignItems="center"
          gap={2}
          px={3}
          py={1.5}
          borderRadius="full"
          bg="#F2994A"
          color="white"
          fontSize="11px"
          fontWeight={800}
          letterSpacing="0.08em"
        >
          <Box
            as="span"
            w="6px"
            h="6px"
            borderRadius="full"
            bg="white"
            aria-hidden
          />
          {statusBadgeLabel}
        </Box>

        <Stack gap={1} pt={1}>
          <Text
            fontSize="xs"
            fontWeight={700}
            color="formLabelMuted"
            letterSpacing="0.06em"
          >
            BUDGET
          </Text>
          <Text
            fontSize={{ base: 'xl', md: '2xl' }}
            fontWeight={800}
            color="primary.600"
          >
            {budgetLine}
          </Text>
        </Stack>

        {locationLine ? (
          <Text fontSize="sm" color="formLabelMuted">
            {locationLine}
          </Text>
        ) : null}
      </Stack>
    </Box>
  )
}
