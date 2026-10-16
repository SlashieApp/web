import { pickGraphQLError } from '@/utils/graphqlErrors'

import type bag from '../i11n.json'

type SetupCopy = (typeof bag)['en']

/**
 * A failed save in the reader's language. Apollo Server tags a plain
 * `throw new Error('CODE')` as INTERNAL_SERVER_ERROR, so the code may be the
 * message. Anything unknown gets a plain "try again".
 */
export function workerSetupErrorMessage(
  error: unknown,
  copy: Pick<SetupCopy, 'serverErrors' | 'missing' | 'saveFailed'>,
): string {
  const graphQLError = pickGraphQLError(error)
  const known = (value: unknown): value is keyof SetupCopy['serverErrors'] =>
    typeof value === 'string' && value in copy.serverErrors
  const code = [graphQLError?.extensions?.code, graphQLError?.message?.trim()]
    .filter(known)
    .at(0)
  if (!code) return copy.saveFailed

  const missing = graphQLError?.extensions?.missing
  if (code === 'WORKER_PROFILE_INCOMPLETE' && Array.isArray(missing)) {
    const lines = missing
      .map((item) =>
        typeof item === 'string' && item in copy.missing
          ? copy.missing[item as keyof SetupCopy['missing']]
          : null,
      )
      .filter(Boolean)
    if (lines.length > 0) return lines.join(' ')
  }
  return copy.serverErrors[code]
}
