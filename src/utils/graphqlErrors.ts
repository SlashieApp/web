'use client'

type GraphQLErrorLike = {
  message?: string
  extensions?: {
    code?: string
  }
}

const FRIENDLY_ERROR_BY_MESSAGE: Record<string, string> = {
  UNAUTHENTICATED: 'You need to log in to continue.',
  INVALID_CREDENTIALS: 'Email or password is incorrect.',
  WEAK_PASSWORD: 'Password must meet the minimum complexity requirements.',
  INVALID_OR_EXPIRED_RESET_TOKEN: 'This reset link is invalid or has expired.',
  MONTHLY_CONNECTION_LIMIT_REACHED:
    "You've reached the free limit of 3 quote connections this calendar month (UTC). Upgrade your membership or Worker Pro for unlimited connections, or try again next month.",
}

export const MONTHLY_CONNECTION_LIMIT_ERROR_CODE =
  'MONTHLY_CONNECTION_LIMIT_REACHED' as const

function normaliseMessage(message: string) {
  return message.trim().toUpperCase()
}

function pickGraphQLError(error: unknown): GraphQLErrorLike | null {
  if (!error || typeof error !== 'object') return null
  const candidate = error as {
    errors?: unknown
    graphQLErrors?: unknown
  }
  const fromErrors = Array.isArray(candidate.errors)
    ? (candidate.errors[0] as GraphQLErrorLike | undefined)
    : undefined
  if (fromErrors?.message) return fromErrors
  const fromGraphQLErrors = Array.isArray(candidate.graphQLErrors)
    ? (candidate.graphQLErrors[0] as GraphQLErrorLike | undefined)
    : undefined
  if (fromGraphQLErrors?.message) return fromGraphQLErrors
  return null
}

export function isUnauthenticatedError(error: unknown) {
  const graphQLError = pickGraphQLError(error)
  if (graphQLError?.extensions?.code === 'UNAUTHENTICATED') return true
  if (!graphQLError?.message) return false
  return normaliseMessage(graphQLError.message) === 'UNAUTHENTICATED'
}

export function isMonthlyConnectionLimitError(error: unknown) {
  const graphQLError = pickGraphQLError(error)
  if (graphQLError?.extensions?.code === MONTHLY_CONNECTION_LIMIT_ERROR_CODE)
    return true
  if (!graphQLError?.message) return false
  return (
    normaliseMessage(graphQLError.message) ===
    MONTHLY_CONNECTION_LIMIT_ERROR_CODE
  )
}

export function getFriendlyErrorMessage(error: unknown, fallback: string) {
  const graphQLError = pickGraphQLError(error)
  const code = graphQLError?.extensions?.code
  if (code === MONTHLY_CONNECTION_LIMIT_ERROR_CODE) {
    return FRIENDLY_ERROR_BY_MESSAGE[MONTHLY_CONNECTION_LIMIT_ERROR_CODE]
  }
  if (graphQLError?.message) {
    const normalisedMessage = normaliseMessage(graphQLError.message)
    const mappedMessage = FRIENDLY_ERROR_BY_MESSAGE[normalisedMessage]
    if (mappedMessage) return mappedMessage
    return graphQLError.message
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return fallback
}
