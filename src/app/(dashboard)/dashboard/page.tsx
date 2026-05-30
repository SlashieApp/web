'use client'

import {
  Box,
  Grid,
  HStack,
  Heading,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { type ReactNode, useMemo } from 'react'

import { Button, SectionCard } from '@ui'

import { useUserStore } from '@/app/(auth)/store/user'
import {
  formatPounds,
  isQuoteAwarded,
  isTaskCompleted,
  taskBudgetPence,
  timeFromUnknown,
} from '@/utils/dashboardHelpers'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

import { useAccountTasks } from '../helpers/useAccountTasks'

type StatTileProps = {
  label: string
  value: string
  helper: string
  icon: ReactNode
}

type ActivityTone = 'green' | 'purple' | 'blue' | 'mint'

type ActivityRow = {
  id: string
  title: string
  subtitle: string
  happenedAt: unknown
  tone: ActivityTone
}

type MapPin = {
  id: string
  label: string
  left: number
  top: number
}

function StatTile({ label, value, helper, icon }: StatTileProps) {
  return (
    <SectionCard p={5}>
      <Stack gap={2}>
        <HStack justify="space-between" align="flex-start">
          <Text fontSize="xs" fontWeight={700} color="formLabelMuted">
            {label}
          </Text>
          <Box
            w={9}
            h={9}
            borderRadius="full"
            bg="primary.100"
            color="primary.700"
            display="grid"
            placeItems="center"
          >
            {icon}
          </Box>
        </HStack>
        <Heading size={{ base: 'md', md: 'lg' }} color="cardFg">
          {value}
        </Heading>
        <Text fontSize="xs" color="formLabelMuted">
          {helper}
        </Text>
      </Stack>
    </SectionCard>
  )
}

function TileIcon({
  type,
}: { type: 'posted' | 'quotes' | 'accepted' | 'done' }) {
  if (type === 'posted') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <title>Posted tasks</title>
        <path
          d="M7 4h10l3 3v13H4V4h3Zm10 0v3h3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (type === 'quotes') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <title>Quotes sent</title>
        <path
          d="m5 12 5 5L20 7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (type === 'accepted') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <title>Accepted jobs</title>
        <path
          d="M4 8h16v11H4V8Zm4-3h8v3H8V5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Completed jobs</title>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m8 12 2.7 2.7L16 9.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ActivityIcon({ tone }: { tone: ActivityTone }) {
  const bgByTone = {
    green: 'green.100',
    purple: 'purple.100',
    blue: 'blue.100',
    mint: 'primary.100',
  } as const
  const fgByTone = {
    green: 'green.700',
    purple: 'purple.700',
    blue: 'blue.700',
    mint: 'primary.700',
  } as const
  return (
    <Box
      w={8}
      h={8}
      borderRadius="full"
      bg={bgByTone[tone]}
      color={fgByTone[tone]}
      display="grid"
      placeItems="center"
      fontSize="sm"
      fontWeight={700}
      flexShrink={0}
    >
      ·
    </Box>
  )
}

function ClockLabel({ happenedAt }: { happenedAt: unknown }) {
  const timestamp = timeFromUnknown(happenedAt)
  if (!timestamp)
    return (
      <Text fontSize="xs" color="formLabelMuted">
        Recently
      </Text>
    )
  const diffMs = Date.now() - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diffMs < hour) {
    return (
      <Text fontSize="xs" color="formLabelMuted">
        {Math.max(1, Math.floor(diffMs / minute))}m ago
      </Text>
    )
  }
  if (diffMs < day) {
    return (
      <Text fontSize="xs" color="formLabelMuted">
        {Math.floor(diffMs / hour)}h ago
      </Text>
    )
  }
  if (diffMs < day * 7) {
    return (
      <Text fontSize="xs" color="formLabelMuted">
        {Math.floor(diffMs / day)}d ago
      </Text>
    )
  }
  return (
    <Text fontSize="xs" color="formLabelMuted">
      Earlier
    </Text>
  )
}

