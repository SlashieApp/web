type GraphqlErrorLike = {
  message?: string
  extensions?: {
    code?: string
  }
}

const TASK_NOT_FOUND_CODES = new Set(['NOT_FOUND', 'TASK_NOT_FOUND'])

function normaliseErrorCode(error: GraphqlErrorLike): string | null {
  const code = error.extensions?.code?.trim()
  if (code) return code
  const message = error.message?.trim()
  if (message && TASK_NOT_FOUND_CODES.has(message)) return message
  return null
}

/** True when a GraphQL response indicates a task detail page should 404. */
export function isGraphqlTaskNotFound(errors: unknown): boolean {
  if (!errors) return false
  const list = Array.isArray(errors) ? errors : [errors]
  return list.some((entry) => {
    if (!entry || typeof entry !== 'object') return false
    const code = normaliseErrorCode(entry as GraphqlErrorLike)
    return code != null && TASK_NOT_FOUND_CODES.has(code)
  })
}
