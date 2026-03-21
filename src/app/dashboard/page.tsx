'use client'

import type { TasksQueryData } from '@/graphql/tasks-query.types'
import { useQuery } from '@apollo/client/react'
import { Box, Grid, GridItem, HStack, Link, Stack } from '@chakra-ui/react'
import type { MeQuery } from '@codegen/schema'
import { Badge, Button, DashboardShell, GlassCard, Heading, Text } from '@ui'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { ME_QUERY } from '@/graphql/auth'
import { TASKS_QUERY } from '@/graphql/jobs'
import { clearAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

type TaskItem = TasksQueryData['tasks']['items'][number]
type TabKey = 'created' | 'quoted'

function formatPounds(pricePence: number) {
  return `£${(pricePence / 100).toFixed(0)}`
}

function timeFromUnknown(value: unknown): number {
  const d =
    typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : value instanceof Date
        ? value
        : null
  return d && !Number.isNaN(d.getTime()) ? d.getTime() : 0
}

function formatDate(iso: unknown) {
  const d =
    typeof iso === 'string' || typeof iso === 'number'
      ? new Date(iso)
      : iso instanceof Date
        ? iso
        : null
  if (!d || Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

function formatRelativePosted(iso: unknown): string {
  const ms = timeFromUnknown(iso)
  if (!ms) return 'Recently'
  const diff = Date.now() - ms
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Posted just now'
  if (minutes < 60) return `Posted ${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Posted ${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Posted yesterday'
  if (days < 7) return `Posted ${days} days ago`
  return `Posted ${formatDate(iso)}`
}

function isTaskCompleted(status: string) {
  return /complete|done|closed|paid|archived|finished|resolved/i.test(
    status.trim(),
  )
}

function isOfferAwarded(status: string) {
  return /accept|award|select|win|approved|chosen/i.test(status.trim())
}

function getOfferRange(offers: Array<{ pricePence: number }>) {
  if (offers.length === 0) return null
  const prices = offers.map((offer) => offer.pricePence)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max
    ? formatPounds(min)
    : `${formatPounds(min)}–${formatPounds(max)}`
}

function getCategoryVisual(category: string | null | undefined) {
  const key = (category ?? '').toLowerCase()
  if (key.includes('plumb') || key.includes('water'))
    return {
      glyph: '🏠',
      bg: 'linear-gradient(135deg, #d9e6ff 0%, #b5ceff 100%)',
    }
  if (key.includes('electr'))
    return {
      glyph: '🔌',
      bg: 'linear-gradient(135deg, #dfe8f7 0%, #8fb4ff 100%)',
    }
  if (key.includes('paint') || key.includes('decor'))
    return {
      glyph: '🎨',
      bg: 'linear-gradient(135deg, #fff4e4 0%, #ffddb8 100%)',
    }
  return {
    glyph: '🔧',
    bg: 'linear-gradient(135deg, #eef4ff 0%, #dfe8f7 100%)',
  }
}

function matchesSearch(task: TaskItem, q: string) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  return (
    task.title.toLowerCase().includes(s) ||
    (task.description ?? '').toLowerCase().includes(s) ||
    (task.location ?? '').toLowerCase().includes(s)
  )
}

function OfferAvatarStack({ count }: { count: number }) {
  const shown = Math.min(count, 3)
  const extra = count - shown
  const letters = ['A', 'B', 'C'] as const
  return (
    <HStack gap={0}>
      {letters.slice(0, shown).map((letter, i) => (
        <Box
          key={letter}
          w={8}
          h={8}
          borderRadius="full"
          bg="primary.200"
          color="primary.800"
          fontSize="10px"
          fontWeight={800}
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderWidth="2px"
          borderColor="surfaceContainerLowest"
          ml={i > 0 ? -2 : 0}
          zIndex={shown - i}
        >
          {letter}
        </Box>
      ))}
      {extra > 0 ? (
        <Box
          w={8}
          h={8}
          borderRadius="full"
          bg="surfaceContainerHigh"
          color="muted"
          fontSize="xs"
          fontWeight={700}
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderWidth="2px"
          borderColor="surfaceContainerLowest"
          ml={-2}
        >
          +{extra}
        </Box>
      ) : null}
    </HStack>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>('created')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('view')
    if (v === 'quotes') setTab('quoted')
  }, [])

  const {
    data: meData,
    loading: meLoading,
    error: meError,
    refetch: refetchMe,
  } = useQuery<MeQuery>(ME_QUERY, {
    fetchPolicy: 'network-only',
  })
  const me = meData?.me ?? null
  const {
    data: tasksData,
    loading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery<TasksQueryData>(TASKS_QUERY, {
    fetchPolicy: 'network-only',
    skip: !me,
  })
  const tasks = tasksData?.tasks.items ?? []
  const meErrorMessage = meError
    ? getFriendlyErrorMessage(meError, 'Could not load account details.')
    : null
  const tasksErrorMessage = tasksError
    ? getFriendlyErrorMessage(tasksError, 'Could not load tasks.')
    : null

  const { myPostedTasks, myOffers, offerCountOnMyTasks } = useMemo(() => {
    if (!me) {
      return {
        myPostedTasks: [] as TaskItem[],
        myOffers: [] as Array<{
          task: TaskItem
          offer: TaskItem['offers'][number]
        }>,
        offerCountOnMyTasks: 0,
      }
    }

    const posted = tasks
      .filter((task) => task.createdByUserId === me.id)
      .sort(
        (a, b) => timeFromUnknown(b.createdAt) - timeFromUnknown(a.createdAt),
      )
    const submitted = tasks
      .flatMap((task) =>
        task.offers
          .filter((offer) => offer.workerUserId === me.id)
          .map((offer) => ({ task, offer })),
      )
      .sort(
        (a, b) =>
          timeFromUnknown(b.offer.createdAt) -
          timeFromUnknown(a.offer.createdAt),
      )

    const offerCount = posted.reduce(
      (count, task) => count + task.offers.length,
      0,
    )

    return {
      myPostedTasks: posted,
      myOffers: submitted,
      offerCountOnMyTasks: offerCount,
    }
  }, [tasks, me])

  const activePosted = useMemo(
    () =>
      myPostedTasks.filter(
        (t) => !isTaskCompleted(t.status) && matchesSearch(t, search),
      ),
    [myPostedTasks, search],
  )

  const quotedFiltered = useMemo(
    () => myOffers.filter(({ task }) => matchesSearch(task, search)),
    [myOffers, search],
  )

  const completedAsPoster = useMemo(
    () => myPostedTasks.filter((t) => isTaskCompleted(t.status)),
    [myPostedTasks],
  )

  const completedAsWorker = useMemo(
    () => myOffers.filter(({ task }) => isTaskCompleted(task.status)),
    [myOffers],
  )

  const completedHistoryItems = useMemo(() => {
    const poster = completedAsPoster.map((t) => ({
      kind: 'poster' as const,
      task: t,
      at: timeFromUnknown(t.createdAt),
    }))
    const worker = completedAsWorker.map(({ task, offer }) => ({
      kind: 'worker' as const,
      task,
      offer,
      at: timeFromUnknown(offer.createdAt),
    }))
    return [...poster, ...worker].sort((a, b) => b.at - a.at).slice(0, 6)
  }, [completedAsPoster, completedAsWorker])

  const totalSpendPence = useMemo(
    () =>
      completedAsPoster.reduce((sum, t) => sum + (t.priceOfferPence ?? 0), 0),
    [completedAsPoster],
  )

  const quotesInProgress = useMemo(
    () =>
      myOffers.filter(({ task }) => !isTaskCompleted(task.status)).slice(0, 4),
    [myOffers],
  )

  const userInitial = me?.email?.trim()?.charAt(0)?.toUpperCase() ?? '?'

  if (!meLoading && !me) {
    return (
      <Box bg="bg" color="fg" minH="100vh" py={{ base: 8, md: 12 }} px={4}>
        <Stack gap={8} maxW="lg" mx="auto">
          <Box>
            <Heading size="lg">Dashboard</Heading>
            <Text color="muted" mt={2}>
              Manage your posted tasks and quotes in one place.
            </Text>
          </Box>
          {meErrorMessage ? (
            <Text color="red.400" fontSize="sm">
              {meErrorMessage}
            </Text>
          ) : null}
          <GlassCard p={6}>
            <Stack gap={4}>
              <Heading size="md">Sign in to view your dashboard</Heading>
              <Text color="muted">
                You need an account to manage your posted tasks and quotes.
              </Text>
              <HStack gap={3} flexWrap="wrap">
                <Button as={NextLink} href="/login">
                  Log in
                </Button>
                <Button as={NextLink} href="/register" variant="subtle">
                  Register
                </Button>
              </HStack>
            </Stack>
          </GlassCard>
          <HStack gap={4} flexWrap="wrap">
            <Link
              as={NextLink}
              href="/"
              fontSize="sm"
              color="muted"
              _hover={{ color: 'fg' }}
            >
              ← Back to home
            </Link>
          </HStack>
        </Stack>
      </Box>
    )
  }

  return (
    <DashboardShell
      activeNav="my-jobs"
      searchValue={search}
      onSearchChange={setSearch}
      userLabel={me?.email ?? 'Account'}
      userInitial={userInitial}
    >
      <Stack gap={10}>
        {meLoading ? <Text color="muted">Loading account…</Text> : null}
        {meErrorMessage ? (
          <Text color="red.400" fontSize="sm">
            {meErrorMessage}
          </Text>
        ) : null}

        {me ? (
          <>
            <Stack gap={4}>
              <HStack
                justify="space-between"
                align={{ base: 'flex-start', md: 'center' }}
                flexDir={{ base: 'column', md: 'row' }}
                gap={4}
              >
                <Stack gap={2} maxW="3xl">
                  <Heading size="xl">My Jobs</Heading>
                  <Text color="muted" fontSize="md">
                    Manage your active projects, track offers, and respond to
                    quote requests—all in one architectural view.
                  </Text>
                </Stack>
                <Button as={NextLink} href="/tasks/create" flexShrink={0}>
                  + Post a New Job
                </Button>
              </HStack>

              <HStack gap={3} flexWrap="wrap" justify="space-between">
                <HStack
                  gap={0}
                  p={1}
                  bg="surfaceContainerLow"
                  borderRadius="full"
                  borderWidth="1px"
                  borderColor="border"
                >
                  <Button
                    size="sm"
                    variant={tab === 'created' ? 'solid' : 'ghost'}
                    borderRadius="full"
                    px={5}
                    onClick={() => setTab('created')}
                  >
                    Jobs I&apos;ve Created
                  </Button>
                  <Button
                    size="sm"
                    variant={tab === 'quoted' ? 'solid' : 'ghost'}
                    borderRadius="full"
                    px={5}
                    onClick={() => setTab('quoted')}
                  >
                    Jobs I&apos;ve Quoted
                  </Button>
                </HStack>
                <HStack gap={2} flexWrap="wrap">
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => {
                      clearAuthToken()
                      router.push('/login')
                    }}
                  >
                    Log out
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      void refetchMe()
                      void refetchTasks()
                    }}
                  >
                    Refresh
                  </Button>
                </HStack>
              </HStack>
            </Stack>

            <Grid
              templateColumns={{ base: '1fr', xl: '1fr 340px' }}
              gap={{ base: 8, xl: 8 }}
              alignItems="start"
            >
              <GridItem>
                <Stack gap={8}>
                  {tab === 'created' ? (
                    <Stack gap={4}>
                      <HStack gap={3} flexWrap="wrap" align="center">
                        <Heading size="md">Active Listings</Heading>
                        <Badge
                          px={3}
                          py={1}
                          borderRadius="full"
                          bg="primary.100"
                          color="primary.800"
                          fontSize="xs"
                          fontWeight={800}
                          letterSpacing="0.04em"
                        >
                          {activePosted.length} ACTIVE
                        </Badge>
                      </HStack>

                      {tasksLoading ? (
                        <Text color="muted">Loading tasks…</Text>
                      ) : null}
                      {tasksErrorMessage ? (
                        <Text color="red.400" fontSize="sm">
                          {tasksErrorMessage}
                        </Text>
                      ) : null}

                      {!tasksLoading && !tasksError ? (
                        activePosted.length === 0 ? (
                          <GlassCard p={6}>
                            <Text color="muted">
                              No active listings. Post a job to get offers from
                              verified craftspeople.
                            </Text>
                          </GlassCard>
                        ) : (
                          <Stack gap={4}>
                            {activePosted.map((task) => {
                              const visual = getCategoryVisual(task.category)
                              const n = task.offers.length
                              return (
                                <GlassCard key={task.id} p={5}>
                                  <Stack gap={4}>
                                    <HStack
                                      align="flex-start"
                                      gap={4}
                                      flexWrap="wrap"
                                    >
                                      <Box
                                        w={14}
                                        h={14}
                                        borderRadius="lg"
                                        bg={visual.bg}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        fontSize="xl"
                                        flexShrink={0}
                                      >
                                        {visual.glyph}
                                      </Box>
                                      <Stack gap={1} flex="1" minW="200px">
                                        <Heading size="sm">
                                          {task.title}
                                        </Heading>
                                        <HStack gap={2} flexWrap="wrap">
                                          {task.location ? (
                                            <Text fontSize="sm" color="muted">
                                              {task.location}
                                            </Text>
                                          ) : null}
                                          <Text fontSize="sm" color="muted">
                                            {formatRelativePosted(
                                              task.createdAt,
                                            )}
                                          </Text>
                                        </HStack>
                                      </Stack>
                                      <Stack
                                        gap={3}
                                        align={{
                                          base: 'flex-start',
                                          sm: 'flex-end',
                                        }}
                                      >
                                        <HStack gap={2} flexWrap="wrap">
                                          {n > 0 ? (
                                            <Badge
                                              px={2}
                                              py={1}
                                              borderRadius="md"
                                              bg="secondaryFixed"
                                              color="onSecondaryFixed"
                                              fontSize="10px"
                                              fontWeight={800}
                                              letterSpacing="0.06em"
                                            >
                                              {n} OFFER{n === 1 ? '' : 'S'}{' '}
                                              RECEIVED
                                            </Badge>
                                          ) : (
                                            <Badge
                                              px={2}
                                              py={1}
                                              borderRadius="md"
                                              bg="surfaceContainerHigh"
                                              color="muted"
                                              fontSize="10px"
                                              fontWeight={800}
                                              letterSpacing="0.06em"
                                            >
                                              AWAITING QUOTES
                                            </Badge>
                                          )}
                                          {n > 0 ? (
                                            <OfferAvatarStack count={n} />
                                          ) : null}
                                        </HStack>
                                        <Button
                                          as={NextLink}
                                          href={`/task/${task.id}`}
                                          size="sm"
                                          alignSelf={{ sm: 'flex-end' }}
                                        >
                                          {n > 0 ? 'View Offers' : 'View Job'}
                                        </Button>
                                      </Stack>
                                    </HStack>

                                    {n === 0 ? (
                                      <Text fontSize="sm" color="muted">
                                        No offers yet. Share your listing to
                                        reach more pros, or{' '}
                                        <Link
                                          as={NextLink}
                                          href={`/task/${task.id}`}
                                          color="primary.600"
                                          fontWeight={700}
                                          _hover={{ color: 'primary.700' }}
                                        >
                                          boost visibility
                                        </Link>
                                        .
                                      </Text>
                                    ) : null}

                                    {getOfferRange(task.offers) ? (
                                      <Text fontSize="xs" color="muted">
                                        Offer range:{' '}
                                        {getOfferRange(task.offers)}
                                      </Text>
                                    ) : null}
                                  </Stack>
                                </GlassCard>
                              )
                            })}
                          </Stack>
                        )
                      ) : null}
                    </Stack>
                  ) : (
                    <Stack gap={4}>
                      <HStack gap={3} flexWrap="wrap" align="center">
                        <Heading size="md">Your quoted jobs</Heading>
                        <Badge
                          px={3}
                          py={1}
                          borderRadius="full"
                          bg="surfaceContainerHigh"
                          color="fg"
                          fontSize="xs"
                          fontWeight={800}
                        >
                          {quotedFiltered.length} QUOTES
                        </Badge>
                      </HStack>
                      {tasksLoading ? (
                        <Text color="muted">Loading…</Text>
                      ) : null}
                      {!tasksLoading && !tasksError ? (
                        quotedFiltered.length === 0 ? (
                          <GlassCard p={6}>
                            <Text color="muted">
                              You have not submitted any quotes yet. Browse open
                              jobs and send your first offer.
                            </Text>
                            <Button
                              as={NextLink}
                              href="/tasks"
                              variant="tool"
                              mt={4}
                              size="sm"
                            >
                              Browse tasks
                            </Button>
                          </GlassCard>
                        ) : (
                          <Stack gap={4}>
                            {quotedFiltered.map(({ task, offer }) => {
                              const visual = getCategoryVisual(task.category)
                              const awarded = isOfferAwarded(offer.status)
                              return (
                                <GlassCard key={offer.id} p={5}>
                                  <HStack
                                    align="flex-start"
                                    gap={4}
                                    flexWrap="wrap"
                                  >
                                    <Box
                                      w={14}
                                      h={14}
                                      borderRadius="lg"
                                      bg={visual.bg}
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                      fontSize="xl"
                                      flexShrink={0}
                                    >
                                      {visual.glyph}
                                    </Box>
                                    <Stack gap={2} flex="1" minW="200px">
                                      <Heading size="sm">{task.title}</Heading>
                                      <Text fontSize="sm" color="muted">
                                        {task.location ?? 'Location TBC'} ·{' '}
                                        {formatPounds(offer.pricePence)} offer ·{' '}
                                        {formatRelativePosted(offer.createdAt)}
                                      </Text>
                                      <Badge
                                        alignSelf="flex-start"
                                        px={2}
                                        py={1}
                                        borderRadius="md"
                                        bg={
                                          awarded
                                            ? 'secondaryFixed'
                                            : 'surfaceContainerHigh'
                                        }
                                        color={
                                          awarded ? 'onSecondaryFixed' : 'muted'
                                        }
                                        fontSize="10px"
                                        fontWeight={800}
                                        letterSpacing="0.06em"
                                      >
                                        {awarded ? 'AWARDED' : 'PENDING'}
                                      </Badge>
                                    </Stack>
                                    <Button
                                      as={NextLink}
                                      href={`/task/${task.id}`}
                                      size="sm"
                                      variant="subtle"
                                    >
                                      View task
                                    </Button>
                                  </HStack>
                                </GlassCard>
                              )
                            })}
                          </Stack>
                        )
                      ) : null}
                    </Stack>
                  )}
                </Stack>
              </GridItem>

              <GridItem>
                <Stack gap={4} position={{ xl: 'sticky' }} top={{ xl: 4 }}>
                  <Box
                    borderRadius="xl"
                    bg="linear-gradient(160deg, #03225a 0%, #012b73 55%, #00358f 100%)"
                    color="white"
                    p={6}
                    boxShadow="card"
                  >
                    <Stack gap={4}>
                      <Stack gap={1}>
                        <Text fontSize="sm" opacity={0.85}>
                          Total spend (completed)
                        </Text>
                        <Heading size="lg" color="white">
                          {formatPounds(totalSpendPence)}
                        </Heading>
                      </Stack>
                      <Stack gap={1}>
                        <Text fontSize="sm" opacity={0.85}>
                          Completed jobs
                        </Text>
                        <Heading size="md" color="white">
                          {completedAsPoster.length}
                        </Heading>
                      </Stack>
                      <Box
                        borderWidth="1px"
                        borderStyle="dashed"
                        borderColor="rgba(255,255,255,0.35)"
                        borderRadius="lg"
                        p={4}
                      >
                        <Text
                          fontSize="10px"
                          fontWeight={800}
                          letterSpacing="0.1em"
                          opacity={0.9}
                          mb={2}
                        >
                          ⭐ MASTER STATUS
                        </Text>
                        <Text fontSize="sm" lineHeight="tall" opacity={0.92}>
                          You&apos;re in the top tier of homeowners. Complete
                          profiles and clear briefs get faster responses from
                          pros.
                        </Text>
                      </Box>
                    </Stack>
                  </Box>

                  <GlassCard p={5} bg="primary.50" borderColor="primary.100">
                    <Stack gap={4}>
                      <Text
                        fontSize="xs"
                        fontWeight={800}
                        letterSpacing="0.1em"
                        color="primary.800"
                      >
                        QUOTES IN PROGRESS
                      </Text>
                      {quotesInProgress.length === 0 ? (
                        <Text fontSize="sm" color="muted">
                          No open quotes right now.
                        </Text>
                      ) : (
                        <Stack gap={3}>
                          {quotesInProgress.map(({ task, offer }) => {
                            const awarded = isOfferAwarded(offer.status)
                            return (
                              <HStack
                                key={offer.id}
                                justify="space-between"
                                align="flex-start"
                                gap={2}
                              >
                                <Stack gap={0}>
                                  <Text fontWeight={700} fontSize="sm">
                                    {task.title}
                                  </Text>
                                  <Text fontSize="xs" color="muted">
                                    {formatPounds(offer.pricePence)} offer
                                  </Text>
                                </Stack>
                                <Badge
                                  px={2}
                                  py={0.5}
                                  fontSize="10px"
                                  fontWeight={800}
                                  bg={
                                    awarded
                                      ? 'secondaryFixed'
                                      : 'surfaceContainerHigh'
                                  }
                                  color={awarded ? 'onSecondaryFixed' : 'muted'}
                                >
                                  {awarded ? 'AWARDED' : 'PENDING'}
                                </Badge>
                              </HStack>
                            )
                          })}
                        </Stack>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        color="primary.700"
                        onClick={() => setTab('quoted')}
                      >
                        View all quoted jobs
                      </Button>
                    </Stack>
                  </GlassCard>

                  <GlassCard p={5}>
                    <Stack gap={2} fontSize="sm">
                      <Text fontWeight={700}>At a glance</Text>
                      <HStack justify="space-between">
                        <Text color="muted">Posted tasks</Text>
                        <Text fontWeight={700}>{myPostedTasks.length}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="muted">Offers on your tasks</Text>
                        <Text fontWeight={700}>{offerCountOnMyTasks}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="muted">Quotes you sent</Text>
                        <Text fontWeight={700}>{myOffers.length}</Text>
                      </HStack>
                    </Stack>
                  </GlassCard>
                </Stack>
              </GridItem>
            </Grid>

            <Stack gap={4}>
              <Heading size="lg">Completed History</Heading>
              {completedHistoryItems.length === 0 ? (
                <GlassCard p={6}>
                  <Text color="muted">
                    Completed work will appear here once jobs are marked done.
                  </Text>
                </GlassCard>
              ) : (
                <Box
                  overflowX="auto"
                  pb={2}
                  css={{
                    scrollbarWidth: 'thin',
                  }}
                >
                  <HStack align="stretch" gap={4} minW="min-content">
                    {completedHistoryItems.slice(0, 2).map((item) => {
                      const task = item.task
                      const headline =
                        item.kind === 'poster' ? 'Posted job' : 'Your quote'
                      return (
                        <GlassCard
                          key={`${item.kind}-${task.id}`}
                          p={5}
                          minW="280px"
                          maxW="320px"
                          bg="surfaceContainerLow"
                          flexShrink={0}
                        >
                          <Stack gap={3}>
                            <HStack gap={2}>
                              <Text fontSize="lg">✓</Text>
                              <Text
                                fontSize="10px"
                                fontWeight={800}
                                letterSpacing="0.08em"
                                color="muted"
                              >
                                {formatDate(task.createdAt).toUpperCase()}
                              </Text>
                            </HStack>
                            <Heading size="sm">{task.title}</Heading>
                            <Text
                              fontSize="sm"
                              color="muted"
                              css={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {task.description}
                            </Text>
                            <HStack justify="space-between" pt={2}>
                              <Text fontWeight={800}>
                                {task.priceOfferPence
                                  ? formatPounds(task.priceOfferPence)
                                  : '—'}
                              </Text>
                              <Link
                                as={NextLink}
                                href={`/task/${task.id}`}
                                fontSize="sm"
                                fontWeight={700}
                                color="primary.600"
                                _hover={{ color: 'primary.700' }}
                              >
                                View invoice
                              </Link>
                            </HStack>
                            <Text fontSize="xs" color="muted">
                              {headline}
                            </Text>
                          </Stack>
                        </GlassCard>
                      )
                    })}
                    <GlassCard
                      p={5}
                      minW="240px"
                      maxW="280px"
                      flexShrink={0}
                      bg="surfaceContainerHigh"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Stack gap={3} textAlign="center" align="center">
                        <Text fontSize="2xl">📄</Text>
                        <Heading size="sm">Tax &amp; records</Heading>
                        <Text fontSize="xs" color="muted">
                          Export a summary of completed work for your records.
                        </Text>
                        <Link
                          href="#"
                          fontSize="xs"
                          fontWeight={800}
                          letterSpacing="0.06em"
                          color="primary.600"
                          onClick={(e) => e.preventDefault()}
                        >
                          DOWNLOAD SUMMARY
                        </Link>
                      </Stack>
                    </GlassCard>
                  </HStack>
                </Box>
              )}
            </Stack>

            <HStack gap={4} flexWrap="wrap" pt={4}>
              <Link
                as={NextLink}
                href="/"
                fontSize="sm"
                color="muted"
                _hover={{ color: 'fg' }}
              >
                ← Back to home
              </Link>
              <Link
                as={NextLink}
                href="/tasks"
                fontSize="sm"
                color="muted"
                _hover={{ color: 'fg' }}
              >
                Browse tasks →
              </Link>
            </HStack>
          </>
        ) : null}
      </Stack>
    </DashboardShell>
  )
}
