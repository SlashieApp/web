'use client'

import {
  Box,
  Container,
  Grid,
  HStack,
  Heading,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useMemo, useState } from 'react'

import {
  type TaskItem,
  formatDate,
  formatPounds,
  formatRelativePosted,
  getQuoteRange,
  getTaskCardVisual,
  isQuoteAwarded,
  isTaskCompleted,
  taskBudgetPence,
} from '@/utils/dashboardHelpers'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { Badge, Button, useColorModeValue } from '@ui'

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
  all: 'All tasks',
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
  const visual = getTaskCardVisual(task)
  const iconPodBg = useColorModeValue(visual.bg, 'cardIconPodBg')
  const amount =
    getQuoteRange(task.quotes ?? []) ?? formatPounds(taskBudgetPence(task))

  const badgeByStage: Record<
    TaskStage,
    { bg: string; color: string; borderWidth?: string; borderColor?: string }
  > = {
    draft: { bg: 'badgeBg', color: 'formLabelMuted' },
    open: {
      bg: 'intentPrimaryBg',
      color: 'intentPrimaryFg',
      borderWidth: '1px',
      borderColor: 'intentPrimaryBorder',
    },
    awarded: { bg: 'badgeBg', color: 'cardFg' },
    completed: {
      bg: 'intentTertiaryBg',
      color: 'intentTertiaryFg',
      borderWidth: '1px',
      borderColor: 'intentTertiaryBorder',
    },
  }

  const b = badgeByStage[stage]

  return (
    <Box
      p={5}
      borderWidth="1px"
      borderColor="cardBorder"
      borderRadius="xl"
      bg="cardBg"
      color="cardFg"
      _hover={{ boxShadow: 'md' }}
    >
      <Stack gap={4}>
        <HStack justify="space-between" align="flex-start">
          <Box
            w={10}
            h={10}
            borderRadius="lg"
            bg={iconPodBg}
            display="grid"
            placeItems="center"
          >
            {visual.glyph}
          </Box>
          <Badge
            bg={b.bg}
            color={b.color}
            borderWidth={b.borderWidth}
            borderColor={b.borderColor}
          >
            {stage.toUpperCase()}
          </Badge>
        </HStack>

        <Stack gap={1}>
          <Heading size="sm" color="cardFg">
            {task.title}
          </Heading>
          <Text fontSize="sm" color="formLabelMuted">
            {formatDate(task.createdAt)} {'•'}{' '}
            {taskPublicLocationLabel(task) || 'Metro area'}
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
          <Text fontSize="sm" color="formLabelMuted">
            {task.description}
          </Text>
        </Box>

        <HStack justify="space-between" align="center">
          <Heading size="sm" color="cardFg">
            {amount}
          </Heading>
          <Link
            as={NextLink}
            href={`/task/${task.id}`}
            _hover={{ textDecoration: 'none' }}
          >
            <Button size="sm" variant={stage === 'open' ? 'primary' : 'ghost'}>
              {stage === 'open'
                ? 'View quotes'
                : stage === 'draft'
                  ? 'Edit draft'
                  : 'View details'}
            </Button>
          </Link>
        </HStack>
      </Stack>
    </Box>
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

  const statsPanelBg = useColorModeValue(
    'linear-gradient(160deg, #047857 0%, #059669 55%, #10b981 100%)',
    'linear-gradient(160deg, #065f46 0%, #047857 45%, #059669 100%)',
  )

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
    <Container maxW="container.xl" pt={6} px={{ base: 4, md: 6 }}>
      <Stack gap={8} color="cardFg">
        <Stack gap={3}>
          <HStack
            justify="space-between"
            align="flex-start"
            flexWrap="wrap"
            gap={3}
          >
            <Stack gap={1}>
              <Heading size="xl" color="cardFg">
                My requests
              </Heading>
              <Text color="formLabelMuted">
                Track your tasks, compare quotes, and see what needs attention.
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
              onClick={() => {
                setTab('active')
                setFilter('all')
              }}
            >
              Active
            </Button>
            <Button
              size="sm"
              variant={tab === 'archived' ? 'primary' : 'ghost'}
              onClick={() => {
                setTab('archived')
                setFilter('all')
              }}
            >
              Archived
            </Button>
            <Button size="sm" variant="ghost" onClick={refetchCustomerAccount}>
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
              variant={filter === key ? 'primary' : 'subtle'}
              onClick={() => setFilter(key)}
            >
              {FILTER_LABELS[key]} {filterCounts[key]}
            </Button>
          ))}
        </HStack>

        {tasksLoading ? (
          <Text color="formLabelMuted">Loading requests…</Text>
        ) : null}
        {tasksErrorMessage ? (
          <Text color="intentDangerFg" fontWeight={600}>
            {tasksErrorMessage}
          </Text>
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
              <Box
                p={8}
                borderWidth="1px"
                borderStyle="dashed"
                borderColor="cardDivider"
                borderRadius="xl"
                bg="cardBg"
                color="cardFg"
                textAlign="center"
              >
                <Heading size="sm" color="cardFg">
                  Post a new task
                </Heading>
                <Text color="formLabelMuted">
                  Get quotes from local workers in minutes.
                </Text>
                <Link
                  as={NextLink}
                  href="/tasks/create"
                  _hover={{ textDecoration: 'none' }}
                >
                  <Button size="sm" mt={3}>
                    Create task
                  </Button>
                </Link>
              </Box>
            </Grid>

            <Stack gap={4} position={{ xl: 'sticky' }} top={{ xl: 4 }}>
              <Box
                p={5}
                borderRadius="xl"
                bg={statsPanelBg}
                color="white"
                borderWidth="1px"
                borderColor="whiteAlpha.300"
              >
                <Text fontSize="sm" color="whiteAlpha.900">
                  Tasks with quote activity
                </Text>
                <Heading size="lg" color="white">
                  {quoteActivityCount}
                </Heading>
                <Text fontSize="sm" color="whiteAlpha.900">
                  Quotes received (all tasks)
                </Text>
                <Heading size="md" color="white">
                  {totalQuotes}
                </Heading>
                <Text fontSize="sm" color="whiteAlpha.900">
                  {formatRelativePosted(myPostedTasks[0]?.createdAt ?? null)}{' '}
                  most recent task activity.
                </Text>
              </Box>

              <Box
                p={5}
                bg="cardBg"
                borderWidth="1px"
                borderColor="cardBorder"
                borderRadius="xl"
                color="cardFg"
              >
                <Heading size="sm" mb={3} color="cardFg">
                  Needs attention
                </Heading>
                <Stack gap={3}>
                  {activeTasks
                    .filter((task) => (task.quotes ?? []).length > 0)
                    .slice(0, 3)
                    .map((task) => (
                      <Box
                        key={task.id}
                        p={4}
                        bg="badgeBg"
                        borderWidth="1px"
                        borderColor="cardBorder"
                        borderRadius="lg"
                      >
                        <Heading size="sm" color="cardFg">
                          {task.title}
                        </Heading>
                        <Text fontSize="sm" color="formLabelMuted">
                          {(task.quotes ?? []).length} quotes {'•'}{' '}
                          {taskPublicLocationLabel(task) || 'Location TBC'}
                        </Text>
                        <Link
                          as={NextLink}
                          href={`/task/${task.id}`}
                          fontSize="sm"
                          fontWeight={700}
                          color="cardAccentFg"
                          _hover={{
                            color: 'intentPrimaryFg',
                            textDecoration: 'none',
                          }}
                        >
                          Open task
                        </Link>
                      </Box>
                    ))}
                </Stack>
              </Box>
            </Stack>
          </Grid>
        ) : null}

        <Box
          overflow="hidden"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="cardBorder"
          bg="primary.900"
          color="white"
        >
          <Grid templateColumns={{ base: '1fr', lg: '1.2fr 0.8fr' }}>
            <Stack gap={4} p={{ base: 6, md: 8 }}>
              <Badge
                alignSelf="flex-start"
                bg="whiteAlpha.300"
                color="white"
                borderWidth="1px"
                borderColor="whiteAlpha.400"
              >
                Slashie tip
              </Badge>
              <Heading size="lg" color="white">
                Bundle small tasks to compare quotes faster.
              </Heading>
              <Text color="whiteAlpha.900">
                Grouping related work in one post helps workers bid accurately
                and can make scheduling simpler on both sides.
              </Text>
            </Stack>
            <Box
              minH={{ base: '200px', lg: '100%' }}
              bg="linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.2) 100%)"
            />
          </Grid>
        </Box>
      </Stack>
    </Container>
  )
}
