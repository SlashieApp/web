'use client'

import { TaskDetailView } from './openTask/TaskDetailView'

/**
 * @deprecated Task detail is a single CSS-responsive tree (`TaskDetailView`).
 * Kept so existing stories that import the mobile entry still compile.
 */
export function TaskDetailMobile() {
  return <TaskDetailView />
}
