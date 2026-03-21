'use client'

import { Grid, HStack, Stack } from '@chakra-ui/react'

import { WorkerAccessGate } from '@/app/dashboard/_components/WorkerAccessGate'
import { useDashboardData } from '@/features/dashboard/DashboardDataContext'
import { formatDate, formatPounds } from '@/features/dashboard/dashboardHelpers'
import { Badge, GlassCard, Heading, Text } from '@ui'

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
    <GlassCard p={5}>
      <Stack gap={2}>
        <Text
          fontSize="10px"
          fontWeight={800}
          letterSpacing="0.08em"
          color="muted"
          textTransform="uppercase"
        >
          {label}
        </Text>
        <Heading size="lg">{value}</Heading>
        <Text fontSize="sm" color="muted">
          {helper}
        </Text>
      </Stack>
    </GlassCard>
  )
}

export default function DashboardEarningsPage() {
  const {
    workerEnabled,
    workerProfile,
    filteredOffers,
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
    filteredOffers.length > 0
      ? Math.round(
          filteredOffers.reduce((sum, { offer }) => sum + offer.pricePence, 0) /
            filteredOffers.length,
        )
      : workerProfile.hourlyRatePence * 4

  const projectedPipelinePence =
    filteredOffers
      .filter(({ offer }) => !/reject|declin|cancel/i.test(offer.status))
      .reduce((sum, { offer }) => sum + offer.pricePence, 0) ||
    averageQuotePence

  const payoutRows =
    awardedQuotes.length > 0
      ? awardedQuotes.slice(0, 4).map(({ task, offer }, index) => ({
          id: offer.id,
          title: task.title,
          amountPence: offer.pricePence,
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
        <Text color="muted" maxW="3xl">
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
        <GlassCard p={6}>
          <Stack gap={4}>
            <Heading size="md">Payout queue</Heading>
            <Stack gap={3}>
              {payoutRows.map((row) => (
                <GlassCard
                  key={row.id}
                  p={4}
                  bg="surfaceContainerLow"
                  borderWidth="1px"
                  borderColor="border"
                >
                  <HStack
                    justify="space-between"
                    align="flex-start"
                    gap={4}
                    flexWrap="wrap"
                  >
                    <Stack gap={1}>
                      <Heading size="sm">{row.title}</Heading>
                      <Text fontSize="sm" color="muted">
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
                            ? 'secondaryFixed'
                            : row.status === 'Scheduled'
                              ? 'primary.50'
                              : 'surfaceContainerHigh'
                        }
                        color={
                          row.status === 'Processing'
                            ? 'onSecondaryFixed'
                            : row.status === 'Scheduled'
                              ? 'primary.700'
                              : 'fg'
                        }
                      >
                        {row.status}
                      </Badge>
                    </Stack>
                  </HStack>
                </GlassCard>
              ))}
            </Stack>
          </Stack>
        </GlassCard>

        <GlassCard
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
        </GlassCard>
      </Grid>
    </Stack>
  )
}
