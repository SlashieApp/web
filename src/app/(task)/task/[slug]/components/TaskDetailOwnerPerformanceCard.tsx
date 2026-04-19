'use client'

import { Box, Grid, Stack, Text } from '@chakra-ui/react'

import {
  type TaskDetailRecord,
  averageHoursToQuotes,
  formatAvgResponseHours,
  ownerProInterestLabel,
} from './taskDetailUtils'

export type TaskDetailOwnerPerformanceCardProps = {
  task: TaskDetailRecord
}

function StatCell({
  label,
  value,
  valueColor = 'cardFg',
}: {
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <Stack
      gap={1}
      p={3}
      borderRadius="lg"
      bg="white"
      borderWidth="1px"
      borderColor="primary.100"
    >
      <Text
        fontSize="10px"
        fontWeight={800}
        color="formLabelMuted"
        letterSpacing="0.08em"
      >
        {label}
      </Text>
      <Text fontSize="lg" fontWeight={800} color={valueColor}>
        {value}
      </Text>
    </Stack>
  )
}

export function TaskDetailOwnerPerformanceCard({
  task,
}: TaskDetailOwnerPerformanceCardProps) {
  const n = task.quotes.length
  const avgH = averageHoursToQuotes(task)
  const interest = ownerProInterestLabel(n)

  return (
    <Box
      id="owner-task-performance"
      scrollMarginTop="96px"
      p={5}
      borderColor="cardBorder"
      bg="primary.50"
      boxShadow="ambient"
    >
      <Text fontSize="sm" fontWeight={700} color="cardFg" mb={4}>
        Task performance
      </Text>
      <Grid templateColumns="1fr 1fr" gap={3}>
        <StatCell label="VIEWS" value="—" />
        <StatCell label="QUOTES" value={String(n)} />
        <StatCell
          label="AVG. RESPONSE"
          value={avgH != null ? formatAvgResponseHours(avgH) : '—'}
        />
        <StatCell
          label="PRO INTEREST"
          value={interest}
          valueColor="secondary.700"
        />
      </Grid>
      <Text fontSize="xs" color="formLabelMuted" mt={3} lineHeight="short">
        View counts are not tracked on web yet. Response time is averaged from
        quote timestamps.
      </Text>
    </Box>
  )
}
