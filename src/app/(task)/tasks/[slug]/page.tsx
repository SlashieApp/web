'use client'

import { Box, Text } from '@chakra-ui/react'
import { useParams } from 'next/navigation'

import { useI11n } from '@/i18n/useI11n'
import { Button, Card } from '@ui'

import { TaskNotFoundCard } from './components/TaskNotFoundCard'
import { TaskDetailMobile } from './components/tripDetail/TaskDetailMobile'
import { TaskDetailView } from './components/tripDetail/openTask/TaskDetailView'
import { TaskDetailProvider, useTaskDetail } from './context/TaskDetailProvider'
import { findScrollParent } from './helpers/taskDetailHeaderCollapse'
import { useTaskDetailDesktopLayout } from './helpers/useTaskDetailDesktopLayout'
import bag from './i11n.json'

/**
 * The router's own scroll-to-top is skipped when a navigation runs a view
 * transition. Reset the app-shell pane (not the window — it never scrolls
 * in this layout) during the transition's DOM update, before the incoming
 * snapshot is taken.
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

function TaskDetailBody() {
  const t = useI11n(bag)
  const { task, pending, error, refetch, seed } = useTaskDetail()
  const isDesktop = useTaskDetailDesktopLayout()

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

  return isDesktop ? <TaskDetailView /> : <TaskDetailMobile />
}

/**
 * Task detail. Client-owned so a listing click can paint seeded image/title/
 * price immediately while colocated skeletons stand in for the rest. Direct
 * loads have no handoff and show the full skeleton until TaskCore resolves.
 */
export default function TaskDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const taskId = String(slug ?? '')

  return (
    <TaskDetailProvider taskId={taskId}>
      <TaskDetailScrollReset taskId={taskId} />
      <TaskDetailBody />
    </TaskDetailProvider>
  )
}
