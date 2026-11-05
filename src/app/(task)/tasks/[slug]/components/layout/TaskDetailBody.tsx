'use client'

import { useI11n } from '@/i18n/useI11n'
import { APP_HOME } from '@/utils/appRoutes'
import { findScrollParent } from '@/utils/findScrollParent'
import { Button, Link, StatusCard } from '@ui'

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
      <StatusCard
        title={t.error.heading}
        body={<span role="alert">{t.error.description}</span>}
        actions={
          <>
            <Button type="button" size="form" onClick={() => refetch()}>
              {t.error.retry}
            </Button>
            <Button asChild variant="secondary" size="form">
              <Link href={APP_HOME} _hover={{ textDecoration: 'none' }}>
                {t.error.browse}
              </Link>
            </Button>
          </>
        }
      />
    )
  }

  if (!pending && !task) {
    return (
      <TaskNotFoundCard
        eyebrow={t.notFound.eyebrow}
        heading={t.notFound.title}
        description={t.notFound.description}
        browseLabel={t.notFound.browse}
      />
    )
  }

  return <TaskDetailView />
}
