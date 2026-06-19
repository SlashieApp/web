'use client'

import { Grid, Stack, Text } from '@chakra-ui/react'

import { Card } from '@ui'

import { useWorkerProfile } from '../context/WorkerProfileContext'

type StatItem = {
  label: string
  value: string
}

function StatTile({ label, value }: StatItem) {
  return (
    <Stack
      gap={1}
      p={4}
      borderRadius="lg"
      bg="neutral.100"
      minH="88px"
      justify="center"
    >
      <Text
        fontSize="xs"
        fontWeight={700}
        color="formLabelMuted"
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Text fontSize="xl" fontWeight={800} color="cardFg" lineHeight="shorter">
        {value}
      </Text>
    </Stack>
  )
}

export function StatsGrid() {
  const { worker } = useWorkerProfile()

  const stats: StatItem[] = []

  if (worker.tasksCompletedCount != null) {
    stats.push({
      label: 'Tasks completed',
      value: String(worker.tasksCompletedCount),
    })
  }

  if (worker.yearsExperience != null) {
    stats.push({
      label: 'Years experience',
      value:
        worker.yearsExperience === 1
          ? '1 year'
          : `${worker.yearsExperience} years`,
    })
  }

  if (worker.averageResponseTime?.trim()) {
    stats.push({
      label: 'Avg. response time',
      value: worker.averageResponseTime.trim(),
    })
  }

  if (stats.length === 0) return null

  return (
    <Card layout="section" eyebrow="Stats" heading="At a glance">
      <Grid
        templateColumns={{
          base: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
        gap={3}
        w="full"
      >
        {stats.map((stat) => (
          <StatTile key={stat.label} {...stat} />
        ))}
      </Grid>
    </Card>
  )
}
