'use client'

import { Box, Grid, Stack, Text } from '@chakra-ui/react'
import { Card } from '@ui'

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
      <Card p={4} maxW="full" w="full">
        <Stack gap={1}>
          <Text
            fontSize="10px"
            fontWeight={800}
            color="formLabelMuted"
            letterSpacing="0.08em"
          >
            BUDGET
          </Text>
          <Text fontSize="lg" fontWeight={800} color="primary.600">
            {budget}
          </Text>
        </Stack>
      </Card>
      <Card p={4} maxW="full" w="full">
        <Stack gap={1}>
          <Text
            fontSize="10px"
            fontWeight={800}
            color="formLabelMuted"
            letterSpacing="0.08em"
          >
            TIMING
          </Text>
          <Text fontSize="md" fontWeight={700} color="cardFg">
            {availability}
          </Text>
        </Stack>
      </Card>
    </Grid>
  )
}
