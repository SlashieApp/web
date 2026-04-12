'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { Box, Grid, Link, Stack } from '@chakra-ui/react'
import type {
  AcceptQuoteMutation,
  AddQuoteMutation,
  CancelTaskMutation,
  MeQuery,
  TaskQuery,
} from '@codegen/schema'
import { TaskStatus } from '@codegen/schema'
import NextLink from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'

import { ME_QUERY } from '@/graphql/auth'
import {
  ACCEPT_QUOTE_MUTATION,
  ADD_QUOTE,
  CANCEL_TASK_MUTATION,
  TASK_QUERY,
} from '@/graphql/tasks'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { getWorkerRegistered } from '@/utils/workerSession'
import { Footer, Heading, Section, Text } from '@ui'

import { TaskDetailApproximateLocation } from './components/TaskDetailApproximateLocation'
import { TaskDetailDescriptionCard } from './components/TaskDetailDescriptionCard'
import { TaskDetailHero } from './components/TaskDetailHero'
import { TaskDetailOwnerHelpCard } from './components/TaskDetailOwnerHelpCard'
import { TaskDetailOwnerPerformanceCard } from './components/TaskDetailOwnerPerformanceCard'
import { TaskDetailOwnerQuickInfo } from './components/TaskDetailOwnerQuickInfo'
import { TaskDetailOwnerQuotesSection } from './components/TaskDetailOwnerQuotesSection'
import { TaskDetailOwnerToolbar } from './components/TaskDetailOwnerToolbar'
import { TaskDetailPhotoGrid } from './components/TaskDetailPhotoGrid'
import { TaskDetailPostedMeta } from './components/TaskDetailPostedMeta'
import { TaskDetailPreferredAvailability } from './components/TaskDetailPreferredAvailability'
import {
  TaskDetailWorkerCtas,
  TaskDetailWorkerQuotePanel,
} from './components/TaskDetailWorkerSidebar'
import type { TaskDetailRecord } from './components/taskDetailUtils'

function formatPounds(pricePence: number) {
  return `£${(pricePence / 100).toFixed(0)}`
}

function normaliseStatus(status: string) {
  return status.replaceAll('_', ' ').toUpperCase()
}

function taskStatusBadgeLabel(status: string) {
  const s = status.toUpperCase()
  if (s === 'OPEN' || s === 'POSTED' || s === 'PUBLISHED') return 'OPEN'
  return normaliseStatus(status)
}

function workerAvatarLabel(workerUserId: string) {
  const alnum = workerUserId.replace(/[^a-zA-Z0-9]/g, '')
  if (alnum.length >= 2) return alnum.slice(0, 2)
  if (alnum.length === 1) return `${alnum}P`
  return 'PR'
}

