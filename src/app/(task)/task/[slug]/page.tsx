'use client'

import {
  formatTaskCategoryLabel,
  formatTaskContactMethodLabel,
  taskPublicLocationLabel,
} from '@/utils/taskLocationDisplay'
import { useMutation, useQuery } from '@apollo/client/react'
import { Box, Grid, HStack, Link, Stack, VStack } from '@chakra-ui/react'
import type { AddOfferMutation, MeQuery, TaskQuery } from '@codegen/schema'
import NextLink from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { ME_QUERY } from '@/graphql/auth'
import { ACCEPT_OFFER_MUTATION, ADD_OFFER, TASK_QUERY } from '@/graphql/tasks'
import { getAuthToken } from '@/utils/auth'
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { getWorkerRegistered } from '@/utils/workerSession'
import {
  Badge,
  Button,
  Footer,
  GlassCard,
  Header,
  Heading,
  IconCalendar,
  IconDocument,
  IconMapPin,
  IconWrench,
  Section,
  Text,
  TextInput,
} from '@ui'
import { TaskOfferCard } from './components/TaskOfferCard'

type AcceptOfferMutationData = {
  acceptOffer?: {
    id: string
    status: string
    selectedOfferId?: string | null
  } | null
}

function formatDateTime(isoDateTime: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDateTime))
}

function formatTimelineStamp(iso: unknown) {
  const d =
    typeof iso === 'string' || typeof iso === 'number'
      ? new Date(iso)
      : iso instanceof Date
        ? iso
        : null
  if (!d || Number.isNaN(d.getTime())) return '—'
  const now = new Date()
  const isSameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  const time = new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
  if (isSameDay) return `Today at ${time}`
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

function formatPaymentMethod(paymentMethod: string) {
  const normalised = paymentMethod.replaceAll('_', ' ').toLowerCase()
  return normalised.charAt(0).toUpperCase() + normalised.slice(1)
}

function formatPounds(pricePence: number) {
  return `£${(pricePence / 100).toFixed(0)}`
}

function normaliseStatus(status: string) {
  return status.replaceAll('_', ' ').toUpperCase()
}

function statusBannerLabel(status: string, offerCount: number) {
  const s = status.toUpperCase()
  if (s === 'OPEN' || s === 'POSTED' || s === 'PUBLISHED') {
    const n = offerCount
    return `OPEN — ${n} OFFER${n === 1 ? '' : 'S'} RECEIVED`
  }
  return normaliseStatus(status)
}

function workerAvatarLabel(workerUserId: string) {
  const alnum = workerUserId.replace(/[^a-zA-Z0-9]/g, '')
  if (alnum.length >= 2) return alnum.slice(0, 2)
  if (alnum.length === 1) return `${alnum}P`
  return 'PR'
}

function categoryGradient(category: string): string {
  const key = category.toLowerCase()
  if (key.includes('plumb'))
    return 'linear-gradient(135deg, #1A56DB 0%, #003fb1 100%)'
  if (key.includes('electr'))
    return 'linear-gradient(135deg, #5f88e8 0%, #1A56DB 100%)'
  if (key.includes('carpent') || key.includes('wood'))
    return 'linear-gradient(135deg, #cb7f08 0%, #855300 100%)'
  if (key.includes('hvac') || key.includes('heat'))
    return 'linear-gradient(135deg, #059669 0%, #047857 100%)'
  if (key.includes('garden'))
    return 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)'
  return 'linear-gradient(135deg, #dfe8f7 0%, #b5ceff 100%)'
}

