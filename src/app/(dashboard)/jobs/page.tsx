'use client'

import { Box, Grid, HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Badge, Button, SectionCard } from '@ui'

import {
  type MyQuoteItem,
  type TaskItem,
  formatPounds,
  formatRelativePosted,
  isTaskCompleted,
  quotePricePence,
  taskBudgetPence,
} from '@/utils/dashboardHelpers'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

import { useAccountTasks } from '../helpers/useAccountTasks'

function statusLabel(status: string): string {
  return status.replaceAll('_', ' ').toLowerCase()
}

function CustomerJobCard({ task }: { task: TaskItem }) {
  return (
    <SectionCard p={5}>
      <Stack gap={3}>
        <HStack justify="space-between" align="flex-start">
          <Heading size="sm">{task.title}</Heading>
          <Badge bg="badgeBg" color="cardFg">
            Customer · {statusLabel(task.status)}
          </Badge>
        </HStack>
        <Text fontSize="sm" color="formLabelMuted">
          {taskPublicLocationLabel(task) || 'Location TBC'} · budget{' '}
          {formatPounds(taskBudgetPence(task))}
        </Text>
        <Text fontSize="sm" color="formLabelMuted">
          Worker accepted. Confirm completion when the work is done.
        </Text>
        <HStack gap={3}>
          <Link
            as={NextLink}
            href={`/task/${task.id}`}
            _hover={{ textDecoration: 'none' }}
          >
            <Button size="sm">Open task</Button>
          </Link>
        </HStack>
      </Stack>
    </SectionCard>
  )
}

function WorkerJobCard({ task, quote }: MyQuoteItem) {
  return (
    <SectionCard p={5}>
      <Stack gap={3}>
        <HStack justify="space-between" align="flex-start">
          <Heading size="sm">{task.title}</Heading>
          <Badge bg="primary.100" color="primary.800">
            Worker · {statusLabel(task.status)}
          </Badge>
        </HStack>
        <Text fontSize="sm" color="formLabelMuted">
          {taskPublicLocationLabel(task) || 'Location TBC'} ·{' '}
          {formatRelativePosted(quote.createdAt)}
        </Text>
        <Text fontSize="sm">
          Agreed value: <strong>{formatPounds(quotePricePence(quote))}</strong>
        </Text>
        <HStack gap={3}>
          <Link
            as={NextLink}
            href={`/task/${task.id}`}
            _hover={{ textDecoration: 'none' }}
          >
            <Button size="sm">Open task</Button>
          </Link>
        </HStack>
      </Stack>
    </SectionCard>
  )
}

export default function JobsPage() {
  const { loading, errorMessage, customerJobs, workerJobs, refetch } =
    useAccountTasks()
  const total = customerJobs.length + workerJobs.length

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Stack gap={1}>
            <Heading size="xl">Jobs</Heading>
            <Text color="formLabelMuted">
              Tasks with an accepted quote, on either side of the booking. The
              backend decides what you can see — this list reflects the API.
            </Text>
          </Stack>
          <Button size="sm" variant="ghost" onClick={() => void refetch()}>
            Refresh
          </Button>
        </HStack>
      </Stack>

      {errorMessage ? (
        <Text color="red.500" fontSize="sm">
          {errorMessage}
        </Text>
      ) : null}

      {loading && total === 0 ? (
        <Text color="formLabelMuted">Loading jobs…</Text>
      ) : total === 0 ? (
        <SectionCard p={6}>
          <Stack gap={3}>
            <Heading size="sm">No active jobs</Heading>
            <Text color="formLabelMuted" fontSize="sm">
              Accepted quotes appear here whether you posted the task or were
              awarded the work.
            </Text>
          </Stack>
        </SectionCard>
      ) : (
        <Stack gap={6}>
          {customerJobs.length > 0 ? (
            <Stack gap={3}>
              <Heading size="md">Tasks you posted</Heading>
              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2,1fr)' }}
                gap={4}
              >
                {customerJobs.map((task) => (
                  <CustomerJobCard key={task.id} task={task} />
                ))}
              </Grid>
            </Stack>
          ) : null}
          {workerJobs.length > 0 ? (
            <Stack gap={3}>
              <Heading size="md">Tasks where you’re the worker</Heading>
              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2,1fr)' }}
                gap={4}
              >
                {workerJobs.map((entry) => (
                  <WorkerJobCard key={entry.quote.id} {...entry} />
                ))}
              </Grid>
            </Stack>
          ) : null}
        </Stack>
      )}
    </Stack>
  )
}
