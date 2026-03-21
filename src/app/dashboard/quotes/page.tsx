'use client'

import { Grid, HStack, Link, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { WorkerAccessGate } from '@/app/dashboard/_components/WorkerAccessGate'
import { useDashboardData } from '@/features/dashboard/DashboardDataContext'
import {
  formatPounds,
  formatRelativePosted,
  getCategoryVisual,
  isOfferAwarded,
} from '@/features/dashboard/dashboardHelpers'
import { Badge, Button, GlassCard, Heading, Text } from '@ui'

function QuoteMetric({
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

export default function DashboardQuotesPage() {
  const {
    workerEnabled,
    tasksLoading,
    tasksBootstrapping,
    filteredOffers,
    awardedQuotes,
    quotesInProgress,
  } = useDashboardData()

  const isLoadingQuotes = tasksLoading || tasksBootstrapping

  if (!workerEnabled) {
    return (
      <WorkerAccessGate
        title="Quotes are locked until you create a worker profile"
        description="Worker features are blocked by default. Register as a worker to unlock quoting, build your service profile, and manage quote activity directly from the dashboard."
      />
    )
  }

  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <HStack justify="space-between" gap={4} flexWrap="wrap">
          <Stack gap={1} maxW="3xl">
            <Heading size="xl">Worker Quotes</Heading>
            <Text color="muted">
              Review sent quotes, track awarded work, and jump back into the
              relevant task details whenever you need context.
            </Text>
          </Stack>
          <Button as={NextLink} href="/tasks">
            Browse jobs
          </Button>
        </HStack>
      </Stack>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <QuoteMetric
          label="Sent quotes"
          value={String(filteredOffers.length)}
          helper="All quotes that match the current dashboard search."
        />
        <QuoteMetric
          label="Awarded"
          value={String(awardedQuotes.length)}
          helper="Quotes that look accepted/awarded from the current task data."
        />
        <QuoteMetric
          label="In progress"
          value={String(quotesInProgress.length)}
          helper="Open tasks where your quote is still active."
        />
      </Grid>

      {isLoadingQuotes ? (
        <Text color="muted">Loading quote activity…</Text>
      ) : null}

      {!isLoadingQuotes && filteredOffers.length === 0 ? (
        <GlassCard p={6}>
          <Stack gap={4}>
            <Heading size="md">No quotes sent yet</Heading>
            <Text color="muted">
              Your worker profile is ready. Browse available jobs and send your
              first quote to populate this workspace.
            </Text>
            <Button as={NextLink} href="/tasks" alignSelf="flex-start">
              Browse open jobs
            </Button>
          </Stack>
        </GlassCard>
      ) : !isLoadingQuotes ? (
        <Stack gap={4}>
          {filteredOffers.map(({ task, offer }) => {
            const visual = getCategoryVisual(task.category)
            const awarded = isOfferAwarded(offer.status)

            return (
              <GlassCard key={offer.id} p={5}>
                <HStack align="flex-start" gap={4} flexWrap="wrap">
                  <Stack
                    w={14}
                    h={14}
                    borderRadius="lg"
                    bg={visual.bg}
                    align="center"
                    justify="center"
                    fontSize="xl"
                    flexShrink={0}
                  >
                    {visual.glyph}
                  </Stack>
                  <Stack gap={2} flex="1" minW="240px">
                    <HStack justify="space-between" gap={3} flexWrap="wrap">
                      <Heading size="sm">{task.title}</Heading>
                      <Badge
                        bg={awarded ? 'secondaryFixed' : 'surfaceContainerHigh'}
                        color={awarded ? 'onSecondaryFixed' : 'fg'}
                      >
                        {awarded ? 'Awarded' : 'Pending'}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="muted">
                      {task.location ?? 'Location TBC'} ·{' '}
                      {formatRelativePosted(offer.createdAt)}
                    </Text>
                    <Text fontSize="sm">
                      Quote value:{' '}
                      <strong>{formatPounds(offer.pricePence)}</strong>
                    </Text>
                    <Text fontSize="sm" color="muted">
                      {offer.message?.trim() ||
                        'No message included with this quote.'}
                    </Text>
                  </Stack>
                  <Stack gap={3} align={{ base: 'flex-start', md: 'flex-end' }}>
                    <Button as={NextLink} href={`/task/${task.id}`} size="sm">
                      View task
                    </Button>
                    <Link
                      as={NextLink}
                      href="/dashboard/messages"
                      fontSize="sm"
                      fontWeight={700}
                      color="primary.600"
                      _hover={{ color: 'primary.700' }}
                    >
                      Open messages
                    </Link>
                  </Stack>
                </HStack>
              </GlassCard>
            )
          })}
        </Stack>
      ) : null}
    </Stack>
  )
}