export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams<{ slug?: string | string[] }>()
  const slugParam = params?.slug
  const taskId = Array.isArray(slugParam) ? slugParam[0] : (slugParam ?? '')

  const [pricePence, setPricePence] = useState('')
  const [message, setMessage] = useState('')
  const [offerError, setOfferError] = useState<string | null>(null)
  const [offerSuccess, setOfferSuccess] = useState<string | null>(null)
  const [acceptError, setAcceptError] = useState<string | null>(null)
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null)
  const [workerProfileEnabled, setWorkerProfileEnabled] = useState(false)

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

  const [addOffer, { loading: quoting }] =
    useMutation<AddOfferMutation>(ADD_OFFER)

  const [acceptOffer] = useMutation<AcceptOfferMutationData>(
    ACCEPT_OFFER_MUTATION,
  )

  const task = data?.task

  const isOwner = Boolean(me && task && me.id === task.createdByUserId)
  const myOffer = useMemo(() => {
    if (!me || !task) return null
    return task.offers.find((o) => o.workerUserId === me.id) ?? null
  }, [me, task])

  useEffect(() => {
    if (!me) {
      setWorkerProfileEnabled(false)
      return
    }

    setWorkerProfileEnabled(getWorkerRegistered(me.id) || Boolean(myOffer))
  }, [me, myOffer])

  const sortedOffers = useMemo(() => {
    if (!task) return []
    return [...task.offers].sort((a, b) => a.pricePence - b.pricePence)
  }, [task])

  const lowestPricePence = useMemo(() => {
    if (sortedOffers.length === 0) return null
    return sortedOffers[0]?.pricePence ?? null
  }, [sortedOffers])

  async function onSubmitOffer() {
    setOfferError(null)
    setOfferSuccess(null)

    if (!task) {
      setOfferError('Task details are not loaded yet.')
      return
    }

    if (!getAuthToken()) {
      setOfferError('Please log in before submitting an offer.')
      router.push(`/login?next=${encodeURIComponent(`/task/${task.id}#offer`)}`)
      return
    }

    if (!workerProfileEnabled && !myOffer) {
      setOfferError('Create a worker profile before submitting quotes.')
      router.push('/dashboard/worker/register')
      return
    }

    try {
      const res = await addOffer({
        variables: {
          input: {
            taskId: task.id,
            pricePence: Number(pricePence) || 0,
            message: message || undefined,
          },
        },
      })
      if (!res.data?.addOffer?.id) {
        throw new Error('Offer submission failed. Please try again.')
      }
      setOfferSuccess('Offer submitted successfully.')
      void refetch()
    } catch (err: unknown) {
      setOfferError(getFriendlyErrorMessage(err, 'Offer submission failed.'))
    }
  }

  async function onAcceptOffer(offerId: string) {
    if (!task) return
    setAcceptError(null)
    setAcceptingOfferId(offerId)
    try {
      const res = await acceptOffer({
        variables: { offerId },
      })
      if (!res.data?.acceptOffer?.id) {
        throw new Error('Could not accept this offer.')
      }
      await refetch()
    } catch (err: unknown) {
      setAcceptError(
        getFriendlyErrorMessage(err, 'Could not accept this offer.'),
      )
    } finally {
      setAcceptingOfferId(null)
    }
  }

  const canAcceptOffers =
    isOwner &&
    task &&
    ['OPEN', 'POSTED', 'PUBLISHED'].includes(task.status.toUpperCase())
  const canAccessWorkerTools = Boolean(workerProfileEnabled || myOffer)

  if (!taskId) {
    return (
      <Box bg="bg" color="fg" minH="100vh">
        <Stack gap={0}>
          <Section id="header" py={{ base: 6, md: 8 }}>
            <Header activeItem="home" />
          </Section>
          <Section>
            <Link
              as={NextLink}
              href="/"
              fontWeight={600}
              color="primary.700"
              _hover={{ textDecoration: 'none' }}
            >
              ← Back to Job Board
            </Link>
            <Text color="muted">No task ID provided.</Text>
          </Section>
          <Footer />
        </Stack>
      </Box>
    )
  }

  return (
    <Box bg="bg" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section id="header" py={{ base: 6, md: 8 }}>
          <Header activeItem="home" />
        </Section>
        <Box as="section" py={{ base: 8, md: 10 }}>
          <Box maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
            <Stack gap={10}>
              <Stack gap={4}>
                <Link
                  as={NextLink}
                  href="/"
                  fontWeight={600}
                  fontSize="sm"
                  color="primary.600"
                  _hover={{ color: 'primary.700', textDecoration: 'none' }}
                >
                  ← Back to Job Board
                </Link>

                {loading ? (
                  <Text color="muted">Loading task…</Text>
                ) : error ? (
                  <Text color="red.400" fontSize="sm">
                    {error.message}
                  </Text>
                ) : !task ? (
                  <Text color="muted">Task not found.</Text>
                ) : (
                  <Grid
                    templateColumns={{
                      base: '1fr',
                      xl: 'minmax(0, 1fr) 400px',
                    }}
                    gap={{ base: 10, xl: 10 }}
                    alignItems="flex-start"
                  >
                    <Stack gap={8}>
                      <Stack gap={4}>
                        <Box
                          as="span"
                          display="inline-flex"
                          alignSelf="flex-start"
                          alignItems="center"
                          gap={2}
                          px={4}
                          py={1.5}
                          borderRadius="full"
                          bg="#F2994A"
                          color="white"
                          fontSize="11px"
                          fontWeight={800}
                          letterSpacing="0.08em"
                        >
                          <Box
                            as="span"
                            w="6px"
                            h="6px"
                            borderRadius="full"
                            bg="white"
                            aria-hidden
                          />
                          {statusBannerLabel(task.status, task.offers.length)}
                        </Box>
                        <Heading
                          size="xl"
                          color="ink.900"
                          lineHeight="shorter"
                          fontWeight={800}
                        >
                          {task.title}
                        </Heading>
                        <HStack gap={{ base: 4, md: 8 }} flexWrap="wrap">
                          <HStack gap={2} color="muted">
                            <IconWrench />
                            <Text fontSize="sm" fontWeight={600} color="fg">
                              {formatTaskCategoryLabel(task.category)}
                            </Text>
                          </HStack>
                          {taskPublicLocationLabel(task) ? (
                            <HStack gap={2} color="muted">
                              <IconMapPin />
                              <Text fontSize="sm" fontWeight={600} color="fg">
                                {taskPublicLocationLabel(task)}
                              </Text>
                            </HStack>
                          ) : null}
                          <HStack gap={2} color="muted">
                            <IconCalendar />
                            <Text fontSize="sm" fontWeight={600} color="fg">
                              {formatRelativeTime(task.createdAt)}
                            </Text>
                          </HStack>
                        </HStack>
                      </Stack>

                      <GlassCard p={{ base: 5, md: 6 }} borderColor="border">
                        <Stack gap={4}>
                          <HStack gap={2}>
                            <IconDocument color="primary.600" />
                            <Heading size="md">Job description</Heading>
                          </HStack>
                          <Text color="muted" lineHeight="tall">
                            {task.description}
                          </Text>
                          <Grid
                            templateColumns={{
                              base: '1fr',
                              sm: 'repeat(2, minmax(0, 1fr))',
                            }}
                            gap={3}
                          >
                            {task.dateTime ? (
                              <Box
                                borderRadius="lg"
                                bg="primary.50"
                                px={4}
                                py={3}
                                borderWidth="1px"
                                borderColor="primary.100"
                              >
                                <Text
                                  fontSize="10px"
                                  fontWeight={800}
                                  letterSpacing="0.1em"
                                  color="primary.700"
                                  mb={1}
                                >
                                  PREFERRED WINDOW
                                </Text>
                                <Text fontWeight={700} color="fg">
                                  {formatDateTime(task.dateTime)}
                                </Text>
                              </Box>
                            ) : null}
                            {task.priceOfferPence != null &&
                            task.priceOfferPence > 0 ? (
                              <Box
                                borderRadius="lg"
                                bg="primary.50"
                                px={4}
                                py={3}
                                borderWidth="1px"
                                borderColor="primary.100"
                              >
                                <Text
                                  fontSize="10px"
                                  fontWeight={800}
                                  letterSpacing="0.1em"
                                  color="primary.700"
                                  mb={1}
                                >
                                  CLIENT BUDGET
                                </Text>
                                <Text fontWeight={700} color="fg">
                                  {formatPounds(task.priceOfferPence)}
                                </Text>
                              </Box>
                            ) : null}
                          </Grid>
                          <Stack
                            gap={2}
                            fontSize="sm"
                            pt={2}
                            borderTopWidth="1px"
                            borderColor="border"
                          >
                            {task.paymentMethod ? (
                              <Text color="muted">
                                <Text as="span" fontWeight={600} color="fg">
                                  Payment:{' '}
                                </Text>
                                {formatPaymentMethod(task.paymentMethod)}
                              </Text>
                            ) : null}
                            {task.contactMethod ? (
                              <Text color="muted">
                                <Text as="span" fontWeight={600} color="fg">
                                  Contact:{' '}
                                </Text>
                                {formatTaskContactMethodLabel(
                                  task.contactMethod,
                                )}
                              </Text>
                            ) : null}
                          </Stack>
                        </Stack>
                      </GlassCard>

                      <Stack gap={3}>
                        <Heading size="md">Job photos</Heading>
                        <Grid
                          templateColumns={{ base: '1fr', md: '1.4fr 1fr' }}
                          templateRows={{
                            base: 'repeat(3, minmax(120px, 160px))',
                            md: 'repeat(2, minmax(100px, 140px))',
                          }}
                          gap={3}
                        >
                          <Box
                            gridRow={{ base: 'auto', md: '1 / -1' }}
                            borderRadius="xl"
                            minH={{ base: '160px', md: 'auto' }}
                            bg={categoryGradient(task.category)}
                            opacity={0.85}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            fontWeight={800}
                            fontSize="sm"
                            letterSpacing="0.06em"
                            textAlign="center"
                            px={4}
                          >
                            Photo preview unavailable for this task
                          </Box>
                          <Box
                            borderRadius="xl"
                            bg="surfaceContainerLow"
                            borderWidth="1px"
                            borderColor="border"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="muted"
                            fontSize="sm"
                            fontWeight={600}
                          >
                            Attachments are not shown on the web yet
                          </Box>
                          <Box
                            borderRadius="xl"
                            bg="surfaceContainerHigh"
                            borderWidth="1px"
                            borderColor="border"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="muted"
                            fontSize="sm"
                            fontWeight={600}
                          >
                            More photos on mobile soon
                          </Box>
                        </Grid>
                      </Stack>

                      <Box
                        borderRadius="xl"
                        bg="surfaceContainerLow"
                        px={{ base: 5, md: 6 }}
                        py={5}
                        borderWidth="1px"
                        borderColor="border"
                      >
                        <Heading size="md" mb={5}>
                          Job timeline
                        </Heading>
                        <Stack gap={0} position="relative">
                          <HStack align="flex-start" gap={4} pb={6}>
                            <VStack gap={0} flexShrink={0} align="center">
                              <Box
                                boxSize="36px"
                                borderRadius="full"
                                bg="primary.600"
                                color="white"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize="sm"
                                fontWeight={800}
                              >
                                ✓
                              </Box>
                              <Box
                                flex={1}
                                w="2px"
                                minH="32px"
                                bg={
                                  task.offers.length > 0
                                    ? '#F2994A'
                                    : 'outlineVariant'
                                }
                                borderRadius="full"
                                mt={1}
                              />
                            </VStack>
                            <Stack gap={0.5} pt={1}>
                              <Text fontWeight={700}>Job posted</Text>
                              <Text fontSize="sm" color="muted">
                                {formatTimelineStamp(task.createdAt)}
                              </Text>
                            </Stack>
                          </HStack>
                          <HStack align="flex-start" gap={4}>
                            <Box
                              flexShrink={0}
                              boxSize="36px"
                              borderRadius="full"
                              bg="#F2994A"
                              color="white"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              aria-hidden
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                fill="none"
                                aria-hidden
                              >
                                <title>Offers stage</title>
                                <path
                                  d="M7 18.5 3 21v-3.5A4 4 0 0 1 5 9a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4 4 4 0 0 1-4 4H9l-2 1.5Z"
                                  stroke="currentColor"
                                  strokeWidth="1.75"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </Box>
                            <Stack gap={0.5} pt={1}>
                              <Text fontWeight={700}>
                                {task.offers.length > 0
                                  ? 'Reviewing offers'
                                  : 'Waiting for offers'}
                              </Text>
                              <Text fontSize="sm" color="muted">
                                {task.offers.length > 0
                                  ? `${task.offers.length} professional${task.offers.length === 1 ? '' : 's'} interested`
                                  : 'Share this task to attract quotes faster.'}
                              </Text>
                            </Stack>
                          </HStack>
                        </Stack>
                      </Box>

                      {!isOwner ? (
                        <Stack gap={6} id="offer">
                          {myOffer ? (
                            <GlassCard p={6}>
                              <Stack gap={3}>
                                <Heading size="md">Your offer</Heading>
                                <Text color="muted">
                                  You submitted{' '}
                                  {formatPounds(myOffer.pricePence)}
                                  {myOffer.message
                                    ? ` — “${myOffer.message}”`
                                    : '.'}
                                </Text>
                                <Badge
                                  bg="surfaceContainerLow"
                                  color="fg"
                                  w="fit-content"
                                >
                                  Status: {normaliseStatus(myOffer.status)}
                                </Badge>
                              </Stack>
                            </GlassCard>
                          ) : me && !canAccessWorkerTools ? (
                            <GlassCard
                              p={6}
                              bg="primary.50"
                              borderColor="primary.100"
                            >
                              <Stack gap={4}>
                                <Heading size="md">
                                  Become a worker to send a quote
                                </Heading>
                                <Text color="muted">
                                  Worker features are blocked by default. Create
                                  your worker profile to unlock quote
                                  submission, earnings, and worker-side task
                                  tools.
                                </Text>
                                <Button
                                  as={NextLink}
                                  href="/dashboard/worker/register"
                                  alignSelf="flex-start"
                                >
                                  Create worker profile
                                </Button>
                              </Stack>
                            </GlassCard>
                          ) : (
                            <GlassCard p={6}>
                              <Stack gap={4}>
                                <Heading size="md">Make an offer</Heading>
                                <Text color="muted">
                                  Share your price and any message for the
                                  client.
                                </Text>
                                <Stack gap={3}>
                                  <TextInput
                                    placeholder="Offer price (pence)"
                                    value={pricePence}
                                    onChange={(e) =>
                                      setPricePence(e.target.value)
                                    }
                                  />
                                  <TextInput
                                    placeholder="Short message to the client"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                  />
                                  <Button
                                    background="linkBlue.600"
                                    color="white"
                                    loading={quoting}
                                    onClick={() => void onSubmitOffer()}
                                  >
                                    Submit offer
                                  </Button>
                                  {offerError ? (
                                    <Text color="red.400" fontSize="sm">
                                      {offerError}
                                    </Text>
                                  ) : null}
                                  {offerSuccess ? (
                                    <Text color="green.600" fontSize="sm">
                                      {offerSuccess}
                                    </Text>
                                  ) : null}
                                </Stack>
                              </Stack>
                            </GlassCard>
                          )}
                        </Stack>
                      ) : null}
                    </Stack>

                    {isOwner ? (
                      <Box
                        position={{ base: 'static', xl: 'sticky' }}
                        top={{ xl: '88px' }}
                        w="full"
                      >
                        <Stack gap={4} id="offers">
                          <HStack justify="space-between" align="center">
                            <Heading size="md">
                              Offers ({task.offers.length})
                            </Heading>
                            {task.offers.length > 3 ? (
                              <Link
                                as={NextLink}
                                href="#offers-list"
                                fontSize="sm"
                                fontWeight={700}
                                color="primary.600"
                                _hover={{ color: 'primary.700' }}
                              >
                                View all
                              </Link>
                            ) : null}
                          </HStack>
                          {acceptError ? (
                            <Text color="red.400" fontSize="sm">
                              {acceptError}
                            </Text>
                          ) : null}
                          {task.offers.length === 0 ? (
                            <GlassCard p={6}>
                              <Text color="muted">
                                No offers yet. Share your task link to get
                                quotes from professionals.
                              </Text>
                            </GlassCard>
                          ) : (
                            <Stack
                              gap={4}
                              id="offers-list"
                              maxH={{ xl: 'calc(100vh - 140px)' }}
                              overflowY={{ xl: 'auto' }}
                              pr={{ xl: 1 }}
                              style={{ scrollbarGutter: 'stable' }}
                            >
                              {sortedOffers.map((offer) => (
                                <TaskOfferCard
                                  key={offer.id}
                                  name="Professional"
                                  avatarLabel={workerAvatarLabel(
                                    offer.workerUserId,
                                  )}
                                  priceLabel={formatPounds(offer.pricePence)}
                                  message={offer.message}
                                  acceptPrimary={
                                    offer.pricePence === lowestPricePence
                                  }
                                  messageHref="/dashboard"
                                  isOwnOffer={false}
                                  onAccept={
                                    canAcceptOffers
                                      ? () => void onAcceptOffer(offer.id)
                                      : undefined
                                  }
                                  acceptLoading={acceptingOfferId === offer.id}
                                />
                              ))}
                            </Stack>
                          )}
                        </Stack>
                      </Box>
                    ) : null}
                  </Grid>
                )}
              </Stack>
            </Stack>
          </Box>
        </Box>
        <Footer />
      </Stack>
    </Box>
  )
}
