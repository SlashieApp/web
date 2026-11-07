import type { QuoteInviteSurface } from './types'

/**
 * The properties of the quote invitation events (FE-507), in one place so the
 * shape is tested, not read out of the call sites. Ids and the API code only:
 * no names, titles or messages.
 */

export function inviteSentProps(input: {
  taskId: string
  workerUserId: string
  surface: QuoteInviteSurface
}) {
  return {
    task_id: input.taskId,
    worker_id: input.workerUserId,
    surface: input.surface,
  }
}

/** The API's error code, or `UNKNOWN` when it sent none. */
export function inviteFailedProps(code: string | null | undefined) {
  return { code: code ?? 'UNKNOWN' }
}

export function inviteDismissedProps(taskId: string) {
  return { task_id: taskId }
}

export function invitePromptSkippedProps(taskId: string) {
  return { task_id: taskId }
}
