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

import { Button, Card } from '@ui'

import { useUserStore } from '@/app/(auth)/store/user'
import { MembershipRefreshOnMount } from '@/app/(dashboard)/components/MembershipRefreshOnMount'
import { WorkerMembershipCard } from '@/app/(dashboard)/components/WorkerMembershipCard'
import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { ScheduleChip } from '@/ui/ScheduleChip'
import {
  formatPounds,
  isQuoteAwarded,
  isTaskCompleted,
  timeFromUnknown,
} from '@/utils/dashboardHelpers'
import {
  orderLocationLabel,
  orderPartyRole,
  orderTaskHref,
  scheduleChipForOrder,
  sortOrdersBySchedule,
} from '@/utils/orderHelpers'
import { notificationRowsFromQuery } from '../helpers/notificationActivity'
import { useAccountOrders } from '../helpers/useAccountOrders'
import { useMyQuotes } from '../helpers/useMyQuotes'
import { useMyRequests } from '../helpers/useMyRequests'

type StatTileProps = {
  label: string
  value: string
  helper: string
  icon: ReactNode
}

type ActivityTone = 'green' | 'purple' | 'blue' | 'mint' | 'red'

type ActivityRow = {
  id: string
  title: string
  subtitle: string
  happenedAt: unknown
  tone: ActivityTone
  href?: string
}

function StatTile({ label, value, helper, icon }: StatTileProps) {
  return (
    <Card layout="section" p={5}>
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
    </Card>
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
    red: 'red.100',
  } as const
  const fgByTone = {
    green: 'green.700',
    purple: 'purple.700',
    blue: 'blue.700',
    mint: 'primary.700',
    red: 'red.700',
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
  kind: 'post' | 'browse' | 'requests' | 'quotes' | 'profile'
}) {
  if (kind === 'browse') return <Text fontWeight={700}>⌕</Text>
  if (kind === 'requests') return <Text fontWeight={700}>⌂</Text>
  if (kind === 'quotes') return <Text fontWeight={700}>☑</Text>
  if (kind === 'profile') return <Text fontWeight={700}>◯</Text>
  return <Text fontWeight={700}>＋</Text>
}

