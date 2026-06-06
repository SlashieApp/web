'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'

import { useWorkerQuotes } from '../context/WorkerQuotesProvider'

export function WorkerQuoteQuickStats() {
  const { summaryCounts } = useWorkerQuotes()

  return (
    <Stack gap={2}>
      <Text
        fontSize="xs"
        fontWeight={700}
        letterSpacing="0.08em"
        color="formLabelMuted"
        textTransform="uppercase"
      >
        Quick stats
      </Text>
      <HStack gap={2}>
        <StatPill
          label="Pending"
          value={summaryCounts.pending}
          tone="secondary"
        />
        <StatPill label="Booked" value={summaryCounts.booked} tone="primary" />
        <StatPill
          label="Today"
          value={summaryCounts.actionToday}
          tone="neutral"
        />
      </HStack>
    </Stack>
  )
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'primary' | 'secondary' | 'neutral'
}) {
  const palette =
    tone === 'primary'
      ? { bg: 'primary.100', color: 'primary.800' }
      : tone === 'secondary'
        ? { bg: 'secondary.100', color: 'secondary.800' }
        : { bg: 'badgeBg', color: 'cardFg' }

  return (
    <Stack
      flex={1}
      gap={0.5}
      p={2}
      borderRadius="lg"
      bg={palette.bg}
      align="center"
      minW={0}
    >
      <Text fontSize="lg" fontWeight={800} color={palette.color} lineHeight={1}>
        {value}
      </Text>
      <Text
        fontSize="2xs"
        fontWeight={600}
        color={palette.color}
        opacity={0.85}
      >
        {label}
      </Text>
    </Stack>
  )
}
