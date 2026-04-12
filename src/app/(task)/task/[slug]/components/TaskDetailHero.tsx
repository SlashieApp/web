'use client'

import {
  formatTaskCategoryLabel,
  taskPublicLocationLabel,
} from '@/utils/taskLocationDisplay'
import { Box, Grid, Stack } from '@chakra-ui/react'
import { GlassCard, Text } from '@ui'

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
    <GlassCard p={{ base: 5, md: 6 }} borderColor="border" boxShadow="ambient">
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

        <Grid
          templateColumns={{ base: '1fr', sm: '1fr 1fr' }}
          gap={{ base: 4, sm: 8 }}
          pt={1}
        >
          <Stack gap={1}>
            <Text
              fontSize="xs"
              fontWeight={700}
              color="muted"
              letterSpacing="0.06em"
            >
              BUDGET RANGE
            </Text>
            <Text
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight={800}
              color="primary.600"
            >
              {budgetLine}
            </Text>
          </Stack>
          <Stack gap={1}>
            <Text
              fontSize="xs"
              fontWeight={700}
              color="muted"
              letterSpacing="0.06em"
            >
              CATEGORY
            </Text>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight={700}
              color="fg"
            >
              {formatTaskCategoryLabel(task.category)}
            </Text>
          </Stack>
        </Grid>

        {locationLine ? (
          <Text fontSize="sm" color="muted">
            {locationLine}
          </Text>
        ) : null}
      </Stack>
    </GlassCard>
  )
}
