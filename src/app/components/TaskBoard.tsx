'use client'

import { useQuery } from '@apollo/client/react'
import { HStack, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { JOBS_QUERY } from '@/graphql/jobs'
import { Badge } from '@/ui/Badge/Badge'
import { Button } from '@/ui/Button/Button'
import type { JobsQuery } from '@codegen/schema'
import { GlassCard } from '../../ui/Card/GlassCard'

export type TaskBoardProps = {
  title?: string
}

function formatBudget(quotes: { pricePence: number }[]) {
  if (quotes.length === 0) return 'No quotes yet'
  const prices = quotes.map((q) => q.pricePence)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  if (min === max) return `£${(min / 100).toFixed(0)}`
  return `£${(min / 100).toFixed(0)}–£${(max / 100).toFixed(0)}`
}

export function TaskBoard({ title = 'Latest jobs' }: TaskBoardProps) {
  const { data, loading, error } = useQuery<JobsQuery>(JOBS_QUERY)
  const jobs = data?.jobs ?? []

  return (
    <GlassCard p={6}>
      <Stack gap={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Heading size="md">{title}</Heading>
          <HStack gap={2} flexWrap="wrap">
            <Badge bg="mustard.200" color="black" px={2}>
              Live
            </Badge>
          </HStack>
        </HStack>

        {loading ? (
          <Text color="muted">Loading jobs…</Text>
        ) : error ? (
          <Text color="red.400" fontSize="sm">
            {error.message}
          </Text>
        ) : jobs.length === 0 ? (
          <Text color="muted">
            No jobs posted yet. Be the first to post one.
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
            {jobs.map((job) => (
              <GlassCard key={job.id} p={5}>
                <Stack gap={3}>
                  <HStack justify="space-between">
                    <Heading size="sm">{job.title}</Heading>
                    <Badge bg="mustard.200" color="black" px={2}>
                      {formatBudget(job.quotes)}
                    </Badge>
                  </HStack>
                  <Text color="muted">{job.description}</Text>
                  <HStack gap={2} flexWrap="wrap">
                    {job.location && (
                      <Badge variant="outline">{job.location}</Badge>
                    )}
                    {job.quotes.length > 0 && (
                      <Badge variant="outline">
                        {job.quotes.length} quote
                        {job.quotes.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </HStack>
                  <HStack gap={3}>
                    <Button
                      as={NextLink}
                      href={`/task/${job.id}#offer`}
                      size="sm"
                      background="linkBlue.600"
                      color="white"
                    >
                      Make offer
                    </Button>
                    <Button
                      as={NextLink}
                      href={`/task/${job.id}`}
                      size="sm"
                      variant="outline"
                      borderColor="border"
                    >
                      View
                    </Button>
                  </HStack>
                </Stack>
              </GlassCard>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </GlassCard>
  )
}