export default function DashboardOverviewPage() {
  const me = useUserStore((s) => s.me)
  const { loading, errorMessage, postedTasks, activePostedTasks } =
    useMyRequests()

  const {
    loading: quotesLoading,
    errorMessage: quotesErrorMessage,
    sentQuotes,
  } = useMyQuotes()

  const {
    loading: ordersLoading,
    errorMessage: ordersErrorMessage,
    activeOrders,
    openOrdersCount,
    pendingEarningsPence,
    closedOrdersCount,
  } = useAccountOrders()

  const displayName =
    me?.profile?.name?.trim() || me?.email?.split('@')[0] || 'there'

  const greeting =
    new Date().getHours() < 12
      ? 'Good morning'
      : new Date().getHours() < 18
        ? 'Good afternoon'
        : 'Good evening'

  const loadingAny = loading || quotesLoading || ordersLoading
  const errorMessageCombined =
    errorMessage || quotesErrorMessage || ordersErrorMessage || null
  const postedAwaitingQuotes = activePostedTasks.filter(
    (task) => (task.quotes?.length ?? 0) === 0,
  ).length
  const quotesAwaitingResponse = sentQuotes.filter(
    ({ quote }) => !isQuoteAwarded(quote.status),
  ).length

  const notifications = useNotificationsOptional()

  const recentActivity = useMemo<ActivityRow[]>(() => {
    if (notifications?.items.length) {
      return notificationRowsFromQuery(notifications.items, 8)
    }

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
  }, [notifications?.items, postedTasks, sentQuotes])

  const upcomingJobs = useMemo(() => {
    if (!me) return []
    return sortOrdersBySchedule(activeOrders).map((order) => ({
      id: order.id,
      order,
      role: orderPartyRole(order, me.id) === 'customer' ? 'Customer' : 'Worker',
    }))
  }, [activeOrders, me])

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
      href: '/tasks',
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
      key: 'quotes',
      title: 'My Quotes',
      subtitle: 'Track quotes you sent on tasks',
      href: '/quotes',
      kind: 'quotes' as const,
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

  return (
    <Stack gap={{ base: 5, md: 6 }}>
      <MembershipRefreshOnMount />
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
            Manage your tasks and quotes in one place.
          </Text>
        </Stack>
        <HStack gap={2} flexWrap="wrap">
          <Link as={NextLink} href="/tasks" _hover={{ textDecoration: 'none' }}>
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

      {errorMessageCombined ? (
        <Text color="red.500" fontSize="sm">
          {errorMessageCombined}
        </Text>
      ) : null}

      <SimpleGrid columns={{ base: 2, xl: 4 }} gap={3}>
        <StatTile
          label="Posted tasks"
          value={loadingAny ? '…' : String(postedTasks.length)}
          helper={`${activePostedTasks.length} open · ${postedAwaitingQuotes} awaiting quotes`}
          icon={<TileIcon type="posted" />}
        />
        <StatTile
          label="Quotes sent"
          value={loadingAny ? '…' : String(sentQuotes.length)}
          helper={`${quotesAwaitingResponse} awaiting response`}
          icon={<TileIcon type="quotes" />}
        />
        <StatTile
          label="Open orders"
          value={loadingAny ? '…' : String(openOrdersCount)}
          helper="Active jobs from accepted quotes"
          icon={<TileIcon type="accepted" />}
        />
        <StatTile
          label="Pending earnings"
          value={loadingAny ? '…' : formatPounds(pendingEarningsPence)}
          helper={`${closedOrdersCount} closed order${closedOrdersCount === 1 ? '' : 's'}`}
          icon={<TileIcon type="done" />}
        />
      </SimpleGrid>

      {upcomingJobs.length > 0 ? (
        <Card layout="section" p={{ base: 5, md: 6 }}>
          <Stack gap={4}>
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <Stack gap={1}>
                <Heading size="md" color="cardFg">
                  Upcoming accepted jobs
                </Heading>
                <Text fontSize="sm" color="formLabelMuted">
                  Sorted by scheduled date when the task uses an exact time.
                </Text>
              </Stack>
              <Link
                as={NextLink}
                href="/quotes"
                fontSize="sm"
                fontWeight={600}
                color="primary.700"
              >
                View all quotes
              </Link>
            </HStack>
            <Stack gap={2}>
              {upcomingJobs.slice(0, 5).map((entry) => (
                <Link
                  key={entry.id}
                  as={NextLink}
                  href={orderTaskHref(entry.order)}
                  display="block"
                  p={3}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="cardBorder"
                  _hover={{ textDecoration: 'none', bg: 'badgeBg' }}
                >
                  <HStack justify="space-between" align="flex-start" gap={3}>
                    <Stack gap={1} minW={0}>
                      <Text fontWeight={600} truncate>
                        {entry.order.snapshot.title}
                      </Text>
                      <Text fontSize="xs" color="formLabelMuted" truncate>
                        {entry.role} · {orderLocationLabel(entry.order)}
                      </Text>
                    </Stack>
                    <ScheduleChip chip={scheduleChipForOrder(entry.order)} />
                  </HStack>
                </Link>
              ))}
            </Stack>
          </Stack>
        </Card>
      ) : null}

      <Grid templateColumns={{ base: '1fr', xl: '1.3fr 1fr' }} gap={4}>
        <Card layout="section" p={{ base: 5, md: 6 }}>
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

            {notifications?.loading && recentActivity.length === 0 ? (
              <Text color="formLabelMuted" fontSize="sm">
                Loading activity…
              </Text>
            ) : recentActivity.length === 0 ? (
              <Text color="formLabelMuted" fontSize="sm">
                No activity yet. Start by posting a task or sending a quote.
              </Text>
            ) : (
              <Stack gap={1}>
                {recentActivity.map((item) => {
                  const row = (
                    <HStack
                      key={item.id}
                      justify="space-between"
                      align="flex-start"
                      py={2.5}
                      borderBottomWidth="1px"
                      borderColor="cardBorder"
                      w="full"
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
                  )
                  return item.href ? (
                    <Link
                      key={item.id}
                      as={NextLink}
                      href={item.href}
                      display="block"
                      _hover={{ textDecoration: 'none', bg: 'badgeBg' }}
                      borderRadius="md"
                    >
                      {row}
                    </Link>
                  ) : (
                    <Box key={item.id}>{row}</Box>
                  )
                })}
              </Stack>
            )}
          </Stack>
        </Card>

        {me?.worker?.membership ? (
          <WorkerMembershipCard membership={me.worker.membership} />
        ) : (
          <Card layout="section" p={{ base: 5, md: 6 }}>
            <Stack gap={4}>
              <Stack gap={1}>
                <Heading size="md">Platform membership</Heading>
                <Text fontSize="sm" color="formLabelMuted">
                  Post tasks for free as a customer, or become a worker to send
                  quotes.
                </Text>
              </Stack>
              <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
                Compare quotes from local workers. Job payments stay between you
                and your pro — not through Slashie.
              </Text>
              <Link
                as={NextLink}
                href="/worker/setup"
                _hover={{ textDecoration: 'none' }}
              >
                <Button size="sm" w={{ base: 'full', md: 'auto' }}>
                  Become a worker
                </Button>
              </Link>
            </Stack>
          </Card>
        )}
      </Grid>

      <Card layout="section" p={{ base: 5, md: 6 }}>
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
      </Card>
    </Stack>
  )
}
