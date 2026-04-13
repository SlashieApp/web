'use client'

import { Grid, Stack, Text } from '@chakra-ui/react'

import { GlassCard } from '@ui'

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
  const availability = taskAvailabilityRangeLabel(task)

  return (
    <Grid
      templateColumns={{
        base: '1fr',
        sm: 'repeat(2, minmax(0, 1fr))',
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
            BUDGET
          </Text>
          <Text fontSize="lg" fontWeight={800} color="primary.600">
            {budget}
          </Text>
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
            TIMING
          </Text>
          <Text fontSize="md" fontWeight={700} color="fg">
            {availability}
          </Text>
        </Stack>
      </GlassCard>
    </Grid>
  )
}
