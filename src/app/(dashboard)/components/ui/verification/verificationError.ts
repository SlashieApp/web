import { getGraphQLErrorCode } from '@/utils/graphqlErrors'

/** The bag's copy for a known API code, else the step's fallback; never raw API text. */
export function verificationErrorText(
  errors: Record<string, string>,
  error: unknown,
  fallback: string,
): string {
  const code = getGraphQLErrorCode(error)
  return (code && errors[code]) || fallback
}
