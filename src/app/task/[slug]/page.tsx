'use client'

import { Box, HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useParams } from 'next/navigation'

import { LandingFooter, LandingHeader } from '@/app/components'
import { CREATE_QUOTE, JOB_QUERY } from '@/graphql/jobs'
import { useMutation, useQuery } from '@apollo/client/react'
import type { CreateQuoteMutation, JobQuery } from '@codegen/schema'
import { Badge, Button, Container, GlassCard, TextInput } from '@ui'
import { useState } from 'react'

function Section({
  id,
  children,
  py = { base: 8, md: 12 },
  ...props
}: {
  id?: string
  children: React.ReactNode
  py?: { base: number; md: number }
} & React.ComponentProps<typeof Box>) {
  return (
    <Box as="section" id={id} py={py} {...props}>
      <Container>{children}</Container>
    </Box>
  )
}

export default function TaskDetailPage() {
  const params = useParams<{ slug?: string | string[] }>()
  const slugParam = params?.slug
  const jobId = Array.isArray(slugParam) ? slugParam[0] : (slugParam ?? '')

  const [pricePence, setPricePence] = useState('')
  const [message, setMessage] = useState('')

  const { data, loading, error } = useQuery<JobQuery>(JOB_QUERY, {
    variables: { id: jobId },
    skip: !jobId,
  })
  const [createQuote, { loading: quoting }] =
    useMutation<CreateQuoteMutation>(CREATE_QUOTE)

  const job = data?.job

  if (!jobId) {
    return (
      <Box bg="bg" color="fg" minH="100vh">
        <Stack gap={0}>
          <Section id="header" py={{ base: 6, md: 8 }}>
            <LandingHeader />
          </Section>
          <Section>
            <Link
              as={NextLink}
              href="/tasks"
              fontWeight={600}
              color="linkBlue.700"
              _hover={{ textDecoration: 'none' }}
            >
              ← Back to tasks
            </Link>
            <Text color="muted">No job ID provided.</Text>
          </Section>
          <Section
            id="footer"
            py={{ base: 8, md: 12 }}
            pb={{ base: 12, md: 16 }}
          >
            <LandingFooter />
          </Section>
        </Stack>
      </Box>
    )
  }

  return (
    <Box bg="bg" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section id="header" py={{ base: 6, md: 8 }}>
          <LandingHeader />
        </Section>
        <Section>
          <Stack gap={10}>
            <Stack gap={4}>
              <Link
                as={NextLink}
                href="/tasks"
                fontWeight={600}
                color="linkBlue.700"
                _hover={{ textDecoration: 'none' }}
              >
                ← Back to tasks
              </Link>

              {loading ? (
                <Text color="muted">Loading job…</Text>
              ) : error ? (
                <Text color="red.400" fontSize="sm">
                  {error.message}
                </Text>
              ) : !job ? (
                <Text color="muted">Job not found.</Text>
              ) : (
                <>
                  <Stack gap={3}>
                    <HStack justify="space-between" flexWrap="wrap" gap={3}>
                      <Heading size="lg">{job.title}</Heading>
                      {job.quotes.length > 0 && (
                        <Badge bg="mustard.200" color="black" px={2}>
                          £
                          {(
                            Math.min(...job.quotes.map((q) => q.pricePence)) /
                            100
                          ).toFixed(0)}
                          –£
                          {(
                            Math.max(...job.quotes.map((q) => q.pricePence)) /
                            100
                          ).toFixed(0)}
                        </Badge>
                      )}
                    </HStack>
                    <Text color="muted">{job.description}</Text>
                    {job.location && (
                      <Badge variant="outline">{job.location}</Badge>
                    )}
                  </Stack>

                  <GlassCard p={6}>
                    <Stack gap={4}>
                      <Heading size="md">Job details</Heading>
                      <Text color="muted">{job.description}</Text>
                      <Stack gap={2} fontSize="sm">
                        {job.location && (
                          <Text>
                            <strong>Location:</strong> {job.location}
                          </Text>
                        )}
                        {job.quotes.length > 0 && (
                          <Text>
                            <strong>Quotes:</strong> {job.quotes.length}{' '}
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
                        Share your quote and any message for the client.
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
                          onClick={() =>
                            createQuote({
                              variables: {
                                input: {
                                  jobId: job.id,
                                  pricePence: Number(pricePence) || 0,
                                  message: message || undefined,
                                },
                              },
                            })
                          }
                        >
                          Submit offer
                        </Button>
                      </Stack>
                    </Stack>
                  </GlassCard>
                </>
              )}
            </Stack>
          </Stack>
        </Section>
        <Section id="footer" py={{ base: 8, md: 12 }} pb={{ base: 12, md: 16 }}>
          <LandingFooter />
        </Section>
      </Stack>
    </Box>
  )
}
