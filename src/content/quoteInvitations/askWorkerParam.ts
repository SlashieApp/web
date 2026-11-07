/** `?askWorker=<worker user id>`: Post a task carries the worker to ask once the task is posted (FE-507). */
export const ASK_WORKER_PARAM = 'askWorker'

const USER_ID = /^[0-9a-f]{24}$/i

/** The worker's user id from a query string; null unless it is a 24-hex id. */
export function parseAskWorkerParam(search: string): string | null {
  const value = new URLSearchParams(search).get(ASK_WORKER_PARAM)?.trim()
  return value && USER_ID.test(value) ? value : null
}

/** Post a task, carrying the worker. Bare path: the `@ui` Link adds the locale. */
export function createTaskAskingHref(workerUserId: string): string {
  return `/tasks/create?${ASK_WORKER_PARAM}=${encodeURIComponent(workerUserId)}`
}

/** A task's path carrying the worker, for the prompt on the new task's page. */
export function taskPathAsking(taskId: string, workerUserId: string): string {
  return `/tasks/${taskId}?${ASK_WORKER_PARAM}=${encodeURIComponent(workerUserId)}`
}

/** The query string without the param (other params are kept); `''` when none is left. */
export function withoutAskWorkerParam(search: string): string {
  const params = new URLSearchParams(search)
  params.delete(ASK_WORKER_PARAM)
  const rest = params.toString()
  return rest ? `?${rest}` : ''
}
