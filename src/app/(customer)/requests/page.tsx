'use client'

import { Box, Grid, HStack, Link, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useMemo, useState } from 'react'

import {
  type TaskItem,
  formatDate,
  formatPounds,
  formatRelativePosted,
  getCategoryVisual,
  getQuoteRange,
  isQuoteAwarded,
  isTaskCompleted,
} from '@/utils/dashboardHelpers'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { Badge, Button, GlassCard, Heading, Text } from '@ui'
import { useCustomerAccount } from '../context'

type RequestsTab = 'active' | 'archived'
type RequestFilter = 'all' | 'draft' | 'open' | 'awarded' | 'completed'
type TaskStage = Exclude<RequestFilter, 'all'>

const FILTERS: RequestFilter[] = [
  'all',
  'draft',
  'open',
  'awarded',
  'completed',
]
const FILTER_LABELS: Record<RequestFilter, string> = {
  all: 'All Projects',
  draft: 'Draft',
  open: 'Open',
  awarded: 'Awarded',
  completed: 'Completed',
}

function getTaskStage(task: TaskItem): TaskStage {
  if (isTaskCompleted(task.status)) return 'completed'
  if (isQuoteAwarded(task.status)) return 'awarded'
  if ((task.quotes ?? []).length === 0) return 'draft'
  return 'open'
}

function TaskCard({ task }: { task: TaskItem }) {
  const stage = getTaskStage(task)
  const visual = getCategoryVisual(task.category)
  const amount =
    getQuoteRange(task.quotes ?? []) ?? formatPounds(task.priceQuotePence ?? 0)

  const badgeByStage: Record<TaskStage, { bg: string; color: string }> = {
    draft: { bg: 'surfaceContainerHigh', color: 'muted' },
    open: { bg: 'primary.100', color: 'primary.700' },
    awarded: { bg: 'secondaryFixed', color: 'onSecondaryFixed' },
    completed: { bg: 'green.100', color: 'green.700' },
  }

  return (
    <GlassCard
      p={5}
      borderWidth="1px"
      borderColor="border"
      _hover={{ boxShadow: 'md' }}
    >
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
          <Badge bg={badgeByStage[stage].bg} color={badgeByStage[stage].color}>
            {stage.toUpperCase()}
          </Badge>
        </HStack>

        <Stack gap={1}>
          <Heading size="sm">{task.title}</Heading>
          <Text fontSize="sm" color="muted">
            {formatDate(task.createdAt)} {'•'}{' '}
            {taskPublicLocationLabel(task) || 'Metro Area'}
          </Text>
        </Stack>

        <Box
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          <Text fontSize="sm" color="muted">
            {task.description}
          </Text>
        </Box>

        <HStack justify="space-between">
          <Heading size="sm">{amount}</Heading>
          <Button
            as={NextLink}
            href={`/task/${task.id}`}
            size="sm"
            variant={stage === 'open' ? 'solid' : 'ghost'}
          >
            {stage === 'open'
              ? 'View Quotes'
              : stage === 'draft'
                ? 'Edit Draft'
                : 'View Details'}
          </Button>
        </HStack>
      </Stack>
    </GlassCard>
  )
}

