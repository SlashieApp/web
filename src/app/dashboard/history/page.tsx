'use client'

import { Grid, HStack, Stack } from '@chakra-ui/react'

import { useDashboardData } from '@/features/dashboard/DashboardDataContext'
import { formatDate, formatPounds } from '@/features/dashboard/dashboardHelpers'
import { Badge, GlassCard, Heading, Text } from '@ui'

export default function DashboardHistoryPage() {
  const { search, serviceHistory } = useDashboardData()

  const filteredHistory = serviceHistory.filter((entry) => {
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
      <Stack gap={2}>
        <Heading size="xl">Service History</Heading>
        <Text color="muted" maxW="3xl">
          Review completed jobs, archived work, and quick financial records for
          both customer and worker activity.
        </Text>
      </Stack>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <GlassCard p={5}>
          <Stack gap={2}>
            <Text
              fontSize="10px"
              fontWeight={800}
              letterSpacing="0.08em"
              color="muted"
            >
              HISTORY ITEMS
            </Text>
            <Heading size="lg">{filteredHistory.length}</Heading>
            <Text fontSize="sm" color="muted">
              Records matching the current dashboard search.
            </Text>
          </Stack>
        </GlassCard>
        <GlassCard p={5}>
          <Stack gap={2}>
            <Text
              fontSize="10px"
              fontWeight={800}
              letterSpacing="0.08em"
              color="muted"
            >
              TOTAL VALUE
            </Text>
            <Heading size="lg">{formatPounds(totalHistoryValue)}</Heading>
            <Text fontSize="sm" color="muted">
              Combined customer and worker record value shown on this page.
            </Text>
          </Stack>
        </GlassCard>
        <GlassCard p={5}>
          <Stack gap={2}>
            <Text
              fontSize="10px"
              fontWeight={800}
              letterSpacing="0.08em"
              color="muted"
            >
              EXPORT STATUS
            </Text>
            <Heading size="lg">Ready</Heading>
            <Text fontSize="sm" color="muted">
              Demo-ready record summaries can be exported from future API work.
            </Text>
          </Stack>
        </GlassCard>
      </Grid>

      {filteredHistory.length === 0 ? (
        <GlassCard p={6}>
          <Text color="muted">
            No history items match your current search. Try a task title,
            location, or role such as customer or worker.
          </Text>
        </GlassCard>
      ) : (
        <Stack gap={4}>
          {filteredHistory.map((entry) => (
            <GlassCard key={entry.id} p={5}>
              <HStack
                justify="space-between"
                align="flex-start"
                gap={4}
                flexWrap="wrap"
              >
                <Stack gap={2} maxW="3xl">
                  <HStack gap={2} flexWrap="wrap">
                    <Heading size="sm">{entry.title}</Heading>
                    <Badge
                      bg={
                        entry.role === 'worker'
                          ? 'primary.50'
                          : 'surfaceContainerHigh'
                      }
                      color={entry.role === 'worker' ? 'primary.700' : 'fg'}
                    >
                      {entry.role === 'worker'
                        ? 'Worker record'
                        : 'Customer record'}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="muted">
                    {entry.location} · {formatDate(entry.completedAt)}
                  </Text>
                  <Text fontSize="sm">{entry.summary}</Text>
                </Stack>
                <Text fontWeight={800}>{formatPounds(entry.valuePence)}</Text>
              </HStack>
            </GlassCard>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
