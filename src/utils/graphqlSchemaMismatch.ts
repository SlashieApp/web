import { pickGraphQLError } from './graphqlErrors'

const MISMATCH =
  /Cannot query field|Unknown argument|Unknown type|is not defined on type|Cannot return null for non-nullable/i

function messagesOf(error: unknown): string[] {
  if (!error || typeof error !== 'object') return []
  const record = error as {
    message?: unknown
    errors?: unknown
    graphQLErrors?: unknown
  }
  const out: string[] = []
  if (typeof record.message === 'string') out.push(record.message)
  const lists = [record.errors, record.graphQLErrors]
  for (const list of lists) {
    if (!Array.isArray(list)) continue
    for (const item of list) {
      if (item && typeof item === 'object' && 'message' in item) {
        const message = (item as { message?: unknown }).message
        if (typeof message === 'string') out.push(message)
      }
    }
  }
  const picked = pickGraphQLError(error)
  if (picked?.message) out.push(picked.message)
  return out
}

/** True when the deployed schema does not have this operation yet. */
export function isGraphQLSchemaMismatch(error: unknown): boolean {
  return messagesOf(error).some((message) => MISMATCH.test(message))
}
