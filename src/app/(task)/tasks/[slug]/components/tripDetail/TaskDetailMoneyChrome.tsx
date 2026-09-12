'use client'

import { Box, HStack, Heading, Skeleton, Stack, Text } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { taskBudgetDisplayLine } from '../../helpers/taskDetailUtils'
import bag from '../../i11n.json'
import { TaskHeaderControls } from './TaskHeaderControls'
import { TaskStatusPill } from './TaskStatusPill'
import { selectStatusHeaderCopy } from './statusHeaderCopy'

/**
 * Sticky money context: back · title · overflow, then status + budget.
 * Title is the task name (not the status headline) so the page stays a
 * marketplace money surface while scrolling.
 */
export function TaskDetailMoneyChrome() {
  const {
    task,
    seed,
    pending,
    me,
    permissions,
    statusReady,
    myQuote,
    isAuthenticated,
  } = useTaskDetail()
  const t = useI11n(bag)

  if (!task && !pending && !seed) return null

  const title = task
    ? task.title?.trim() || t.fallbackTask
    : seed?.title?.trim() || t.fallbackTask
  const budgetLine = task
    ? taskBudgetDisplayLine(
        task,
        permissions.isOwner ? 'owner' : 'visitor',
        me?.id,
      )
    : seed?.priceLabel
  const copy =
    statusReady && task
      ? selectStatusHeaderCopy(
          { permissions, myQuote, isAuthenticated, task },
          t.statusHeader,
        )
      : null

  return (
    <Box pt={2} pb={1}>
      <TaskHeaderControls showBackLabel={false}>
        <Heading
          as="h1"
          flex="1"
          minW={0}
          fontFamily="heading"
          fontSize={{ base: 'md', md: 'lg' }}
          fontWeight={600}
          lineHeight="1.3"
          color="text.default"
          truncate
        >
          {title}
        </Heading>
      </TaskHeaderControls>

      <HStack
        gap={3}
        align="center"
        justify="space-between"
        minH="36px"
        px={1}
        pb={2}
      >
        {copy ? (
          <TaskStatusPill status={copy.pill} size="sm" />
        ) : (
          <Skeleton h="22px" w="72px" borderRadius="full" />
        )}
        {budgetLine ? (
          <Text
            fontFamily="heading"
            fontWeight={700}
            fontSize="md"
            color="text.default"
            whiteSpace="nowrap"
          >
            {budgetLine}
          </Text>
        ) : (
          <Skeleton h="20px" w="64px" borderRadius="md" />
        )}
      </HStack>
    </Box>
  )
}

/** Role-aware status line for the Overview tab (not the sticky chrome). */
export function TaskDetailStatusCallout() {
  const { task, permissions, myQuote, isAuthenticated, statusReady } =
    useTaskDetail()
  const t = useI11n(bag)

  if (!statusReady || !task) return null

  const copy = selectStatusHeaderCopy(
    { permissions, myQuote, isAuthenticated, task },
    t.statusHeader,
  )

  return (
    <Stack gap={1} w="full">
      <Text fontWeight={700} fontSize="lg" color="text.default">
        {copy.headline}
      </Text>
      <Text fontSize="sm" color="text.muted">
        {copy.subtext}
      </Text>
    </Stack>
  )
}
