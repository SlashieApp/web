'use client'

import { Box, HStack, Link, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ADD_OFFER, TASK_QUERY } from '@/graphql/jobs'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { useMutation, useQuery } from '@apollo/client/react'
import type { AddOfferMutation, TaskQuery } from '@codegen/schema'
import {
  Badge,
  Button,
  GlassCard,
  Header,
  Heading,
  Section,
  SiteFooter,
  SiteHeader,
  Text,
  TextInput,
} from '@ui'
import { useState } from 'react'

function formatDateTime(isoDateTime: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDateTime))
}

function formatPaymentMethod(paymentMethod: string) {
  const normalised = paymentMethod.replaceAll('_', ' ').toLowerCase()
  return normalised.charAt(0).toUpperCase() + normalised.slice(1)
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

  const { data, loading, error } = useQuery<TaskQuery>(TASK_QUERY, {
    variables: { id: taskId },
    skip: !taskId,
  })
  const [addOffer, { loading: quoting }] =
    useMutation<AddOfferMutation>(ADD_OFFER)

  const task = data?.task

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
    } catch (err: unknown) {
      setOfferError(getFriendlyErrorMessage(err, 'Offer submission failed.'))
    }
  }

  if (!taskId) {
    return (
      <Box bg="bg" color="fg" minH="100vh">
        <Stack gap={0}>
          <Section id="header" py={{ base: 6, md: 8 }}>
            <Header>
              <SiteHeader activeItem="my-jobs" />
            </Header>
          </Section>
          <Section>
            <Link
              as={NextLink}
              href="/tasks"
              fontWeight={600}
              color="primary.700"
              _hover={{ textDecoration: 'none' }}
            >
              ← Back to tasks
            </Link>
            <Text color="muted">No task ID provided.</Text>
          </Section>
          <SiteFooter />
        </Stack>
      </Box>
    )
  }

  return (
    <Box bg="bg" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section id="header" py={{ base: 6, md: 8 }}>
          <Header>
            <SiteHeader activeItem="my-jobs" />
          </Header>
        </Section>
        <Section>
          <Stack gap={10}>
            <Stack gap={4}>
              <Link
                as={NextLink}
                href="/tasks"
                fontWeight={600}
                color="primary.700"
                _hover={{ textDecoration: 'none' }}
              >
                ← Back to tasks
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
                <>
                  <Stack gap={3}>
                    <HStack justify="space-between" flexWrap="wrap" gap={3}>
                      <Heading size="lg">{task.title}</Heading>
                      {task.offers.length > 0 && (
                        <Badge px={2}>
                          £
                          {(
                            Math.min(...task.offers.map((o) => o.pricePence)) /
                            100
                          ).toFixed(0)}
                          –£
                          {(
                            Math.max(...task.offers.map((o) => o.pricePence)) /
                            100
                          ).toFixed(0)}
                        </Badge>
                      )}
                    </HStack>
                    <Text color="muted">{task.description}</Text>
                    <HStack gap={2} flexWrap="wrap">
                      {task.location ? (
                        <Badge bg="surfaceContainerLow" color="fg">
                          {task.location}
                        </Badge>
                      ) : null}
                      {task.category ? (
                        <Badge bg="surfaceContainerLow" color="fg">
                          {task.category}
                        </Badge>
                      ) : null}
                      {task.priceOfferPence ? (
                        <Badge px={2}>
                          £{(task.priceOfferPence / 100).toFixed(0)}
                        </Badge>
                      ) : null}
                    </HStack>
                  </Stack>

                  <GlassCard p={6}>
                    <Stack gap={4}>
                      <Heading size="md">Task details</Heading>
                      <Text color="muted">{task.description}</Text>
                      <Stack gap={2} fontSize="sm">
                        {task.location && (
                          <Text>
                            <strong>Location:</strong> {task.location}
                          </Text>
                        )}
                        {task.dateTime && (
                          <Text>
                            <strong>Date & time:</strong>{' '}
                            {formatDateTime(task.dateTime)}
                          </Text>
                        )}
                        {task.category && (
                          <Text>
                            <strong>Category:</strong> {task.category}
                          </Text>
                        )}
                        {task.priceOfferPence && (
                          <Text>
                            <strong>Expected price:</strong> £
                            {(task.priceOfferPence / 100).toFixed(0)}
                          </Text>
                        )}
                        {task.paymentMethod && (
                          <Text>
                            <strong>Payment method:</strong>{' '}
                            {formatPaymentMethod(task.paymentMethod)}
                          </Text>
                        )}
                        {task.contactMethod && (
                          <Text>
                            <strong>Contact method:</strong>{' '}
                            {task.contactMethod}
                          </Text>
                        )}
                        {task.offers.length > 0 && (
                          <Text>
                            <strong>Offers:</strong> {task.offers.length}{' '}
                            received
                          </Text>
                        )}
                      </Stack>
                    </Stack>
                  </GlassCard>

                  <GlassCard p={6} id="offer">
                    <Stack gap={4}>
                      <Heading size="md">Make an offer</Heading>
                      <Text color="muted">
                        Share your price and any message for the client.
                      </Text>
                      <Stack gap={3}>
                        <TextInput
                          placeholder="Offer price (pence)"
                          value={pricePence}
                          onChange={(e) => setPricePence(e.target.value)}
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
                          <Text color="green.400" fontSize="sm">
                            {offerSuccess}
                          </Text>
                        ) : null}
                      </Stack>
                    </Stack>
                  </GlassCard>
                </>
              )}
            </Stack>
          </Stack>
        </Section>
        <SiteFooter />
      </Stack>
    </Box>
  )
}
