'use client'

import { Box, Grid, HStack, Heading, Stack, Text } from '@chakra-ui/react'

import { DashboardMetricCard } from '@/app/dashboard/components/DashboardMetricCard'
import { DashboardPageHeader } from '@/app/dashboard/components/DashboardPageHeader'
import { useDashboardData } from '@/app/dashboard/context'
import { formatDate, formatPounds } from '@/utils/dashboardHelpers'
import { Badge, SectionCard } from '@ui'

export default function DashboardHistoryPage() {
  const { search, workerServiceHistory } = useDashboardData()

  const filteredHistory = workerServiceHistory.filter((entry) => {
    const q = search.trim().toLowerCase()
    if (!q) return true

    return (
      entry.title.toLowerCase().includes(q) ||
      entry.location.toLowerCase().includes(q) ||
      entry.summary.toLowerCase().includes(q) ||
      entry.role.toLowerCase().includes(q)
    )
  })

  const totalHistoryValue = filteredHistory.reduce(
    (sum, entry) => sum + entry.valuePence,
    0,
  )

  return (
    <Stack gap={8}>
      <DashboardPageHeader
        title="Service history"
        description="Completed worker tasks from quotes that progressed to finished work. Customer history for tasks you posted lives under Requests."
      />

      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <DashboardMetricCard
          label="History items"
          value={String(filteredHistory.length)}
          helper="Records matching the current dashboard search."
        />
        <DashboardMetricCard
          label="Total value"
          value={formatPounds(totalHistoryValue)}
          helper="Combined value from worker history on this page."
        />
        <DashboardMetricCard
          label="Export status"
          value="Ready"
          helper="Record summaries can be exported when API support is added."
        />
      </Grid>

      {filteredHistory.length === 0 ? (
        <SectionCard p={6}>
          <Text color="formLabelMuted">
            No worker history matches your current search. Try a task title or
            location.
          </Text>
        </SectionCard>
      ) : (
        <Stack gap={4}>
          {filteredHistory.map((entry) => (
            <SectionCard key={entry.id} p={5}>
              <HStack
                justify="space-between"
                align="flex-start"
                gap={4}
                flexWrap="wrap"
              >
                <Stack gap={2} maxW="3xl">
                  <HStack gap={2} flexWrap="wrap">
                    <Heading size="sm" color="secondary.900">
                      {entry.title}
                    </Heading>
                    <Badge bg="green.100" color="secondary.600">
                      Worker record
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="formLabelMuted">
                    {entry.location} · {formatDate(entry.completedAt)}
                  </Text>
                  <Text fontSize="sm">{entry.summary}</Text>
                </Stack>
                <Text fontWeight={800}>{formatPounds(entry.valuePence)}</Text>
              </HStack>
            </SectionCard>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