export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams<{ slug?: string | string[] }>()
  const slugParam = params?.slug
  const taskId = Array.isArray(slugParam) ? slugParam[0] : (slugParam ?? '')

  const [pricePence, setPricePence] = useState('')
  const [message, setMessage] = useState('')
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [quoteSuccess, setQuoteSuccess] = useState<string | null>(null)
  const [acceptError, setAcceptError] = useState<string | null>(null)
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const hasToken = typeof window !== 'undefined' && Boolean(getAuthToken())

  const { data: meData } = useQuery<MeQuery>(ME_QUERY, {
    skip: !hasToken,
    fetchPolicy: 'cache-first',
  })
  const me = meData?.me ?? null

  const { data, loading, error, refetch } = useQuery<TaskQuery>(TASK_QUERY, {
    variables: { id: taskId },
    skip: !taskId,
  })

  const [addQuote, { loading: quoting }] =
    useMutation<AddQuoteMutation>(ADD_QUOTE)

  const [acceptQuote] = useMutation<AcceptQuoteMutation>(ACCEPT_QUOTE_MUTATION)

  const [cancelTask, { loading: cancelingTask }] =
    useMutation<CancelTaskMutation>(CANCEL_TASK_MUTATION)

  const task = data?.task

  const isOwner = Boolean(
    me && task && (me.id === task.createdByUserId || me.id === task.poster?.id),
  )
  const myQuote = useMemo(() => {
    if (!me || !task) return null
    return task.quotes.find((o) => o.workerUserId === me.id) ?? null
  }, [me, task])

  const workerOnboardingDone = Boolean(me && getWorkerRegistered(me.id))

  const sortedQuotes = useMemo(() => {
    if (!task) return []
    return [...task.quotes].sort((a, b) => a.pricePence - b.pricePence)
  }, [task])

  const lowestPricePence = useMemo(() => {
    if (sortedQuotes.length === 0) return null
    return sortedQuotes[0]?.pricePence ?? null
  }, [sortedQuotes])

  const scrollToQuoteForm = useCallback(() => {
    document.getElementById('task-quote')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [])

  const scrollToOwnerPerformance = useCallback(() => {
    document.getElementById('owner-task-performance')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [])

  async function onCancelTask() {
    if (!task) return
    setCancelError(null)
    const ok = window.confirm(
      'Cancel this task? Professionals will no longer be able to send quotes.',
    )
    if (!ok) return
    try {
      const res = await cancelTask({ variables: { taskId: task.id } })
      if (!res.data?.cancelTask?.id) {
        throw new Error('Could not cancel this task.')
      }
      await refetch()
    } catch (err: unknown) {
      setCancelError(
        getFriendlyErrorMessage(err, 'Could not cancel this task.'),
      )
    }
  }

  async function onSubmitQuote() {
    setQuoteError(null)
    setQuoteSuccess(null)

    if (!task) {
      setQuoteError('Task details are not loaded yet.')
      return
    }

    if (!getAuthToken()) {
      setQuoteError('Please log in before submitting a quote.')
      router.push(
        `/login?next=${encodeURIComponent(`/task/${task.id}#task-quote`)}`,
      )
      return
    }

    if (!workerOnboardingDone && !myQuote) {
      setQuoteError('Create a worker profile before submitting quotes.')
      router.push('/dashboard/worker/register')
      return
    }

    try {
      const res = await addQuote({
        variables: {
          input: {
            taskId: task.id,
            pricePence: Number(pricePence) || 0,
            message: message || undefined,
          },
        },
      })
      if (!res.data?.addQuote?.id) {
        throw new Error('Quote submission failed. Please try again.')
      }
      setQuoteSuccess('Quote submitted successfully.')
      void refetch()
    } catch (err: unknown) {
      setQuoteError(getFriendlyErrorMessage(err, 'Quote submission failed.'))
    }
  }

  async function onAcceptQuote(quoteId: string) {
    if (!task) return
    setAcceptError(null)
    setAcceptingQuoteId(quoteId)
    try {
      const res = await acceptQuote({
        variables: { quoteId },
      })
      if (!res.data?.acceptQuote?.id) {
        throw new Error('Could not accept this quote.')
      }
      await refetch()
    } catch (err: unknown) {
      setAcceptError(
        getFriendlyErrorMessage(err, 'Could not accept this quote.'),
      )
    } finally {
      setAcceptingQuoteId(null)
    }
  }

  const canAcceptQuotes = Boolean(
    isOwner && task && task.status === TaskStatus.Open,
  )
  const isAssignedWorker = Boolean(me && task && task.workerUserId === me.id)
  const canAccessWorkerTools = Boolean(
    workerOnboardingDone || myQuote || isAssignedWorker,
  )

  const introSubtitle = useMemo(() => {
    if (!taskId) return null
    if (loading) return 'Fetching task information…'
    if (error) return null
    if (!task) {
      return 'This task could not be found or may have been removed.'
    }
    if (isOwner) {
      return null
    }
    return 'Review the scope, budget, photos, and availability before you send a quote.'
  }, [taskId, loading, error, task, isOwner])

  function visitorMainColumn(t: TaskDetailRecord) {
    return (
      <Stack gap={{ base: 6, lg: 8 }}>
        <TaskDetailHero
          task={t}
          statusBadgeLabel={taskStatusBadgeLabel(t.status)}
          budgetViewer="visitor"
          viewerUserId={me?.id ?? null}
        />
        <TaskDetailPhotoGrid task={t} />
        <TaskDetailDescriptionCard task={t} />
        <TaskDetailPreferredAvailability task={t} />
      </Stack>
    )
  }

  function ownerMainColumn(t: TaskDetailRecord) {
    return (
      <Stack gap={{ base: 6, lg: 8 }}>
        <TaskDetailOwnerQuickInfo task={t} />
        <TaskDetailPhotoGrid task={t} sectionTitle="SITE PHOTOS" />
        <TaskDetailDescriptionCard task={t} />
      </Stack>
    )
  }

  if (!taskId) {
    return (
      <Box bg="surface" color="fg" minH="100vh">
        <Stack gap={0}>
          <Section bg="surfaceContainerLow" py={{ base: 8, md: 10 }}>
            <Stack gap={6} maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
              <Link
                as={NextLink}
                href="/"
                fontWeight={600}
                color="primary.700"
                _hover={{ textDecoration: 'none' }}
              >
                ← Back to tasks
              </Link>
              <Text color="muted">No task ID provided.</Text>
            </Stack>
          </Section>
          <Footer />
        </Stack>
      </Box>
    )
  }

  return (
    <Box bg="surface" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section bg="surfaceContainerLow" py={{ base: 8, md: 10 }}>
          <Stack gap={8} maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
            {isOwner && task ? (
              <TaskDetailOwnerToolbar
                task={task}
                openStatusLabel={taskStatusBadgeLabel(task.status)}
                quotesReceivedLabel={`${task.quotes.length} quote${task.quotes.length === 1 ? '' : 's'} received`}
                onViewStats={scrollToOwnerPerformance}
                onCancelTask={() => void onCancelTask()}
                cancelLoading={cancelingTask}
                cancelDisabled={
                  task.status === TaskStatus.Cancelled ||
                  task.status === TaskStatus.Completed ||
                  task.status === TaskStatus.Confirmed
                }
              />
            ) : (
              <Stack gap={2}>
                <Link
                  as={NextLink}
                  href="/"
                  fontWeight={600}
                  color="primary.700"
                  _hover={{ textDecoration: 'none' }}
                >
                  ← Back to tasks
                </Link>
                <Heading size={{ base: '2xl', md: '3xl' }} fontWeight={800}>
                  {task?.title ?? 'Task details'}
                </Heading>
                {introSubtitle ? (
                  <Text color="muted" fontSize="sm">
                    {introSubtitle}
                  </Text>
                ) : null}
              </Stack>
            )}

            {loading ? null : error ? (
              <Text color="red.400" fontSize="sm">
                {error.message}
              </Text>
            ) : !task ? null : (
              <Stack gap={{ base: 8, lg: 10 }} w="full">
                <Grid
                  w="full"
                  templateColumns={{
                    base: '1fr',
                    lg: 'minmax(0, 1fr) minmax(300px, 380px)',
                  }}
                  gap={{ base: 8, lg: 10 }}
                  alignItems="start"
                >
                  <Box
                    gridColumn={{ base: '1', lg: '1' }}
                    order={{ base: 2, lg: 1 }}
                  >
                    {isOwner ? ownerMainColumn(task) : visitorMainColumn(task)}
                  </Box>
                  {isOwner ? (
                    <Box
                      gridColumn={{ base: '1', lg: '2' }}
                      order={{ base: 1, lg: 2 }}
                      position={{ base: 'static', lg: 'sticky' }}
                      top={{ lg: 4 }}
                      alignSelf="start"
                      w="full"
                    >
                      <Stack gap={4}>
                        <TaskDetailApproximateLocation
                          task={task}
                          variant="owner"
                        />
                        <TaskDetailOwnerPerformanceCard task={task} />
                        <TaskDetailOwnerHelpCard />
                      </Stack>
                    </Box>
                  ) : (
                    <Box
                      gridColumn={{ base: '1', lg: '2' }}
                      order={{ base: 1, lg: 2 }}
                      position={{ base: 'static', lg: 'sticky' }}
                      top={{ lg: 4 }}
                      alignSelf="start"
                      w="full"
                    >
                      <Stack gap={4}>
                        <TaskDetailWorkerCtas
                          onScrollToQuoteForm={scrollToQuoteForm}
                        />
                        <TaskDetailPostedMeta createdAt={task.createdAt} />
                        <TaskDetailApproximateLocation task={task} />
                        <TaskDetailWorkerQuotePanel
                          myQuote={myQuote}
                          canAccessWorkerTools={canAccessWorkerTools}
                          mePresent={Boolean(me)}
                          pricePence={pricePence}
                          message={message}
                          onPriceChange={setPricePence}
                          onMessageChange={setMessage}
                          onSubmitQuote={onSubmitQuote}
                          quoting={quoting}
                          quoteError={quoteError}
                          quoteSuccess={quoteSuccess}
                        />
                      </Stack>
                    </Box>
                  )}
                </Grid>
                {isOwner ? (
                  <TaskDetailOwnerQuotesSection
                    task={task}
                    sortedQuotes={sortedQuotes}
                    lowestPricePence={lowestPricePence}
                    canAcceptQuotes={canAcceptQuotes}
                    acceptError={acceptError}
                    cancelError={cancelError}
                    acceptingQuoteId={acceptingQuoteId}
                    onAcceptQuote={onAcceptQuote}
                    formatPounds={formatPounds}
                    workerAvatarLabel={workerAvatarLabel}
                  />
                ) : null}
              </Stack>
            )}
          </Stack>
        </Section>
        <Footer />
      </Stack>
    </Box>
  )
}
