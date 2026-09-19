import type { TaskDetailRecord } from './taskDetailUtils'

export type TaskOwnerContactKind = 'tel' | 'mailto' | 'account'

export type TaskOwnerContactAction = {
  kind: TaskOwnerContactKind
  href: string
}

/**
 * Contact action for the accepted worker. Phone/email are only populated by
 * the API for that audience; others get redacted nulls.
 */
export function getTaskOwnerContactAction(
  task: Pick<TaskDetailRecord, 'poster'> | null,
): TaskOwnerContactAction {
  const tel = task?.poster?.profile?.contactNumber?.trim() || null
  if (tel) {
    return { kind: 'tel', href: `tel:${tel.replace(/\s/g, '')}` }
  }
  const email = task?.poster?.email?.trim() || null
  if (email) {
    return { kind: 'mailto', href: `mailto:${email}` }
  }
  return { kind: 'account', href: '/account' }
}