export default function CustomerRequestsPage() {
  const {
    tasksLoading,
    tasksErrorMessage,
    myPostedTasks,
    refetchCustomerAccount,
  } = useCustomerAccount()
  const [tab, setTab] = useState<RequestsTab>('active')
  const [filter, setFilter] = useState<RequestFilter>('all')

  const activeTasks = useMemo(
    () => myPostedTasks.filter((t) => !isTaskCompleted(t.status)),
    [myPostedTasks],
  )
  const archivedTasks = useMemo(
    () => myPostedTasks.filter((t) => isTaskCompleted(t.status)),
    [myPostedTasks],
  )
  const scopedTasks = tab === 'active' ? activeTasks : archivedTasks

  const filterCounts = useMemo(() => {
    const counts = {
      all: scopedTasks.length,
      draft: 0,
      open: 0,
      awarded: 0,
      completed: 0,
    }
    for (const task of scopedTasks) counts[getTaskStage(task)] += 1
    return counts
  }, [scopedTasks])

  const visibleTasks = useMemo(
    () =>
      scopedTasks.filter(
        (task) => filter === 'all' || getTaskStage(task) === filter,
      ),
    [scopedTasks, filter],
  )

  const quoteActivityCount = useMemo(
    () => activeTasks.filter((t) => (t.quotes ?? []).length > 0).length,
    [activeTasks],
  )
  const totalQuotes = useMemo(
    () => myPostedTasks.reduce((n, t) => n + (t.quotes ?? []).length, 0),
    [myPostedTasks],
  )

  return (
    <Stack gap={8}>
      <Stack gap={3}>
        <HStack
          justify="space-between"
          align="flex-start"
          flexWrap="wrap"
          gap={3}
        >
          <Stack gap={1}>
            <Heading size="xl">My Requests</Heading>
            <Text color="muted">
              Manage your project history and track active job bids.
            </Text>
          </Stack>
          <Button as={NextLink} href="/tasks/create">
            Post a Job
          </Button>
        </HStack>

        <HStack gap={2}>
          <Button
            size="sm"
            variant={tab === 'active' ? 'solid' : 'ghost'}
            onClick={() => {
              setTab('active')
              setFilter('all')
            }}
          >
            Active
          </Button>
          <Button
            size="sm"
            variant={tab === 'archived' ? 'solid' : 'ghost'}
            onClick={() => {
              setTab('archived')
              setFilter('all')
            }}
          >
            Archived
          </Button>
          <Button size="sm" variant="subtle" onClick={refetchCustomerAccount}>
            Refresh
          </Button>
        </HStack>
      </Stack>

      <HStack gap={2} flexWrap="wrap">
        {FILTERS.map((key) => (
          <Button
            key={key}
            size="sm"
            borderRadius="full"
            variant={filter === key ? 'solid' : 'subtle'}
            onClick={() => setFilter(key)}
          >
            {FILTER_LABELS[key]} {filterCounts[key]}
          </Button>
        ))}
      </HStack>

      {tasksLoading ? <Text color="muted">Loading requests...</Text> : null}
      {tasksErrorMessage ? (
        <Text color="red.400">{tasksErrorMessage}</Text>
      ) : null}

      {!tasksLoading && !tasksErrorMessage ? (
        <Grid
          templateColumns={{ base: '1fr', xl: '1fr 320px' }}
          gap={6}
          alignItems="start"
        >
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2,minmax(0,1fr))' }}
            gap={4}
          >
            {visibleTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            <GlassCard
              p={8}
              borderWidth="1px"
              borderStyle="dashed"
              borderColor="primary.200"
              textAlign="center"
            >
              <Heading size="sm">Post a New Job</Heading>
              <Text color="muted">
                Get quotes from local experts in minutes.
              </Text>
              <Button as={NextLink} href="/tasks/create" size="sm">
                Create Request
              </Button>
            </GlassCard>
          </Grid>

          <Stack gap={4} position={{ xl: 'sticky' }} top={{ xl: 4 }}>
            <GlassCard
              p={5}
              bg="linear-gradient(160deg, #03225a 0%, #012b73 55%, #00358f 100%)"
              color="white"
            >
              <Text fontSize="sm" opacity={0.85}>
                Jobs with quote activity
              </Text>
              <Heading size="lg" color="white">
                {quoteActivityCount}
              </Heading>
              <Text fontSize="sm" opacity={0.85}>
                Quotes received (all requests)
              </Text>
              <Heading size="md" color="white">
                {totalQuotes}
              </Heading>
              <Text fontSize="sm" opacity={0.9}>
                {formatRelativePosted(myPostedTasks[0]?.createdAt ?? null)} most
                recent task update.
              </Text>
            </GlassCard>

            <GlassCard p={5} bg="surfaceContainerLow">
              <Heading size="sm" mb={3}>
                Needs attention
              </Heading>
              <Stack gap={3}>
                {activeTasks
                  .filter((task) => (task.quotes ?? []).length > 0)
                  .slice(0, 3)
                  .map((task) => (
                    <GlassCard
                      key={task.id}
                      p={4}
                      bg="surfaceContainerLowest"
                      borderWidth="1px"
                      borderColor="border"
                    >
                      <Heading size="sm">{task.title}</Heading>
                      <Text fontSize="sm" color="muted">
                        {(task.quotes ?? []).length} quotes {'•'}{' '}
                        {taskPublicLocationLabel(task) || 'Location TBC'}
                      </Text>
                      <Link
                        as={NextLink}
                        href={`/task/${task.id}`}
                        fontSize="sm"
                        fontWeight={700}
                        color="primary.600"
                      >
                        Open task
                      </Link>
                    </GlassCard>
                  ))}
              </Stack>
            </GlassCard>
          </Stack>
        </Grid>
      ) : null}

      <GlassCard
        overflow="hidden"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border"
        bg="primary.700"
        color="white"
      >
        <Grid templateColumns={{ base: '1fr', lg: '1.2fr 0.8fr' }}>
          <Stack gap={4} p={{ base: 6, md: 8 }}>
            <Badge alignSelf="flex-start" bg="primary.900" color="white">
              HANDYBOX PRO ADVICE
            </Badge>
            <Heading size="lg" color="white">
              Save 15% on your next renovation with Project Bundles.
            </Heading>
            <Text color="whiteAlpha.900">
              By combining multiple small tasks in one request, you can attract
              higher-rated pros and negotiate better day rates.
            </Text>
          </Stack>
          <Box
            minH={{ base: '200px', lg: '100%' }}
            bg="linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 45%, rgba(1,43,115,0.4) 100%)"
          />
        </Grid>
      </GlassCard>
    </Stack>
  )
}
