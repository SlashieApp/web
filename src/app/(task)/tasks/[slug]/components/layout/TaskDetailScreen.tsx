'use client'

import { TaskDetailProvider } from '../../context/TaskDetailProvider'
import { TaskDetailBody } from './TaskDetailBody'

/**
 * Task detail. Client-owned so a listing click can paint seeded image/title/
 * price immediately while colocated skeletons stand in for the rest. Direct
 * loads have no handoff and show the full skeleton until TaskCore resolves.
 */
export function TaskDetailScreen({ taskId }: { taskId: string }) {
  return (
    <TaskDetailProvider taskId={taskId}>
      <TaskDetailBody taskId={taskId} />
    </TaskDetailProvider>
  )
}
