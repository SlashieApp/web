'use client'

import { Heading, Stack, Text } from '@chakra-ui/react'

import { SectionCard } from '@ui'

export function DashboardMetricCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <SectionCard p={5} bodyGap={2}>
      <Stack gap={2}>
        <Text
          fontSize="10px"
          fontWeight={800}
          letterSpacing="0.08em"
          color="formLabelMuted"
          textTransform="uppercase"
        >
          {label}
        </Text>
        <Heading size="lg" color="secondary.900">
          {value}
        </Heading>
        <Text fontSize="sm" color="formLabelMuted">
          {helper}
        </Text>
      </Stack>
    </SectionCard>
  )
}
