'use client'

import { useQuery } from '@apollo/client/react'
import { HStack, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useState } from 'react'

import { TASKS_QUERY } from '@/graphql/jobs'
import { Badge } from '@/ui/Badge/Badge'
import { Button } from '@/ui/Button/Button'
import type { TasksQuery, TasksQueryVariables } from '@codegen/schema'
import { GlassCard } from '../../ui/Card/GlassCard'

export type TaskBoardProps = {
  title?: string
}

const PAGE_SIZE = 6

function formatBudget(offers: { pricePence: number }[]) {
  if (offers.length === 0) return 'No offers yet'
  const prices = offers.map((o) => o.pricePence)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  if (min === max) return `£${(min / 100).toFixed(0)}`
  return `£${(min / 100).toFixed(0)}–£${(max / 100).toFixed(0)}`
}

export function TaskBoard({ title = 'Latest tasks' }: TaskBoardProps) {
  const [page, setPage] = useState(0)
  const offset = page * PAGE_SIZE
  const { data, loading, error } = useQuery<TasksQuery, TasksQueryVariables>(
    TASKS_QUERY,
    {
      variables: {
        limit: PAGE_SIZE,
        offset,
      },
      notifyOnNetworkStatusChange: true,
    },
  )
  const tasks = data?.tasks ?? []
  const hasPreviousPage = page > 0
  const hasNextPage = tasks.length === PAGE_SIZE

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

        {loading && !data ? (
          <Text color="muted">Loading tasks…</Text>
        ) : error ? (
          <Text color="red.400" fontSize="sm">
            {error.message}
          </Text>
        ) : tasks.length === 0 ? (
          <Text color="muted">
            {page === 0
              ? 'No tasks posted yet. Be the first to post one.'
              : 'No more tasks available on this page.'}
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
            {tasks.map((task) => (
              <GlassCard key={task.id} p={5}>
                <Stack gap={3}>
                  <HStack justify="space-between">
                    <Heading size="sm">{task.title}</Heading>
                    <Badge bg="mustard.200" color="black" px={2}>
                      {formatBudget(task.offers)}
                    </Badge>
                  </HStack>
                  <Text color="muted">{task.description}</Text>
                  <HStack gap={2} flexWrap="wrap">
                    {task.location && (
                      <Badge variant="outline">{task.location}</Badge>
                    )}
                    {task.offers.length > 0 && (
                      <Badge variant="outline">
                        {task.offers.length} offer
                        {task.offers.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </HStack>
                  <HStack gap={3}>
                    <Button
                      as={NextLink}
                      href={`/task/${task.id}#offer`}
                      size="sm"
                      background="linkBlue.600"
                      color="white"
                    >
                      Make offer
                    </Button>
                    <Button
                      as={NextLink}
                      href={`/task/${task.id}`}
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

        {!error && (
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <Text color="muted" fontSize="sm">
              Page {page + 1}
            </Text>
            <HStack gap={2}>
              <Button
                size="sm"
                variant="outline"
                borderColor="border"
                disabled={!hasPreviousPage || loading}
                onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 0))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                borderColor="border"
                disabled={!hasNextPage || loading}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Next
              </Button>
            </HStack>
          </HStack>
        )}
      </Stack>
    </GlassCard>
  )
}
