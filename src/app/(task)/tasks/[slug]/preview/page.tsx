'use client'

import { useParams } from 'next/navigation'

import { TaskDetailBody } from '../components/layout/TaskDetailBody'
import { TaskDetailProvider } from '../context/TaskDetailProvider'

/**
 * Owner preview: the task detail page exactly as a signed-out visitor sees
 * it, whoever is signed in.
 */
export default function TaskPreviewPage() {
  const { slug } = useParams<{ slug: string }>()
  const taskId = String(slug ?? '')

  return (
    <TaskDetailProvider taskId={taskId} viewAs="guest">
      <TaskDetailBody taskId={taskId} />
    </TaskDetailProvider>
  )
}
