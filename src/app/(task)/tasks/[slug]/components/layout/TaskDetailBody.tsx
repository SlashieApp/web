'use client'

import { Box, Text } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { findScrollParent } from '@/utils/findScrollParent'
import { Button, Card } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'
import { TaskNotFoundCard } from '../ui/TaskNotFoundCard'
import { TaskDetailView } from './TaskDetailView'

/**
 * Reset the app-shell pane (not the window — it never scrolls in this
 * layout) when the task id changes.
 */
function TaskDetailScrollReset({ taskId }: { taskId: string }) {
  return (
    <span
      hidden
      key={taskId}
      ref={(node) => {
        if (!node) return
        const scroller = findScrollParent(node)
        if (scroller) scroller.scrollTop = 0
        else window.scrollTo(0, 0)
      }}
    />
  )
}

/**
 * Task detail screen under a `TaskDetailProvider`: error, not-found, or the
 * responsive view. Shared by `/tasks/[slug]` and its owner preview.
 */
export function TaskDetailBody({ taskId }: { taskId: string }) {
  return (
    <>
      <TaskDetailScrollReset taskId={taskId} />
      <TaskDetailContent />
    </>
  )
}

function TaskDetailContent() {
  const t = useI11n(bag)
  const { task, pending, error, refetch, seed } = useTaskDetail()

  if (error && !task && !seed) {
    return (
      <Box
        bg="bg.canvas"
        color="text.default"
        minH="100vh"
        py={{ base: 8, md: 10 }}
      >
        <Card layout="section" heading={t.error.heading} maxW="lg" mx="auto">
          <Text color="text.muted" mb={4}>
            {t.error.description}
          </Text>
          <Button type="button" onClick={() => refetch()}>
            {t.error.retry}
          </Button>
        </Card>
      </Box>
    )
  }

  if (!pending && !task) {
    return (
      <TaskNotFoundCard
        eyebrow={t.notFound.eyebrow}
        heading={t.notFound.title}
        description={t.notFound.description}
      />
    )
  }

  return <TaskDetailView />
}
