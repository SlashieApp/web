type GraphqlErrorLike = {
  message?: string
  extensions?: {
    code?: string
  }
}

const NOT_FOUND_CODES = new Set([
  'NOT_FOUND',
  'TASK_NOT_FOUND',
  'WORKER_NOT_FOUND',
])
const TASK_NOT_FOUND_CODES = NOT_FOUND_CODES
const WORKER_NOT_FOUND_CODES = NOT_FOUND_CODES

function normaliseErrorCode(error: GraphqlErrorLike): string | null {
  const code = error.extensions?.code?.trim()
  if (code) return code
  const message = error.message?.trim()
  if (message && NOT_FOUND_CODES.has(message)) return message
  return null
}

function isGraphqlNotFound(errors: unknown, codes: Set<string>): boolean {
  if (!errors) return false
  const list = Array.isArray(errors) ? errors : [errors]
  return list.some((entry) => {
    if (!entry || typeof entry !== 'object') return false
    const code = normaliseErrorCode(entry as GraphqlErrorLike)
    return code != null && codes.has(code)
  })
}

/** True when a GraphQL response indicates a task detail page should 404. */
export function isGraphqlTaskNotFound(errors: unknown): boolean {
  return isGraphqlNotFound(errors, TASK_NOT_FOUND_CODES)
}

/** True when a GraphQL response indicates a public worker profile should 404. */
export function isGraphqlWorkerNotFound(errors: unknown): boolean {
  return isGraphqlNotFound(errors, WORKER_NOT_FOUND_CODES)
}
