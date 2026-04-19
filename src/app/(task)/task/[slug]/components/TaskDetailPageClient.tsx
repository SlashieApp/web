'use client'

import {
  Box,
  Container,
  Grid,
  Heading,
  Image,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import { type TaskQuery, TaskStatus } from '@codegen/schema'
import NextLink from 'next/link'
import { useCallback, useMemo } from 'react'

import { formatRelativeTime } from '@/utils/formatRelativeTime'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { Footer } from '@ui'

import {
  TaskDetailProvider,
  useTaskDetail,
} from '../context/TaskDetailProvider'
import { TaskDetailApproximateLocation } from './TaskDetailApproximateLocation'
import { TaskDetailDescriptionCard } from './TaskDetailDescriptionCard'
import { TaskDetailHero } from './TaskDetailHero'
import { TaskDetailOwnerHelpCard } from './TaskDetailOwnerHelpCard'
import { TaskDetailOwnerPerformanceCard } from './TaskDetailOwnerPerformanceCard'
import { TaskDetailOwnerQuickInfo } from './TaskDetailOwnerQuickInfo'
import { TaskDetailOwnerQuotesSection } from './TaskDetailOwnerQuotesSection'
import { TaskDetailOwnerToolbar } from './TaskDetailOwnerToolbar'
import { TaskDetailPhotoGrid } from './TaskDetailPhotoGrid'
import { TaskDetailPostedMeta } from './TaskDetailPostedMeta'
import { TaskDetailPosterSummary } from './TaskDetailPosterSummary'
import { TaskDetailPreferredAvailability } from './TaskDetailPreferredAvailability'
import {
  TaskDetailWorkerCtas,
  TaskDetailWorkerQuotePanel,
} from './TaskDetailWorkerSidebar'
import type { TaskDetailRecord } from './taskDetailUtils'

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

function TaskDetailLayout({ taskId }: { taskId: string }) {
  const {
    task,
    isOwner,
    me,
    isAuthenticated,
    myQuote,
    sortedQuotes,
    lowestPricePence,
    quoteAmountInput,
    quoteMessageInput,
    setQuoteAmountInput,
    setQuoteMessageInput,
    quoteError,
    quoteSuccess,
    acceptError,
    cancelError,
    acceptingQuoteId,
    quoting,
    cancelingTask,
    canAcceptQuotes,
    canAccessWorkerTools,
    onSubmitQuote,
    onAcceptQuote,
    onCancelTask,
  } = useTaskDetail()

  const introSubtitle = useMemo(() => {
    if (!taskId) return null
    if (!task) {
      return 'This task could not be found or may have been removed.'
    }
    if (isOwner) return null
    return 'Review the scope, budget, photos, and availability before you send a quote.'
  }, [isOwner, task, taskId])

  const offersCount = task?.quotes.length ?? 0
  const locationLabel = task ? taskPublicLocationLabel(task) : null
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
        <TaskDetailPosterSummary task={t} />
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

  return (
    <Box bg="bg" color="cardFg" minH="100vh">
      <Stack gap={0}>
        <Box as="section" bg="cardBg" py={{ base: 8, md: 10 }}>
          <Container>
            <Stack gap={8} maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
              <Stack gap={3}>
                <Link
                  as={NextLink}
                  href="/"
                  fontWeight={600}
                  color="primary.700"
                  _hover={{ textDecoration: 'none' }}
                >
                  ← Back to task board
                </Link>
                {task ? (
                  <Box
                    as="span"
                    display="inline-flex"
                    alignSelf="flex-start"
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg="secondary.100"
                    color="secondary.700"
                    fontSize="xs"
                    fontWeight={800}
                    letterSpacing="0.08em"
                  >
                    {taskStatusBadgeLabel(task.status)} - {offersCount} OFFER
                    {offersCount === 1 ? '' : 'S'} RECEIVED
                  </Box>
                ) : null}
                <Heading size={{ base: '2xl', md: '4xl' }} fontWeight={800}>
                  {task?.title ?? 'Task details'}
                </Heading>
                {task ? (
                  <Stack
                    direction={{ base: 'column', md: 'row' }}
                    gap={{ base: 1, md: 4 }}
                    color="formLabelMuted"
                    fontSize="sm"
                  >
                    {locationLabel ? <Text>{locationLabel}</Text> : null}
                    <Text>{formatRelativeTime(task.createdAt)}</Text>
                  </Stack>
                ) : null}
                {introSubtitle ? (
                  <Text color="formLabelMuted" fontSize="sm">
                    {introSubtitle}
                  </Text>
                ) : null}
              </Stack>

              {!task ? (
                <Text color="formLabelMuted">
                  Task details are unavailable.
                </Text>
              ) : (
                <Stack gap={{ base: 8, lg: 10 }} w="full">
                  <Box
                    display={{ base: 'block', md: 'none' }}
                    borderRadius="xl"
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor="cardBorder"
                  >
                    {task.images?.[0] ? (
                      <Image
                        src={task.images[0]}
                        alt={task.title}
                        w="full"
                        h="220px"
                        objectFit="cover"
                      />
                    ) : (
                      <Box h="220px" bg="cardBg" />
                    )}
                  </Box>
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
                      order={{ base: 1, lg: 1 }}
                    >
                      {isOwner
                        ? ownerMainColumn(task)
                        : visitorMainColumn(task)}
                      {isOwner ? (
                        <Box mt={6} display={{ base: 'none', lg: 'block' }}>
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
                        </Box>
                      ) : null}
                    </Box>
                    {isOwner ? (
                      <Box
                        gridColumn={{ base: '1', lg: '2' }}
                        order={{ base: 2, lg: 2 }}
                        position={{ base: 'static', lg: 'sticky' }}
                        top={{ lg: 4 }}
                        alignSelf="start"
                        w="full"
                      >
                        <Stack gap={4}>
                          <TaskDetailOwnerQuotesSection
                            task={task}
                            sortedQuotes={sortedQuotes}
                            lowestPricePence={lowestPricePence}
                            isOwner={isOwner}
                            canAcceptQuotes={canAcceptQuotes}
                            acceptError={acceptError}
                            cancelError={cancelError}
                            acceptingQuoteId={acceptingQuoteId}
                            onAcceptQuote={onAcceptQuote}
                            formatPounds={formatPounds}
                            workerAvatarLabel={workerAvatarLabel}
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
                            isAuthenticated={isAuthenticated}
                            loginHref={`/login?next=${encodeURIComponent(`/task/${task.id}#task-quote`)}`}
                            onScrollToQuoteForm={scrollToQuoteForm}
                          />
                          <TaskDetailPostedMeta createdAt={task.createdAt} />
                          <TaskDetailApproximateLocation task={task} />
                          <TaskDetailWorkerQuotePanel
                            myQuote={myQuote}
                            canAccessWorkerTools={canAccessWorkerTools}
                            mePresent={isAuthenticated}
                            loginHref={`/login?next=${encodeURIComponent(`/task/${task.id}#task-quote`)}`}
                            pricePence={quoteAmountInput}
                            message={quoteMessageInput}
                            onPriceChange={setQuoteAmountInput}
                            onMessageChange={setQuoteMessageInput}
                            onSubmitQuote={onSubmitQuote}
                            quoting={quoting}
                            quoteError={quoteError}
                            quoteSuccess={quoteSuccess}
                          />
                          <TaskDetailOwnerQuotesSection
                            task={task}
                            sortedQuotes={sortedQuotes}
                            lowestPricePence={lowestPricePence}
                            isOwner={isOwner}
                            canAcceptQuotes={canAcceptQuotes}
                            acceptError={acceptError}
                            cancelError={cancelError}
                            acceptingQuoteId={acceptingQuoteId}
                            onAcceptQuote={onAcceptQuote}
                            formatPounds={formatPounds}
                            workerAvatarLabel={workerAvatarLabel}
                          />
                        </Stack>
                      </Box>
                    )}
                  </Grid>
                </Stack>
              )}
            </Stack>
          </Container>
        </Box>
        {!isOwner && task ? (
          <Box
            display={{ base: 'block', md: 'none' }}
            position="sticky"
            bottom={0}
            zIndex={30}
            bg="bg"
            borderTopWidth="1px"
            borderColor="cardBorder"
            px={4}
            py={3}
          >
            <Grid templateColumns="1fr 2fr" gap={3}>
              <Link as={NextLink} href="#" _hover={{ textDecoration: 'none' }}>
                <Box
                  as="button"
                  w="full"
                  h="48px"
                  borderRadius="lg"
                  bg="primary.600"
                  color="white"
                  fontWeight={700}
                >
                  Save
                </Box>
              </Link>
              {isAuthenticated ? (
                <Box
                  as="button"
                  w="full"
                  h="48px"
                  borderRadius="lg"
                  bg="secondary.500"
                  color="white"
                  fontWeight={800}
                  onClick={scrollToQuoteForm}
                >
                  Make a quote
                </Box>
              ) : (
                <Link
                  as={NextLink}
                  href={`/login?next=${encodeURIComponent(`/task/${task.id}#task-quote`)}`}
                  _hover={{ textDecoration: 'none' }}
                >
                  <Box
                    as="span"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    w="full"
                    h="48px"
                    borderRadius="lg"
                    bg="secondary.500"
                    color="white"
                    fontWeight={800}
                  >
                    Log in to quote
                  </Box>
                </Link>
              )}
            </Grid>
          </Box>
        ) : null}
        <Footer />
      </Stack>
    </Box>
  )
}

export function TaskDetailPageClient({
  taskId,
  initialTask,
}: {
  taskId: string
  initialTask: TaskQuery['task'] | null
}) {
  return (
    <TaskDetailProvider taskId={taskId} initialTask={initialTask}>
      <TaskDetailLayout taskId={taskId} />
    </TaskDetailProvider>
  )
}
