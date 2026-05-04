'use client'

import { Grid, Stack, Text } from '@chakra-ui/react'

import { SectionCard } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  averageHoursToQuotes,
  formatAvgResponseHours,
  ownerProInterestLabel,
} from '../../helpers/taskDetailUtils'

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

export function QuoteOwnerPerformanceCard() {
  const { task, isOwner } = useTaskDetail()
  if (!isOwner || !task) return null

  const n = task.quotes.length
  const avgH = averageHoursToQuotes(task)
  const interest = ownerProInterestLabel(n)

  return (
    <SectionCard
      id="owner-task-performance"
      scrollMarginTop="96px"
      eyebrow="Insights"
      heading="Task performance"
      bodyGap={3}
      bg="primary.50"
      p={{ base: 5, md: 6 }}
    >
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
      <Text fontSize="xs" color="formLabelMuted" lineHeight="short">
        View counts are not tracked on web yet. Response time is averaged from
        quote timestamps.
      </Text>
    </SectionCard>
  )
}