function QuickActionIcon({
  kind,
}: {
  kind: 'post' | 'browse' | 'requests' | 'jobs' | 'profile'
}) {
  if (kind === 'browse') return <Text fontWeight={700}>⌕</Text>
  if (kind === 'requests') return <Text fontWeight={700}>⌂</Text>
  if (kind === 'jobs') return <Text fontWeight={700}>☑</Text>
  if (kind === 'profile') return <Text fontWeight={700}>◯</Text>
  return <Text fontWeight={700}>＋</Text>
}

export default function DashboardOverviewPage() {
  const me = useUserStore((s) => s.me)
  const {
    loading,
    errorMessage,
    tasks,
    postedTasks,
    activePostedTasks,
    sentQuotes,
    completedPostedTasks,
    awardedSentQuotes,
    customerJobs,
    workerJobs,
  } = useAccountTasks()

  const displayName =
    me?.profile?.name?.trim() || me?.email?.split('@')[0] || 'there'

  const greeting =
    new Date().getHours() < 12
      ? 'Good morning'
      : new Date().getHours() < 18
        ? 'Good afternoon'
        : 'Good evening'

  const completedAsWorker = useMemo(
    () =>
      sentQuotes.filter(
        ({ task, quote }) =>
          isTaskCompleted(task.status) && isQuoteAwarded(quote.status),
      ),
    [sentQuotes],
  )

  const acceptedJobsCount = customerJobs.length + workerJobs.length
  const completedJobsCount =
    completedPostedTasks.length + completedAsWorker.length
  const totalEarningsPence = awardedSentQuotes.reduce(
    (sum, { quote }) => sum + (quote.price?.amount ?? 0) * 100,
    0,
  )
  const postedAwaitingQuotes = activePostedTasks.filter(
    (task) => (task.quotes?.length ?? 0) === 0,
  ).length
  const quotesAwaitingResponse = sentQuotes.filter(
    ({ quote }) => !isQuoteAwarded(quote.status),
  ).length

  const recentActivity = useMemo<ActivityRow[]>(() => {
    const activity: ActivityRow[] = []
    for (const task of postedTasks) {
      activity.push({
        id: `posted-${task.id}`,
        title: 'Task posted',
        subtitle: task.title,
        happenedAt: task.createdAt,
        tone: 'mint',
      })
      if (isTaskCompleted(task.status)) {
        activity.push({
          id: `completed-${task.id}`,
          title: 'Job completed',
          subtitle: task.title,
          happenedAt: task.completedAt ?? task.confirmedAt ?? task.createdAt,
          tone: 'green',
        })
      }
    }

    for (const { task, quote } of sentQuotes) {
      activity.push({
        id: `quote-sent-${quote.id}`,
        title: 'You sent a quote',
        subtitle: task.title,
        happenedAt: quote.createdAt,
        tone: 'purple',
      })
      if (isQuoteAwarded(quote.status)) {
        activity.push({
          id: `quote-awarded-${quote.id}`,
          title: 'Quote accepted',
          subtitle: task.title,
          happenedAt: quote.createdAt,
          tone: 'blue',
        })
      }
    }

    return activity
      .sort(
        (a, b) => timeFromUnknown(b.happenedAt) - timeFromUnknown(a.happenedAt),
      )
      .slice(0, 6)
  }, [postedTasks, sentQuotes])

  const mapPins = useMemo<MapPin[]>(() => {
    const nearby = tasks
      .filter(
        (task) =>
          typeof task.location?.lat === 'number' &&
          typeof task.location?.lng === 'number',
      )
      .slice(0, 6)

    if (nearby.length === 0) return []

    const lats = nearby.map((task) => task.location?.lat as number)
    const lngs = nearby.map((task) => task.location?.lng as number)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    const latSpan = Math.max(0.0001, maxLat - minLat)
    const lngSpan = Math.max(0.0001, maxLng - minLng)

    return nearby.map((task) => {
      const lat = task.location?.lat as number
      const lng = task.location?.lng as number
      return {
        id: task.id,
        label: formatPounds(taskBudgetPence(task)),
        left: 14 + ((lng - minLng) / lngSpan) * 72,
        top: 16 + (1 - (lat - minLat) / latSpan) * 66,
      }
    })
  }, [tasks])

  const quickActions = [
    {
      key: 'post',
      title: 'Post a task',
      subtitle: 'Get quotes from local workers',
      href: '/tasks/create',
      kind: 'post' as const,
    },
    {
      key: 'browse',
      title: 'Browse tasks',
      subtitle: 'Find work and send quotes',
      href: '/',
      kind: 'browse' as const,
    },
    {
      key: 'requests',
      title: 'My requests',
      subtitle: 'Track posted tasks and quotes',
      href: '/requests',
      kind: 'requests' as const,
    },
    {
      key: 'jobs',
      title: 'View jobs',
      subtitle: 'Monitor accepted and active work',
      href: '/jobs',
      kind: 'jobs' as const,
    },
    {
      key: 'profile',
      title: 'Complete profile',
      subtitle: me?.worker?.id
        ? 'Keep your worker profile fresh'
        : 'Set up your worker profile',
      href: '/profile',
      kind: 'profile' as const,
    },
  ]

  const nearbyLabel =
    (tasks[0] ? taskPublicLocationLabel(tasks[0]).trim() : '') ||
    'Your local area'

  return (
    <Stack gap={{ base: 5, md: 6 }}>
      <HStack
        justify="space-between"
        align="flex-start"
        gap={4}
        flexWrap="wrap"
      >
        <Stack gap={1}>
          <Heading size="xl" color="cardFg">
            {greeting}, {displayName}! <span aria-hidden>👋</span>
          </Heading>
          <Text color="formLabelMuted" maxW="3xl">
            Manage your tasks, quotes and jobs in one place.
          </Text>
        </Stack>
        <HStack gap={2} flexWrap="wrap">
          <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
            <Button size="sm" variant="secondary">
              Browse tasks
            </Button>
          </Link>
          <Link
            as={NextLink}
            href="/tasks/create"
            _hover={{ textDecoration: 'none' }}
          >
            <Button size="sm">Post task</Button>
          </Link>
        </HStack>
      </HStack>

      {errorMessage ? (
        <Text color="red.500" fontSize="sm">
          {errorMessage}
        </Text>
      ) : null}

      <SimpleGrid columns={{ base: 2, xl: 4 }} gap={3}>
        <StatTile
          label="Posted tasks"
          value={loading ? '…' : String(postedTasks.length)}
          helper={`${activePostedTasks.length} open · ${postedAwaitingQuotes} awaiting quotes`}
          icon={<TileIcon type="posted" />}
        />
        <StatTile
          label="Quotes sent"
          value={loading ? '…' : String(sentQuotes.length)}
          helper={`${quotesAwaitingResponse} awaiting response`}
          icon={<TileIcon type="quotes" />}
        />
        <StatTile
          label="Accepted jobs"
          value={loading ? '…' : String(acceptedJobsCount)}
          helper="In progress across customer + worker roles"
          icon={<TileIcon type="accepted" />}
        />
        <StatTile
          label="Completed jobs"
          value={loading ? '…' : String(completedJobsCount)}
          helper={`Tracked earnings: ${formatPounds(totalEarningsPence)}`}
          icon={<TileIcon type="done" />}
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', xl: '1.3fr 1fr' }} gap={4}>
        <SectionCard p={{ base: 5, md: 6 }}>
          <Stack gap={4}>
            <HStack justify="space-between" gap={3}>
              <Stack gap={1}>
                <Heading size="md" color="cardFg">
                  Recent activity
                </Heading>
                <Text fontSize="sm" color="formLabelMuted">
                  Latest updates across your requests, jobs, and quotes.
                </Text>
              </Stack>
              <Link
                as={NextLink}
                href="/requests"
                fontSize="sm"
                fontWeight={600}
                color="primary.700"
                _hover={{ textDecoration: 'none', color: 'primary.600' }}
              >
                View all
              </Link>
            </HStack>

            {loading && recentActivity.length === 0 ? (
              <Text color="formLabelMuted" fontSize="sm">
                Loading activity…
              </Text>
            ) : recentActivity.length === 0 ? (
              <Text color="formLabelMuted" fontSize="sm">
                No activity yet. Start by posting a task or sending a quote.
              </Text>
            ) : (
              <Stack gap={1}>
                {recentActivity.map((item) => (
                  <HStack
                    key={item.id}
                    justify="space-between"
                    align="flex-start"
                    py={2.5}
                    borderBottomWidth="1px"
                    borderColor="cardBorder"
                  >
                    <HStack align="flex-start" gap={3} minW={0}>
                      <ActivityIcon tone={item.tone} />
                      <Stack gap={0} minW={0}>
                        <Text fontSize="sm" fontWeight={600} truncate>
                          {item.title}
                        </Text>
                        <Text fontSize="xs" color="formLabelMuted" truncate>
                          {item.subtitle}
                        </Text>
                      </Stack>
                    </HStack>
                    <ClockLabel happenedAt={item.happenedAt} />
                  </HStack>
                ))}
              </Stack>
            )}
          </Stack>
        </SectionCard>

        <SectionCard p={{ base: 5, md: 6 }}>
          <Stack gap={4}>
            <HStack justify="space-between" align="flex-start">
              <Stack gap={1}>
                <Heading size="md">Explore tasks near you</Heading>
                <Text fontSize="sm" color="formLabelMuted">
                  Nearby opportunities from your account feed.
                </Text>
              </Stack>
              <Link
                as={NextLink}
                href="/"
                fontSize="sm"
                fontWeight={600}
                color="primary.700"
                _hover={{ textDecoration: 'none', color: 'primary.600' }}
              >
                View map
              </Link>
            </HStack>

            <Box
              position="relative"
              h={{ base: '180px', md: '220px' }}
              borderRadius="xl"
              overflow="hidden"
              bg="linear-gradient(135deg, #f5f8f6 0%, #e8efec 100%)"
            >
              <Box
                position="absolute"
                inset={0}
                opacity={0.45}
                bgImage="repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(255,255,255,0.7) 31px, rgba(255,255,255,0.7) 32px), repeating-linear-gradient(90deg, transparent, transparent 31px, rgba(255,255,255,0.7) 31px, rgba(255,255,255,0.7) 32px)"
              />
              <Box
                position="absolute"
                left="50%"
                top="50%"
                transform="translate(-50%, -50%)"
                w="70px"
                h="70px"
                borderRadius="full"
                bg="primary.100"
                borderWidth="8px"
                borderColor="primary.200"
                opacity={0.9}
              />
              <Box
                position="absolute"
                left="50%"
                top="50%"
                transform="translate(-50%, -50%)"
                w={4}
                h={4}
                borderRadius="full"
                bg="blue.500"
                borderWidth="2px"
                borderColor="white"
              />
              {mapPins.map((pin) => (
                <Box
                  key={pin.id}
                  position="absolute"
                  left={`${pin.left}%`}
                  top={`${pin.top}%`}
                  transform="translate(-50%, -50%)"
                  px={2}
                  py={0.5}
                  bg="primary.500"
                  color="white"
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight={700}
                  boxShadow="sm"
                >
                  {pin.label}
                </Box>
              ))}
            </Box>

            <Stack gap={0.5}>
              <Text fontSize="sm" fontWeight={600}>
                {nearbyLabel}
              </Text>
              <Text fontSize="xs" color="formLabelMuted">
                Approx. 5km radius
              </Text>
            </Stack>
          </Stack>
        </SectionCard>
      </Grid>

      <SectionCard p={{ base: 5, md: 6 }}>
        <Stack gap={4}>
          <Heading size="md">Quick actions</Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, xl: 5 }} gap={3}>
            {quickActions.map((item) => (
              <Link
                key={item.key}
                as={NextLink}
                href={item.href}
                _hover={{ textDecoration: 'none' }}
              >
                <Stack
                  p={4}
                  borderRadius="lg"
                  bg="cardBg"
                  borderWidth="1px"
                  borderColor="cardBorder"
                  minH="106px"
                  justify="space-between"
                >
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight={600}>
                      {item.title}
                    </Text>
                    <Box
                      w={8}
                      h={8}
                      borderRadius="full"
                      bg="primary.100"
                      color="primary.700"
                      display="grid"
                      placeItems="center"
                    >
                      <QuickActionIcon kind={item.kind} />
                    </Box>
                  </HStack>
                  <Text fontSize="xs" color="formLabelMuted">
                    {item.subtitle}
                  </Text>
                </Stack>
              </Link>
            ))}
          </SimpleGrid>
        </Stack>
      </SectionCard>
    </Stack>
  )
}
