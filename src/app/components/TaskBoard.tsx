'use client'

import { useQuery } from '@apollo/client/react'
import { HStack, SimpleGrid, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useState } from 'react'

import { TASKS_QUERY } from '@/graphql/tasks'
import type { TasksQueryData } from '@/graphql/tasks-query.types'
import { Badge, Button, GlassCard, Heading, Text } from '@ui'

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
  const { data, loading, error } = useQuery<TasksQueryData>(TASKS_QUERY, {
    notifyOnNetworkStatusChange: true,
  })
  const allTasks = data?.tasks ?? []
  const tasks = allTasks.slice(offset, offset + PAGE_SIZE)
  const hasPreviousPage = page > 0
  const hasNextPage = offset + PAGE_SIZE < allTasks.length

  return (
    <GlassCard p={6} bg="surfaceContainerLow">
      <Stack gap={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Heading size="md">{title}</Heading>
          <HStack gap={2} flexWrap="wrap">
            <Badge px={2}>Live</Badge>
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
              <GlassCard key={task.id} p={5} bg="surfaceContainerLowest">
                <Stack gap={3}>
                  <HStack justify="space-between">
                    <Heading size="sm">{task.title}</Heading>
                    <Badge px={2}>{formatBudget(task.offers)}</Badge>
                  </HStack>
                  <Text color="muted">{task.description}</Text>
                  <HStack gap={2} flexWrap="wrap">
                    {task.location && (
                      <Badge bg="surfaceContainerHigh" color="fg">
                        {task.location}
                      </Badge>
                    )}
                    {task.offers.length > 0 && (
                      <Badge bg="surfaceContainerHigh" color="fg">
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
                    >
                      Make offer
                    </Button>
                    <Button
                      as={NextLink}
                      href={`/task/${task.id}`}
                      size="sm"
                      variant="subtle"
                      bg="surfaceContainerLow"
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
                variant="subtle"
                bg="surfaceContainerLow"
                disabled={!hasPreviousPage || loading}
                onClick={() =>
                  setPage((currentPage) => Math.max(currentPage - 1, 0))
                }
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="subtle"
                bg="surfaceContainerLow"
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
