import {
  getGraphQLErrorCode,
  getTaskMutationErrorMessage,
} from '@/utils/graphqlErrors'

import type bag from '../i11n.json'

export type TaskErrorKey = keyof (typeof bag)['en']['errors']

/**
 * Form and location errors are copy keys (`createTaskFormSchema`,
 * `resolveTaskLocation`); this shows them in the reader's language. Anything
 * that isn't a key (a server message) passes through.
 */
export function taskFieldError(
  errors: Record<TaskErrorKey, string>,
  message: string | undefined,
): string | undefined {
  if (!message) return undefined
  return (errors as Record<string, string>)[message] ?? message
}

/**
 * A failed create or save: the bag's copy for the API codes it knows (the
 * schedule checks), otherwise the shared task error copy or the fallback.
 */
export function taskServerError(
  serverErrors: Record<string, string>,
  error: unknown,
  fallback: string,
): string {
  const code = getGraphQLErrorCode(error)
  return (
    (code && serverErrors[code]) || getTaskMutationErrorMessage(error, fallback)
  )
}
