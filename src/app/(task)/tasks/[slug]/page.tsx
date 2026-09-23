'use client'

import { useParams } from 'next/navigation'

import { TaskDetailBody } from './components/layout/TaskDetailBody'
import { TaskDetailProvider } from './context/TaskDetailProvider'

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
      <TaskDetailBody taskId={taskId} />
    </TaskDetailProvider>
  )
}
