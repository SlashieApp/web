'use client'

import { useQuery } from '@apollo/client/react'
import {
  Box,
  HStack,
  Heading,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import type { MeQuery, TasksQuery } from '@codegen/schema'
import { Badge, Button, Container, GlassCard } from '@ui'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { LandingHeader } from '../components'

import { ME_QUERY } from '@/graphql/auth'
import { TASKS_QUERY } from '@/graphql/jobs'
import { clearAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

function formatPounds(pricePence: number) {
  return `£${(pricePence / 100).toFixed(0)}`
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
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

export default function DashboardPage() {
  const router = useRouter()
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
  } = useQuery<TasksQuery>(TASKS_QUERY, {
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
        myPostedTasks: [] as TasksQuery['tasks']['items'],
        myOffers: [] as Array<{
          task: TasksQuery['tasks']['items'][number]
          offer: TasksQuery['tasks']['items'][number]['offers'][number]
        }>,
        offerCountOnMyTasks: 0,
      }
    }

    const posted = tasks
      .filter((task) => task.createdByUserId === me.id)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    const submitted = tasks
      .flatMap((task) =>
        task.offers
          .filter((offer) => offer.workerUserId === me.id)
          .map((offer) => ({ task, offer })),
      )
      .sort(
        (a, b) => Date.parse(b.offer.createdAt) - Date.parse(a.offer.createdAt),
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

  return (
    <Box bg="bg" color="fg" minH="100vh" py={{ base: 8, md: 12 }}>
      <Container>
        <Stack gap={10}>
          <LandingHeader />
          <Stack gap={8}>
            <Box>
              <Heading size="lg">Dashboard</Heading>
              <Text opacity={0.8} mt={2}>
                Manage your posted tasks and quotes in one place.
              </Text>
            </Box>

            {meLoading ? <Text>Loading account…</Text> : null}
            {meErrorMessage ? (
              <Text color="red.400" fontSize="sm">
                {meErrorMessage}
              </Text>
            ) : null}

            {!meLoading && !me ? (
              <GlassCard p={6}>
                <Stack gap={4}>
                  <Heading size="md">Sign in to view your dashboard</Heading>
                  <Text color="muted">
                    You need an account to manage your posted tasks and quotes.
                  </Text>
                  <HStack gap={3} flexWrap="wrap">
                    <Button as={NextLink} href="/login" colorPalette="blue">
                      Log in
                    </Button>
                    <Button as={NextLink} href="/register" variant="outline">
                      Register
                    </Button>
                  </HStack>
                </Stack>
              </GlassCard>
            ) : null}

            {me ? (
              <>
                <GlassCard p={6}>
                  <Stack gap={5}>
                    <HStack justify="space-between" flexWrap="wrap" gap={3}>
                      <Stack gap={1}>
                        <Text fontWeight="600">Signed in as</Text>
                        <Text>{me.email}</Text>
                      </Stack>
                      <HStack gap={2}>
                        <Badge variant="outline">Member since</Badge>
                        <Text fontSize="sm" color="muted">
                          {formatDate(me.createdAt)}
                        </Text>
                      </HStack>
                    </HStack>
                    <HStack gap={3} flexWrap="wrap">
                      <Button
                        variant="outline"
                        onClick={() => {
                          clearAuthToken()
                          router.push('/login')
                        }}
                      >
                        Log out
                      </Button>
                      <Button
                        colorPalette="blue"
                        onClick={() => {
                          void refetchMe()
                          void refetchTasks()
                        }}
                      >
                        Refresh
                      </Button>
                      <Button
                        as={NextLink}
                        href="/tasks/create"
                        background="mustard.500"
                        color="black"
                      >
                        Post a new task
                      </Button>
                    </HStack>
                  </Stack>
                </GlassCard>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                  <GlassCard p={5}>
                    <Stack gap={1}>
                      <Text color="muted" fontSize="sm">
                        Posted tasks
                      </Text>
                      <Heading size="lg">{myPostedTasks.length}</Heading>
                    </Stack>
                  </GlassCard>
                  <GlassCard p={5}>
                    <Stack gap={1}>
                      <Text color="muted" fontSize="sm">
                        Offers on your tasks
                      </Text>
                      <Heading size="lg">{offerCountOnMyTasks}</Heading>
                    </Stack>
                  </GlassCard>
                  <GlassCard p={5}>
                    <Stack gap={1}>
                      <Text color="muted" fontSize="sm">
                        Offers you submitted
                      </Text>
                      <Heading size="lg">{myOffers.length}</Heading>
                    </Stack>
                  </GlassCard>
                </SimpleGrid>

                {tasksLoading ? <Text>Loading tasks and offers…</Text> : null}
                {tasksErrorMessage ? (
                  <Text color="red.400" fontSize="sm">
                    {tasksErrorMessage}
                  </Text>
                ) : null}

                {!tasksLoading && !tasksError ? (
                  <Stack gap={8}>
                    <GlassCard p={6}>
                      <Stack gap={5}>
                        <Heading size="md">Your posted tasks</Heading>
                        {myPostedTasks.length === 0 ? (
                          <Text color="muted">
                            You have not posted any tasks yet.
                          </Text>
                        ) : (
                          <Stack gap={4}>
                            {myPostedTasks.map((task) => {
                              const offerRange = getOfferRange(task.offers)
                              const latestOffers = [...task.offers]
                                .sort(
                                  (a, b) =>
                                    Date.parse(b.createdAt) -
                                    Date.parse(a.createdAt),
                                )
                                .slice(0, 3)

                              return (
                                <GlassCard key={task.id} p={5}>
                                  <Stack gap={4}>
                                    <HStack
                                      justify="space-between"
                                      align="flex-start"
                                      flexWrap="wrap"
                                      gap={3}
                                    >
                                      <Stack gap={1}>
                                        <Heading size="sm">
                                          {task.title}
                                        </Heading>
                                        <Text color="muted" fontSize="sm">
                                          Posted {formatDate(task.createdAt)}
                                        </Text>
                                      </Stack>
                                      <HStack gap={2} flexWrap="wrap">
                                        {task.location ? (
                                          <Badge variant="outline">
                                            {task.location}
                                          </Badge>
                                        ) : null}
                                        <Badge variant="outline">
                                          {task.offers.length} offer
                                          {task.offers.length === 1 ? '' : 's'}
                                        </Badge>
                                        {offerRange ? (
                                          <Badge
                                            bg="mustard.200"
                                            color="black"
                                            px={2}
                                          >
                                            {offerRange}
                                          </Badge>
                                        ) : null}
                                      </HStack>
                                    </HStack>

                                    <Text color="muted">
                                      {task.description}
                                    </Text>

                                    {latestOffers.length > 0 ? (
                                      <Stack gap={2}>
                                        <Text fontSize="sm" fontWeight={600}>
                                          Recent offers
                                        </Text>
                                        {latestOffers.map((offer) => (
                                          <HStack
                                            key={offer.id}
                                            justify="space-between"
                                            borderWidth="1px"
                                            borderColor="border"
                                            borderRadius="lg"
                                            px={3}
                                            py={2}
                                          >
                                            <Stack gap={0}>
                                              <Text
                                                fontSize="sm"
                                                fontWeight={600}
                                              >
                                                {formatPounds(offer.pricePence)}
                                              </Text>
                                              <Text fontSize="xs" color="muted">
                                                {offer.message || 'No message'}
                                              </Text>
                                            </Stack>
                                            <Text fontSize="xs" color="muted">
                                              {formatDate(offer.createdAt)}
                                            </Text>
                                          </HStack>
                                        ))}
                                      </Stack>
                                    ) : (
                                      <Text fontSize="sm" color="muted">
                                        No offers yet.
                                      </Text>
                                    )}

                                    <HStack>
                                      <Button
                                        as={NextLink}
                                        href={`/task/${task.id}`}
                                        size="sm"
                                        variant="outline"
                                      >
                                        View task
                                      </Button>
                                    </HStack>
                                  </Stack>
                                </GlassCard>
                              )
                            })}
                          </Stack>
                        )}
                      </Stack>
                    </GlassCard>

                    <GlassCard p={6}>
                      <Stack gap={5}>
                        <Heading size="md">Offers you submitted</Heading>
                        {myOffers.length === 0 ? (
                          <Text color="muted">
                            You have not submitted any offers yet.
                          </Text>
                        ) : (
                          <Stack gap={4}>
                            {myOffers.map(({ task, offer }) => (
                              <GlassCard key={offer.id} p={5}>
                                <Stack gap={3}>
                                  <HStack
                                    justify="space-between"
                                    align="flex-start"
                                    flexWrap="wrap"
                                    gap={3}
                                  >
                                    <Stack gap={1}>
                                      <Heading size="sm">{task.title}</Heading>
                                      <Text fontSize="sm" color="muted">
                                        Submitted {formatDate(offer.createdAt)}
                                      </Text>
                                    </Stack>
                                    <Badge
                                      bg="mustard.200"
                                      color="black"
                                      px={2}
                                    >
                                      {formatPounds(offer.pricePence)}
                                    </Badge>
                                  </HStack>
                                  <Text color="muted">
                                    {offer.message || 'No message added.'}
                                  </Text>
                                  <HStack>
                                    <Button
                                      as={NextLink}
                                      href={`/task/${task.id}`}
                                      size="sm"
                                      variant="outline"
                                    >
                                      View task
                                    </Button>
                                  </HStack>
                                </Stack>
                              </GlassCard>
                            ))}
                          </Stack>
                        )}
                      </Stack>
                    </GlassCard>
                  </Stack>
                ) : null}
              </>
            ) : null}

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
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
