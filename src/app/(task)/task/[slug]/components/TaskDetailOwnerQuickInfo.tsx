'use client'

import { Grid, HStack, Stack, Text } from '@chakra-ui/react'

import { formatTaskCategoryLabel } from '@/utils/taskLocationDisplay'
import { GlassCard, IconWrench } from '@ui'

import {
  type TaskDetailRecord,
  taskAvailabilityRangeLabel,
  taskOwnerPostedBudgetLine,
} from './taskDetailUtils'

export type TaskDetailOwnerQuickInfoProps = {
  task: TaskDetailRecord
}

export function TaskDetailOwnerQuickInfo({
  task,
}: TaskDetailOwnerQuickInfoProps) {
  const budget = taskOwnerPostedBudgetLine(task)
  const category = formatTaskCategoryLabel(task.category)
  const availability = taskAvailabilityRangeLabel(task)

  return (
    <Grid
      templateColumns={{
        base: '1fr',
        sm: 'repeat(3, minmax(0, 1fr))',
      }}
      gap={3}
    >
      <GlassCard p={4} borderColor="border" boxShadow="ambient">
        <Stack gap={1}>
          <Text
            fontSize="10px"
            fontWeight={800}
            color="muted"
            letterSpacing="0.08em"
          >
            BUDGET RANGE
          </Text>
          <Text fontSize="lg" fontWeight={800} color="primary.600">
            {budget}
          </Text>
        </Stack>
      </GlassCard>
      <GlassCard p={4} borderColor="border" boxShadow="ambient">
        <Stack gap={2}>
          <Text
            fontSize="10px"
            fontWeight={800}
            color="muted"
            letterSpacing="0.08em"
          >
            CATEGORY
          </Text>
          <HStack gap={2}>
            <IconWrench />
            <Text fontSize="md" fontWeight={700} color="fg">
              {category}
            </Text>
          </HStack>
        </Stack>
      </GlassCard>
      <GlassCard p={4} borderColor="border" boxShadow="ambient">
        <Stack gap={1}>
          <Text
            fontSize="10px"
            fontWeight={800}
            color="muted"
            letterSpacing="0.08em"
          >
            AVAILABILITY
          </Text>
          <Text fontSize="md" fontWeight={700} color="fg">
            {availability}
          </Text>
        </Stack>
      </GlassCard>
    </Grid>
  )
}
