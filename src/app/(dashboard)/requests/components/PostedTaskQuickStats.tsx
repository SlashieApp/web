'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'

import { useMyRequestsPage } from '../context/MyRequestsProvider'

export function PostedTaskQuickStats() {
  const { summaryCounts } = useMyRequestsPage()

  return (
    <Stack gap={2}>
      <Text
        fontSize="xs"
        fontWeight={700}
        letterSpacing="0.08em"
        color="text.muted"
        textTransform="uppercase"
      >
        Quick stats
      </Text>
      <HStack gap={2}>
        <StatPill
          label="Quoting"
          value={summaryCounts.quoting}
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
      ? { bg: 'status.success.soft', color: 'status.success.fg' }
      : tone === 'secondary'
        ? { bg: 'status.info.soft', color: 'status.info.fg' }
        : { bg: 'bg.subtle', color: 'text.default' }

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
