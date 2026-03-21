'use client'

import { Box, Grid, HStack, Link, SimpleGrid, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { useDashboardData } from '@/features/dashboard/DashboardDataContext'
import { formatDate, formatPounds } from '@/features/dashboard/dashboardHelpers'
import { Badge, Button, GlassCard, Heading, Text } from '@ui'

function MetricCard({
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

export default function DashboardOverviewPage() {
  const {
    tasksLoading,
    tasksErrorMessage,
    displayName,
    workerEnabled,
    profile,
    workerProfile,
    activePostedTasks,
    customerBookings,
    myOffers,
    offerCountOnMyTasks,
    serviceHistory,
    messages,
    totalSpendPence,
    totalEarningsPence,
  } = useDashboardData()

  const unreadCount = messages.filter((message) => message.unread).length
  const recentMessages = messages.slice(0, 3)
  const recentHistory = serviceHistory.slice(0, 3)

  return (
    <Stack gap={8}>
      <Grid templateColumns={{ base: '1fr', xl: '1.5fr 1fr' }} gap={6}>
        <GlassCard
          p={{ base: 6, md: 7 }}
          bg="linear-gradient(160deg, #f7f9ff 0%, #ffffff 100%)"
        >
          <Stack gap={5}>
            <Badge alignSelf="flex-start">Dashboard overview</Badge>
            <Stack gap={2}>
              <Heading size="xl">Welcome back, {displayName}.</Heading>
              <Text color="muted" maxW="3xl">
                Track the jobs you have posted, monitor booking progress, and
                unlock the worker flow when you are ready to send quotes.
              </Text>
            </Stack>
            <HStack gap={3} flexWrap="wrap">
              <Button as={NextLink} href="/dashboard/jobs">
                Review my jobs
              </Button>
              <Button as={NextLink} href="/tasks/create" variant="subtle">
                Post a new job
              </Button>
              <Button
                as={NextLink}
                href={
                  workerEnabled
                    ? '/dashboard/quotes'
                    : '/dashboard/worker/register'
                }
                variant="outline"
              >
                {workerEnabled ? 'Open worker tools' : 'Become a worker'}
              </Button>
            </HStack>
            <HStack gap={3} flexWrap="wrap">
              <Badge bg="surfaceContainerHigh" color="fg">
                {profile.location || 'Location not set'}
              </Badge>
              <Badge bg="primary.50" color="primary.700">
                {workerEnabled ? 'Worker unlocked' : 'Customer mode'}
              </Badge>
            </HStack>
          </Stack>
        </GlassCard>

        <SimpleGrid columns={{ base: 1, sm: 2, xl: 1 }} gap={4}>
          <MetricCard
            label="Active jobs"
            value={String(activePostedTasks.length)}
            helper="Posted jobs currently visible to professionals."
          />
          <MetricCard
            label="Quotes received"
            value={String(offerCountOnMyTasks)}
            helper="Offers collected against your current job briefs."
          />
          <MetricCard
            label="History value"
            value={formatPounds(totalSpendPence)}
            helper="Completed spend recorded in your customer history."
          />
          <MetricCard
            label="Worker earnings"
            value={workerEnabled ? formatPounds(totalEarningsPence) : 'Locked'}
            helper={
              workerEnabled
                ? 'Awarded worker quotes tracked in your earnings workspace.'
                : 'Activate your worker profile to start tracking payouts.'
            }
          />
        </SimpleGrid>
      </Grid>

      {tasksLoading ? <Text color="muted">Loading task activity…</Text> : null}
      {tasksErrorMessage ? (
        <Text color="red.400" fontSize="sm">
          {tasksErrorMessage}
        </Text>
      ) : null}

      <Grid templateColumns={{ base: '1fr', xl: '1.2fr 0.8fr' }} gap={6}>
        <GlassCard p={6}>
          <Stack gap={4}>
            <HStack
              justify="space-between"
              align="flex-start"
              gap={3}
              flexWrap="wrap"
            >
              <Stack gap={1}>
                <Heading size="md">Bookings & live job activity</Heading>
                <Text color="muted" fontSize="sm">
                  Your open tasks and the jobs with active quote activity.
                </Text>
              </Stack>
              <Link
                as={NextLink}
                href="/dashboard/jobs"
                fontWeight={700}
                color="primary.600"
                _hover={{ color: 'primary.700' }}
              >
                View all jobs
              </Link>
            </HStack>
            {activePostedTasks.length === 0 ? (
              <Text color="muted" fontSize="sm">
                No active jobs yet. Post a job to start collecting quotes from
                trusted tradespeople.
              </Text>
            ) : (
              <Stack gap={3}>
                {activePostedTasks.slice(0, 3).map((task) => (
                  <GlassCard
                    key={task.id}
                    p={4}
                    bg="surfaceContainerLow"
                    borderWidth="1px"
                    borderColor="border"
                  >
                    <Stack gap={2}>
                      <HStack justify="space-between" gap={3} flexWrap="wrap">
                        <Heading size="sm">{task.title}</Heading>
                        <Badge
                          bg={
                            task.offers.length > 0
                              ? 'secondaryFixed'
                              : 'surfaceContainerHigh'
                          }
                          color={
                            task.offers.length > 0 ? 'onSecondaryFixed' : 'fg'
                          }
                        >
                          {task.offers.length > 0
                            ? `${task.offers.length} quotes`
                            : 'Awaiting quotes'}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="muted">
                        {task.location ?? 'Location TBC'}
                      </Text>
                      <HStack gap={3} flexWrap="wrap">
                        <Link
                          as={NextLink}
                          href={`/task/${task.id}`}
                          color="primary.600"
                          fontWeight={700}
                          _hover={{ color: 'primary.700' }}
                        >
                          Open job
                        </Link>
                        <Text fontSize="sm" color="muted">
                          {task.offers.length > 0
                            ? 'Booking activity is visible on the job detail page.'
                            : 'Share the job brief to attract more professionals.'}
                        </Text>
                      </HStack>
                    </Stack>
                  </GlassCard>
                ))}
              </Stack>
            )}
            {customerBookings.length > 0 ? (
              <Text fontSize="sm" color="muted">
                {customerBookings.length} of your jobs already have active
                quote/booking movement.
              </Text>
            ) : null}
          </Stack>
        </GlassCard>

        <GlassCard
          p={6}
          bg={workerEnabled ? 'surfaceContainerLow' : 'primary.50'}
          borderWidth="1px"
          borderColor={workerEnabled ? 'border' : 'primary.100'}
        >
          <Stack gap={4}>
            <Heading size="md">
              {workerEnabled ? 'Worker profile live' : 'Unlock worker mode'}
            </Heading>
            <Text color="muted" fontSize="sm">
              {workerEnabled
                ? 'Your worker workspace is active. Use it to send quotes, manage incoming work, and monitor earnings.'
                : 'Worker features are blocked by default. Create your worker profile to unlock quoting and earnings.'}
            </Text>
            <Stack gap={2}>
              <HStack justify="space-between">
                <Text color="muted" fontSize="sm">
                  Skills
                </Text>
                <Text fontWeight={700} fontSize="sm">
                  {workerEnabled
                    ? workerProfile.skills.join(', ') || 'Add skills'
                    : `${profile.preferredTrades.length} saved`}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="muted" fontSize="sm">
                  Quotes sent
                </Text>
                <Text fontWeight={700} fontSize="sm">
                  {String(myOffers.length)}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="muted" fontSize="sm">
                  Status
                </Text>
                <Text fontWeight={700} fontSize="sm">
                  {workerEnabled ? 'Active' : 'Locked'}
                </Text>
              </HStack>
            </Stack>
            <Button
              as={NextLink}
              href={
                workerEnabled
                  ? '/dashboard/quotes'
                  : '/dashboard/worker/register'
              }
            >
              {workerEnabled ? 'Go to worker tools' : 'Become a worker'}
            </Button>
          </Stack>
        </GlassCard>
      </Grid>

      <Grid templateColumns={{ base: '1fr', xl: '1fr 1fr' }} gap={6}>
        <GlassCard p={6}>
          <Stack gap={4}>
            <HStack justify="space-between" gap={3} flexWrap="wrap">
              <Stack gap={1}>
                <Heading size="md">Recent messages</Heading>
                <Text color="muted" fontSize="sm">
                  Job updates, worker onboarding notes, and scheduling nudges.
                </Text>
              </Stack>
              <Badge bg="surfaceContainerHigh" color="fg">
                {unreadCount} unread
              </Badge>
            </HStack>
            <Stack gap={3}>
              {recentMessages.map((message) => (
                <GlassCard
                  key={message.id}
                  p={4}
                  bg="surfaceContainerLow"
                  borderWidth="1px"
                  borderColor="border"
                >
                  <Stack gap={1}>
                    <HStack justify="space-between" gap={3} flexWrap="wrap">
                      <Heading size="sm">{message.counterpart}</Heading>
                      {message.unread ? (
                        <Badge bg="primary.50" color="primary.700">
                          New
                        </Badge>
                      ) : null}
                    </HStack>
                    <Text fontSize="sm" color="muted">
                      {message.taskTitle}
                    </Text>
                    <Text fontSize="sm">{message.preview}</Text>
                  </Stack>
                </GlassCard>
              ))}
            </Stack>
            <Link
              as={NextLink}
              href="/dashboard/messages"
              color="primary.600"
              fontWeight={700}
              _hover={{ color: 'primary.700' }}
            >
              Open message centre
            </Link>
          </Stack>
        </GlassCard>

        <GlassCard p={6}>
          <Stack gap={4}>
            <HStack justify="space-between" gap={3} flexWrap="wrap">
              <Stack gap={1}>
                <Heading size="md">Service history</Heading>
                <Text color="muted" fontSize="sm">
                  Completed jobs, archived bookings, and record-keeping.
                </Text>
              </Stack>
              <Link
                as={NextLink}
                href="/dashboard/history"
                fontWeight={700}
                color="primary.600"
                _hover={{ color: 'primary.700' }}
              >
                View full history
              </Link>
            </HStack>
            <Stack gap={3}>
              {recentHistory.map((entry) => (
                <GlassCard
                  key={entry.id}
                  p={4}
                  bg="surfaceContainerLow"
                  borderWidth="1px"
                  borderColor="border"
                >
                  <Stack gap={1}>
                    <HStack justify="space-between" gap={3} flexWrap="wrap">
                      <Heading size="sm">{entry.title}</Heading>
                      <Text fontWeight={800}>
                        {formatPounds(entry.valuePence)}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="muted">
                      {entry.location} · {formatDate(entry.completedAt)}
                    </Text>
                    <Text fontSize="sm">{entry.summary}</Text>
                  </Stack>
                </GlassCard>
              ))}
            </Stack>
          </Stack>
        </GlassCard>
      </Grid>
    </Stack>
  )
}
