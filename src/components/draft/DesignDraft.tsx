'use client'

import { gql } from '@apollo/client/core'
import { useMutation } from '@apollo/client/react'
import {
  Box,
  Container,
  Grid,
  Heading,
  Stack,
  Text,
  Badge,
  HStack,
  SimpleGrid,
} from '@chakra-ui/react'
import { useState } from 'react'

import { GlassCard, TextInput, UiButton } from '@/components/ui'

const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
    }
  }
`

const ADD_OFFER = gql`
  mutation AddOffer($input: AddOfferInput!) {
    addOffer(input: $input) {
      id
      status
    }
  }
`

const ACCEPT_OFFER = gql`
  mutation AcceptOffer($input: AcceptOfferInput!) {
    acceptOffer(input: $input) {
      id
      status
    }
  }
`

export function DesignDraft() {
  const [title, setTitle] = useState('Fix a leaky tap')
  const [location, setLocation] = useState('Hackney, London')
  const [budgetMin, setBudgetMin] = useState('3000')
  const [budgetMax, setBudgetMax] = useState('6000')
  const [offerTaskId, setOfferTaskId] = useState('')
  const [offerPrice, setOfferPrice] = useState('4500')
  const [acceptOfferId, setAcceptOfferId] = useState('')

  const [createTask, { loading: creating }] = useMutation(CREATE_TASK)
  const [addOffer, { loading: offering }] = useMutation(ADD_OFFER)
  const [acceptOffer, { loading: accepting }] = useMutation(ACCEPT_OFFER)

  return (
    <Box bg="bg" color="fg" minH="100vh" py={{ base: 10, md: 16 }}>
      <Container maxW="6xl">
        <Stack gap={10}>
          <HStack justify="space-between" align="center">
            <HStack gap={3}>
              <Box
                w="36px"
                h="36px"
                borderRadius="12px"
                bg="mustard.400"
              />
              <Heading size="md">HandyBox</Heading>
            </HStack>
            <HStack gap={3}>
              <UiButton variant="ghost">Log in</UiButton>
              <UiButton background="linkBlue.600" color="white">
                Post a job
              </UiButton>
            </HStack>
          </HStack>

          <Grid
            templateColumns={{ base: '1fr', md: '1.1fr 0.9fr' }}
            gap={8}
            alignItems="center"
          >
            <Stack gap={5}>
              <Badge
                alignSelf="flex-start"
                bg="mustard.200"
                color="black"
                px={3}
                py={1}
                borderRadius="999px"
                fontWeight={600}
              >
                Local trades, sorted
              </Badge>
              <Heading size={{ base: '2xl', md: '3xl' }}>
                Book trusted local handymen in minutes.
              </Heading>
              <Text color="muted" fontSize="lg">
                Post a job, get offers, and book a vetted handyman. HandyBox keeps
                your job details, messages, and updates in one place.
              </Text>
              <HStack gap={3} flexWrap="wrap">
                <UiButton background="linkBlue.600" color="white">
                  Get started
                </UiButton>
                <UiButton variant="outline" borderColor="border">
                  Browse tasks
                </UiButton>
              </HStack>
            </Stack>

            <GlassCard p={6}>
              <Stack gap={4}>
                <Heading size="md">Post a quick task</Heading>
                <TextInput placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <TextInput placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
                <HStack gap={3}>
                  <TextInput
                    placeholder="Min budget (pence)"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                  />
                  <TextInput
                    placeholder="Max budget (pence)"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                  />
                </HStack>
                <UiButton
                  background="mustard.500"
                  color="black"
                  loading={creating}
                  onClick={() =>
                    createTask({
                      variables: {
                        input: {
                          title,
                          description: 'Tap leaking under the sink',
                          location,
                          category: 'Plumbing',
                          skills: ['Plumbing'],
                          budgetMinPence: Number(budgetMin) || null,
                          budgetMaxPence: Number(budgetMax) || null,
                          photos: [],
                        },
                      },
                    })
                  }
                >
                  Submit task
                </UiButton>
              </Stack>
            </GlassCard>
          </Grid>

          <GlassCard p={6}>
            <Stack gap={6}>
              <HStack justify="space-between">
                <Heading size="md">Task board</Heading>
                <HStack gap={2} flexWrap="wrap">
                  <Badge bg="mustard.200" color="black" px={2} py={1} borderRadius="999px">
                    New
                  </Badge>
                  <Badge variant="outline">Plumbing</Badge>
                  <Badge variant="outline">Electrical</Badge>
                  <Badge variant="outline">Assembly</Badge>
                </HStack>
              </HStack>

              <HStack gap={3} flexWrap="wrap">
                <TextInput placeholder="Category" />
                <TextInput placeholder="Skill needed" />
                <TextInput placeholder="Min £" />
                <TextInput placeholder="Max £" />
                <UiButton variant="outline" borderColor="border">
                  Filter
                </UiButton>
              </HStack>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                {[1, 2, 3, 4].map((item) => (
                  <GlassCard key={item} p={5}>
                    <Stack gap={3}>
                      <HStack justify="space-between">
                        <Heading size="sm">Mount a 55&quot; TV</Heading>
                        <Badge bg="mustard.200" color="black" px={2} py={1} borderRadius="999px">
                          £45–£75
                        </Badge>
                      </HStack>
                      <Text color="muted">
                        Need a wall mount installed with cable tidy. Prefer weekend.
                      </Text>
                      <HStack gap={2} flexWrap="wrap">
                        <Badge variant="outline">Assembly</Badge>
                        <Badge variant="outline">Mounting</Badge>
                        <Badge variant="outline">Hackney</Badge>
                      </HStack>
                      <HStack gap={3}>
                        <UiButton size="sm" background="linkBlue.600" color="white">
                          Make offer
                        </UiButton>
                        <UiButton size="sm" variant="outline" borderColor="border">
                          View
                        </UiButton>
                      </HStack>
                    </Stack>
                  </GlassCard>
                ))}
              </SimpleGrid>
            </Stack>
          </GlassCard>

          <GlassCard p={6}>
            <Stack gap={4}>
              <Heading size="md">Worker actions</Heading>
              <Text color="muted">
                Demo actions wired to the backend mutations. Use real IDs after creating tasks.
              </Text>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <Stack gap={3}>
                  <TextInput
                    placeholder="Task ID for offer"
                    value={offerTaskId}
                    onChange={(e) => setOfferTaskId(e.target.value)}
                  />
                  <TextInput
                    placeholder="Offer price (pence)"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                  />
                  <UiButton
                    size="sm"
                    background="linkBlue.600"
                    color="white"
                    loading={offering}
                    onClick={() =>
                      addOffer({
                        variables: {
                          input: {
                            taskId: offerTaskId,
                            pricePence: Number(offerPrice) || 0,
                            message: 'Can do this tomorrow afternoon',
                          },
                        },
                      })
                    }
                  >
                    Submit offer
                  </UiButton>
                </Stack>
                <Stack gap={3}>
                  <TextInput
                    placeholder="Offer ID to accept"
                    value={acceptOfferId}
                    onChange={(e) => setAcceptOfferId(e.target.value)}
                  />
                  <UiButton
                    size="sm"
                    background="mustard.500"
                    color="black"
                    loading={accepting}
                    onClick={() =>
                      acceptOffer({
                        variables: {
                          input: {
                            offerId: acceptOfferId,
                            paymentMethod: 'CARD',
                          },
                        },
                      })
                    }
                  >
                    Accept offer
                  </UiButton>
                </Stack>
              </Grid>
              <Box borderBottomWidth="1px" borderColor="border" />
              <Text color="muted" fontSize="sm">
                Note: these actions require an authenticated user session (JWT in cookie).
              </Text>
            </Stack>
          </GlassCard>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            {[
              {
                title: 'Post in minutes',
                body: 'Share a small job with photos, location, and timing.'
              },
              {
                title: 'Get clear offers',
                body: 'Workers reply with availability and upfront pricing.'
              },
              {
                title: 'Book with confidence',
                body: 'Pick the best fit and keep everything in one thread.'
              }
            ].map((card) => (
              <GlassCard key={card.title} p={5}>
                <Heading size="sm" mb={2}>
                  {card.title}
                </Heading>
                <Text color="muted">{card.body}</Text>
              </GlassCard>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  )
}
