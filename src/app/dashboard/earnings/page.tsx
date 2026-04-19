'use client'

import { Box, Grid, HStack, Heading, Stack, Text } from '@chakra-ui/react'

import { WorkerAccessGate } from '@/app/dashboard/components/WorkerAccessGate'
import { useDashboardData } from '@/app/dashboard/context'
import {
  formatDate,
  formatPounds,
  quotePricePence,
} from '@/utils/dashboardHelpers'
import { Badge } from '@ui'

function EarningsCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <Box p={5}>
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
        <Heading size="lg">{value}</Heading>
        <Text fontSize="sm" color="formLabelMuted">
          {helper}
        </Text>
      </Stack>
    </Box>
  )
}

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
        description="Create a worker profile to access quote totals, payout forecasting, and your worker-side performance summary."
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

  const payoutRows =
    awardedQuotes.length > 0
      ? awardedQuotes.slice(0, 4).map(({ task, quote }, index) => ({
          id: quote.id,
          title: task.title,
          amountPence: quotePricePence(quote),
          status: index === 0 ? 'Processing' : 'Scheduled',
          payoutAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * (index + 2)),
        }))
      : [
          {
            id: 'forecast-1',
            title: 'First completed worker payout',
            amountPence: averageQuotePence,
            status: 'Forecast',
            payoutAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          },
        ]

  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <Heading size="xl">Earnings</Heading>
        <Text color="formLabelMuted" maxW="3xl">
          This worker workspace mixes live awarded quote data with demo payout
          forecasting so the frontend can showcase earnings flow even while the
          backend payout APIs are still limited.
        </Text>
      </Stack>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <EarningsCard
          label="Tracked earnings"
          value={formatPounds(totalEarningsPence)}
          helper="Awarded quote value pulled from the current tasks schema."
        />
        <EarningsCard
          label="Average quote"
          value={formatPounds(averageQuotePence)}
          helper="Based on live sent quotes or your configured worker rate."
        />
        <EarningsCard
          label="Pipeline forecast"
          value={formatPounds(projectedPipelinePence)}
          helper="Open worker opportunity value still active in your queue."
        />
      </Grid>

      <Grid templateColumns={{ base: '1fr', xl: '1.2fr 0.8fr' }} gap={6}>
        <Box p={6}>
          <Stack gap={4}>
            <Heading size="md">Payout queue</Heading>
            <Stack gap={3}>
              {payoutRows.map((row) => (
                <Box
                  key={row.id}
                  p={4}
                  bg="cardBg"
                  borderWidth="1px"
                  borderColor="cardBorder"
                >
                  <HStack
                    justify="space-between"
                    align="flex-start"
                    gap={4}
                    flexWrap="wrap"
                  >
                    <Stack gap={1}>
                      <Heading size="sm">{row.title}</Heading>
                      <Text fontSize="sm" color="formLabelMuted">
                        Expected {formatDate(row.payoutAt.toISOString())}
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
                            ? 'cardBg'
                            : row.status === 'Scheduled'
                              ? 'primary.50'
                              : 'badgeBg'
                        }
                        color={
                          row.status === 'Processing'
                            ? 'cardFg'
                            : row.status === 'Scheduled'
                              ? 'primary.700'
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
        </Box>

        <Box
          p={6}
          bg="linear-gradient(160deg, #03225a 0%, #012b73 55%, #00358f 100%)"
          color="white"
        >
          <Stack gap={4}>
            <Heading size="md" color="white">
              Worker profile summary
            </Heading>
            <HStack justify="space-between">
              <Text color="whiteAlpha.800">Business</Text>
              <Text fontWeight={700}>
                {workerProfile.businessName || 'Independent pro'}
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
        </Box>
      </Grid>
    </Stack>
  )
}
