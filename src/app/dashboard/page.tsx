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
import type { JobsQuery, MeQuery } from '@codegen/schema'
import { Badge, Button, Container, GlassCard } from '@ui'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { LandingHeader } from '../components'

import { ME_QUERY } from '@/graphql/auth'
import { JOBS_QUERY } from '@/graphql/jobs'
import { clearAuthToken } from '@/utils/auth'

function formatPounds(pricePence: number) {
  return `£${(pricePence / 100).toFixed(0)}`
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function getQuoteRange(quotes: Array<{ pricePence: number }>) {
  if (quotes.length === 0) return null
  const prices = quotes.map((quote) => quote.pricePence)
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
    data: jobsData,
    loading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs,
  } = useQuery<JobsQuery>(JOBS_QUERY, {
    fetchPolicy: 'network-only',
    skip: !me,
  })
  const jobs = jobsData?.jobs ?? []

  const { myPostedJobs, myQuotes, quoteCountOnMyJobs } = useMemo(() => {
    if (!me) {
      return {
        myPostedJobs: [] as JobsQuery['jobs'],
        myQuotes: [] as Array<{
          job: JobsQuery['jobs'][number]
          quote: JobsQuery['jobs'][number]['quotes'][number]
        }>,
        quoteCountOnMyJobs: 0,
      }
    }

    const posted = jobs
      .filter((job) => job.createdByUserId === me.id)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    const submitted = jobs
      .flatMap((job) =>
        job.quotes
          .filter((quote) => quote.handymanUserId === me.id)
          .map((quote) => ({ job, quote })),
      )
      .sort(
        (a, b) => Date.parse(b.quote.createdAt) - Date.parse(a.quote.createdAt),
      )

    const quoteCount = posted.reduce(
      (count, job) => count + job.quotes.length,
      0,
    )

    return {
      myPostedJobs: posted,
      myQuotes: submitted,
      quoteCountOnMyJobs: quoteCount,
    }
  }, [jobs, me])

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
            {meError ? (
              <Text color="red.400" fontSize="sm">
                {meError.message}
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
                          void refetchJobs()
                        }}
                      >
                        Refresh
                      </Button>
                      <Button
                        as={NextLink}
                        href="/#post-task"
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
                      <Heading size="lg">{myPostedJobs.length}</Heading>
                    </Stack>
                  </GlassCard>
                  <GlassCard p={5}>
                    <Stack gap={1}>
                      <Text color="muted" fontSize="sm">
                        Quotes on your tasks
                      </Text>
                      <Heading size="lg">{quoteCountOnMyJobs}</Heading>
                    </Stack>
                  </GlassCard>
                  <GlassCard p={5}>
                    <Stack gap={1}>
                      <Text color="muted" fontSize="sm">
                        Quotes you submitted
                      </Text>
                      <Heading size="lg">{myQuotes.length}</Heading>
                    </Stack>
                  </GlassCard>
                </SimpleGrid>

                {jobsLoading ? <Text>Loading tasks and quotes…</Text> : null}
                {jobsError ? (
                  <Text color="red.400" fontSize="sm">
                    {jobsError.message}
                  </Text>
                ) : null}

                {!jobsLoading && !jobsError ? (
                  <Stack gap={8}>
                    <GlassCard p={6}>
                      <Stack gap={5}>
                        <Heading size="md">Your posted tasks</Heading>
                        {myPostedJobs.length === 0 ? (
                          <Text color="muted">
                            You have not posted any tasks yet.
                          </Text>
                        ) : (
                          <Stack gap={4}>
                            {myPostedJobs.map((job) => {
                              const quoteRange = getQuoteRange(job.quotes)
                              const latestQuotes = [...job.quotes]
                                .sort(
                                  (a, b) =>
                                    Date.parse(b.createdAt) -
                                    Date.parse(a.createdAt),
                                )
                                .slice(0, 3)

                              return (
                                <GlassCard key={job.id} p={5}>
                                  <Stack gap={4}>
                                    <HStack
                                      justify="space-between"
                                      align="flex-start"
                                      flexWrap="wrap"
                                      gap={3}
                                    >
                                      <Stack gap={1}>
                                        <Heading size="sm">{job.title}</Heading>
                                        <Text color="muted" fontSize="sm">
                                          Posted {formatDate(job.createdAt)}
                                        </Text>
                                      </Stack>
                                      <HStack gap={2} flexWrap="wrap">
                                        {job.location ? (
                                          <Badge variant="outline">
                                            {job.location}
                                          </Badge>
                                        ) : null}
                                        <Badge variant="outline">
                                          {job.quotes.length} quote
                                          {job.quotes.length === 1 ? '' : 's'}
                                        </Badge>
                                        {quoteRange ? (
                                          <Badge
                                            bg="mustard.200"
                                            color="black"
                                            px={2}
                                          >
                                            {quoteRange}
                                          </Badge>
                                        ) : null}
                                      </HStack>
                                    </HStack>

                                    <Text color="muted">{job.description}</Text>

                                    {latestQuotes.length > 0 ? (
                                      <Stack gap={2}>
                                        <Text fontSize="sm" fontWeight={600}>
                                          Recent quotes
                                        </Text>
                                        {latestQuotes.map((quote) => (
                                          <HStack
                                            key={quote.id}
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
                                                {formatPounds(quote.pricePence)}
                                              </Text>
                                              <Text fontSize="xs" color="muted">
                                                {quote.message || 'No message'}
                                              </Text>
                                            </Stack>
                                            <Text fontSize="xs" color="muted">
                                              {formatDate(quote.createdAt)}
                                            </Text>
                                          </HStack>
                                        ))}
                                      </Stack>
                                    ) : (
                                      <Text fontSize="sm" color="muted">
                                        No quotes yet.
                                      </Text>
                                    )}

                                    <HStack>
                                      <Button
                                        as={NextLink}
                                        href={`/task/${job.id}`}
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
                        <Heading size="md">Quotes you submitted</Heading>
                        {myQuotes.length === 0 ? (
                          <Text color="muted">
                            You have not submitted any quotes yet.
                          </Text>
                        ) : (
                          <Stack gap={4}>
                            {myQuotes.map(({ job, quote }) => (
                              <GlassCard key={quote.id} p={5}>
                                <Stack gap={3}>
                                  <HStack
                                    justify="space-between"
                                    align="flex-start"
                                    flexWrap="wrap"
                                    gap={3}
                                  >
                                    <Stack gap={1}>
                                      <Heading size="sm">{job.title}</Heading>
                                      <Text fontSize="sm" color="muted">
                                        Submitted {formatDate(quote.createdAt)}
                                      </Text>
                                    </Stack>
                                    <Badge
                                      bg="mustard.200"
                                      color="black"
                                      px={2}
                                    >
                                      {formatPounds(quote.pricePence)}
                                    </Badge>
                                  </HStack>
                                  <Text color="muted">
                                    {quote.message || 'No message added.'}
                                  </Text>
                                  <HStack>
                                    <Button
                                      as={NextLink}
                                      href={`/task/${job.id}`}
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
