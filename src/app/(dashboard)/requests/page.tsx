'use client'

import { Box, Grid, HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useMemo, useState } from 'react'

import { Badge, Button, SectionCard } from '@ui'

import {
  type TaskItem,
  formatDate,
  formatPounds,
  formatRelativePosted,
  getTaskCardVisual,
  isQuoteAwarded,
  isTaskCompleted,
  quotePricePence,
  taskBudgetPence,
} from '@/utils/dashboardHelpers'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

import { isTaskEditable } from '@/app/(task)/helpers/taskEditHelpers'

import { useAccountTasks } from '../helpers/useAccountTasks'

type RequestsTab = 'active' | 'archived' | 'quoting'

function postedTaskStage(
  task: TaskItem,
): 'draft' | 'open' | 'awarded' | 'completed' {
  if (isTaskCompleted(task.status)) return 'completed'
  if ((task.quotes ?? []).some((q) => isQuoteAwarded(q.status)))
    return 'awarded'
  if ((task.quotes ?? []).length === 0) return 'draft'
  return 'open'
}

function PostedTaskCard({ task }: { task: TaskItem }) {
  const stage = postedTaskStage(task)
  const visual = getTaskCardVisual(task)
  return (
    <SectionCard p={5}>
      <Stack gap={4}>
        <HStack justify="space-between" align="flex-start">
          <Box
            w={10}
            h={10}
            borderRadius="lg"
            bg={visual.bg}
            display="grid"
            placeItems="center"
          >
            {visual.glyph}
          </Box>
          <Badge bg="badgeBg" color="cardFg">
            {stage.toUpperCase()}
          </Badge>
        </HStack>
        <Stack gap={1}>
          <Heading size="sm">{task.title}</Heading>
          <Text fontSize="sm" color="formLabelMuted">
            {formatDate(task.createdAt)} ·{' '}
            {taskPublicLocationLabel(task) || 'Location TBC'}
          </Text>
        </Stack>
        <Text
          fontSize="sm"
          color="formLabelMuted"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {task.description}
        </Text>
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
          <Heading size="sm">{formatPounds(taskBudgetPence(task))}</Heading>
          <HStack gap={2}>
            {isTaskEditable(task.status) ? (
              <Link
                as={NextLink}
                href={`/tasks/${task.id}/edit`}
                _hover={{ textDecoration: 'none' }}
              >
                <Button size="sm" variant="ghost">
                  Edit
                </Button>
              </Link>
            ) : null}
            <Link
              as={NextLink}
              href={`/task/${task.id}`}
              _hover={{ textDecoration: 'none' }}
            >
              <Button
                size="sm"
                variant={stage === 'open' ? 'primary' : 'ghost'}
              >
                {stage === 'open' ? 'View quotes' : 'Open task'}
              </Button>
            </Link>
          </HStack>
        </HStack>
      </Stack>
    </SectionCard>
  )
}

function SentQuoteCard({
  task,
  quote,
}: {
  task: TaskItem
  quote: NonNullable<TaskItem['quotes']>[number]
}) {
  const awarded = isQuoteAwarded(quote.status)
  return (
    <SectionCard p={5}>
      <Stack gap={3}>
        <HStack justify="space-between" align="flex-start">
          <Heading size="sm">{task.title}</Heading>
          <Badge
            bg={awarded ? 'primary.100' : 'badgeBg'}
            color={awarded ? 'primary.800' : 'cardFg'}
          >
            {awarded ? 'Awarded' : quote.status.toUpperCase()}
          </Badge>
        </HStack>
        <Text fontSize="sm" color="formLabelMuted">
          {taskPublicLocationLabel(task) || 'Location TBC'} ·{' '}
          {formatRelativePosted(quote.createdAt)}
        </Text>
        <Text fontSize="sm">
          Quote value: <strong>{formatPounds(quotePricePence(quote))}</strong>
        </Text>
        {quote.message ? (
          <Text fontSize="sm" color="formLabelMuted">
            “{quote.message}”
          </Text>
        ) : null}
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

export default function MyRequestsPage() {
  const {
    loading,
    errorMessage,
    activePostedTasks,
    completedPostedTasks,
    sentQuotes,
    refetch,
  } = useAccountTasks()
  const [tab, setTab] = useState<RequestsTab>('active')

  const visiblePosted =
    tab === 'archived' ? completedPostedTasks : activePostedTasks

  const counts = useMemo(
    () => ({
      active: activePostedTasks.length,
      archived: completedPostedTasks.length,
      quoting: sentQuotes.length,
    }),
    [activePostedTasks, completedPostedTasks, sentQuotes],
  )

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Stack gap={1}>
            <Heading size="xl">My Requests</Heading>
            <Text color="formLabelMuted">
              Tasks you posted as customer, plus quotes you sent on tasks posted
              by others.
            </Text>
          </Stack>
          <Link
            as={NextLink}
            href="/tasks/create"
            _hover={{ textDecoration: 'none' }}
          >
            <Button>Post a task</Button>
          </Link>
        </HStack>
        <HStack gap={2} flexWrap="wrap">
          <Button
            size="sm"
            variant={tab === 'active' ? 'primary' : 'ghost'}
            onClick={() => setTab('active')}
          >
            Active ({counts.active})
          </Button>
          <Button
            size="sm"
            variant={tab === 'quoting' ? 'primary' : 'ghost'}
            onClick={() => setTab('quoting')}
          >
            Quotes I sent ({counts.quoting})
          </Button>
          <Button
            size="sm"
            variant={tab === 'archived' ? 'primary' : 'ghost'}
            onClick={() => setTab('archived')}
          >
            Archived ({counts.archived})
          </Button>
          <Button size="sm" variant="ghost" onClick={() => void refetch()}>
            Refresh
          </Button>
        </HStack>
      </Stack>

      {loading ? <Text color="formLabelMuted">Loading requests…</Text> : null}
      {errorMessage ? (
        <Text color="red.500" fontSize="sm">
          {errorMessage}
        </Text>
      ) : null}

      {tab === 'quoting' ? (
        sentQuotes.length === 0 && !loading ? (
          <SectionCard p={6}>
            <Stack gap={3}>
              <Heading size="sm">No outbound quotes yet</Heading>
              <Text color="formLabelMuted" fontSize="sm">
                Browse open tasks and send your first quote.
              </Text>
              <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
                <Button alignSelf="flex-start" size="sm">
                  Browse open tasks
                </Button>
              </Link>
            </Stack>
          </SectionCard>
        ) : (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2,1fr)' }} gap={4}>
            {sentQuotes.map(({ task, quote }) => (
              <SentQuoteCard key={quote.id} task={task} quote={quote} />
            ))}
          </Grid>
        )
      ) : visiblePosted.length === 0 && !loading ? (
        <SectionCard p={6}>
          <Stack gap={3}>
            <Heading size="sm">
              {tab === 'archived'
                ? 'Nothing archived yet'
                : 'No active requests'}
            </Heading>
            <Text color="formLabelMuted" fontSize="sm">
              {tab === 'archived'
                ? 'Completed and confirmed tasks will appear here.'
                : 'Post a new task to start collecting quotes from local workers.'}
            </Text>
          </Stack>
        </SectionCard>
      ) : (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2,1fr)' }} gap={4}>
          {visiblePosted.map((task) => (
            <PostedTaskCard key={task.id} task={task} />
          ))}
        </Grid>
      )}
    </Stack>
  )
}
