'use client'

import { Box, Grid, HStack, Heading, Stack, Text } from '@chakra-ui/react'

import { DashboardMetricCard } from '@/app/dashboard/components/DashboardMetricCard'
import { DashboardPageHeader } from '@/app/dashboard/components/DashboardPageHeader'
import { WorkerAccessGate } from '@/app/dashboard/components/WorkerAccessGate'
import { useDashboardData } from '@/app/dashboard/context'
import {
  formatDate,
  formatPounds,
  quotePricePence,
} from '@/utils/dashboardHelpers'
import { Badge, SectionCard } from '@ui'

export default function DashboardEarningsPage() {
  const {
    workerEnabled,
    workerProfile,
    filteredMyQuotes,
    awardedQuotes,
    totalEarningsPence,
  } = useDashboardData()

  if (!workerEnabled) {
    return (
      <WorkerAccessGate
        title="Earnings tracking unlocks with your worker profile"
        description="Create a worker profile to access quote totals, earnings forecasting, and your worker-side performance summary."
      />
    )
  }

  const averageQuotePence =
    filteredMyQuotes.length > 0
      ? Math.round(
          filteredMyQuotes.reduce(
            (sum, { quote }) => sum + quotePricePence(quote),
            0,
          ) / filteredMyQuotes.length,
        )
      : workerProfile.hourlyRatePence * 4

  const projectedPipelinePence =
    filteredMyQuotes
      .filter(({ quote }) => !/reject|declin|cancel/i.test(quote.status))
      .reduce((sum, { quote }) => sum + quotePricePence(quote), 0) ||
    averageQuotePence

  const earningsRows =
    awardedQuotes.length > 0
      ? awardedQuotes.slice(0, 4).map(({ task, quote }, index) => ({
          id: quote.id,
          title: task.title,
          amountPence: quotePricePence(quote),
          status: index === 0 ? 'Awarded' : 'Tracked',
          targetAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * (index + 2)),
        }))
      : [
          {
            id: 'forecast-1',
            title: 'First completed worker task',
            amountPence: averageQuotePence,
            status: 'Estimate',
            targetAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          },
        ]

  return (
    <Stack gap={8}>
      <DashboardPageHeader
        title="Earnings"
        description="Track awarded quote value and forecast worker earnings while dedicated earnings APIs are still limited."
      />

      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <DashboardMetricCard
          label="Tracked earnings"
          value={formatPounds(totalEarningsPence)}
          helper="Awarded quote value pulled from the current tasks schema."
        />
        <DashboardMetricCard
          label="Average quote"
          value={formatPounds(averageQuotePence)}
          helper="Based on live sent quotes or your configured worker rate."
        />
        <DashboardMetricCard
          label="Pipeline forecast"
          value={formatPounds(projectedPipelinePence)}
          helper="Open worker opportunity value still active in your queue."
        />
      </Grid>

      <Grid templateColumns={{ base: '1fr', xl: '1.2fr 0.8fr' }} gap={6}>
        <SectionCard p={6}>
          <Stack gap={4}>
            <Heading size="md" color="secondary.900">
              Earnings estimate
            </Heading>
            <Stack gap={3}>
              {earningsRows.map((row) => (
                <Box key={row.id} p={4} bg="cardBg" borderRadius="xl">
                  <HStack
                    justify="space-between"
                    align="flex-start"
                    gap={4}
                    flexWrap="wrap"
                  >
                    <Stack gap={1}>
                      <Heading size="sm" color="secondary.900">
                        {row.title}
                      </Heading>
                      <Text fontSize="sm" color="formLabelMuted">
                        Target date {formatDate(row.targetAt.toISOString())}
                      </Text>
                    </Stack>
                    <Stack
                      gap={2}
                      align={{ base: 'flex-start', md: 'flex-end' }}
                    >
                      <Text fontWeight={800}>
                        {formatPounds(row.amountPence)}
                      </Text>
                      <Badge
                        bg={
                          row.status === 'Processing'
                            ? 'green.100'
                            : row.status === 'Tracked'
                              ? 'cardBg'
                              : 'badgeBg'
                        }
                        color={
                          row.status === 'Processing'
                            ? 'secondary.600'
                            : row.status === 'Tracked'
                              ? 'cardFg'
                              : 'cardFg'
                        }
                      >
                        {row.status}
                      </Badge>
                    </Stack>
                  </HStack>
                </Box>
              ))}
            </Stack>
          </Stack>
        </SectionCard>

        <SectionCard
          p={6}
          bg="linear-gradient(160deg, #0B1714 0%, #123D31 100%)"
          color="white"
        >
          <Stack gap={4}>
            <Heading size="md" color="white">
              Worker profile summary
            </Heading>
            <HStack justify="space-between">
              <Text color="whiteAlpha.800">Business</Text>
              <Text fontWeight={700}>
                {workerProfile.businessName || 'Independent worker'}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="whiteAlpha.800">Service area</Text>
              <Text fontWeight={700}>{workerProfile.serviceArea}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="whiteAlpha.800">Rate target</Text>
              <Text fontWeight={700}>
                {formatPounds(workerProfile.hourlyRatePence)}/hr
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="whiteAlpha.800">Skills</Text>
              <Text fontWeight={700}>
                {workerProfile.skills.join(', ') || 'No skills selected'}
              </Text>
            </HStack>
          </Stack>
        </SectionCard>
      </Grid>
    </Stack>
  )
}
