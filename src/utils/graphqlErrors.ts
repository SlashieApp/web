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
  INVALID_OAUTH_TOKEN:
    'Google sign-in could not be verified. Try again or use email instead.',
  OAUTH_ACCOUNT_CONFLICT:
    'This Google account is linked to a different login method. Sign in with email or the original provider.',
  WEAK_PASSWORD: 'Password must meet the minimum complexity requirements.',
  INVALID_OR_EXPIRED_RESET_TOKEN: 'This reset link is invalid or has expired.',
  INVALID_OR_EXPIRED_VERIFICATION:
    'This verification code is invalid or has expired. Request a new one.',
  INVALID_PHONE_NUMBER: 'Enter a valid UK mobile number (07… or +44…).',
  PHONE_VERIFICATION_RATE_LIMITED:
    'Too many verification attempts. Try again in about an hour.',
  PHONE_VERIFICATION_NOT_REQUESTED: 'Request a code first.',
  INVALID_VERIFICATION_CODE: 'Enter the 6-digit code from your SMS.',
  TWILIO_VERIFY_NOT_CONFIGURED:
    'Phone verification is temporarily unavailable. Try again later.',
  PHONE_VERIFICATION_FAILED:
    'Could not send or verify your code. Try again shortly.',
  RESEND_VERIFICATION_RATE_LIMITED: 'Please wait 2 minutes before resending.',
  EMAIL_MISMATCH:
    'This link is no longer valid. Request a new verification email.',
  PHONE_MISMATCH:
    "Phone doesn't match your profile. Save your number first, then verify.",
  CONTACT_ALREADY_VERIFIED:
    'Already verified. Change your phone in profile to use a new number.',
  EMAIL_OR_PHONE_IN_USE:
    'This email or phone is already registered to another account.',
  EMAIL_NOT_VERIFIED: 'Verify your email to continue.',
  PHONE_NOT_VERIFIED: 'Verify your phone to continue.',
  MONTHLY_CONNECTION_LIMIT_REACHED:
    "You've reached the free limit of 3 quote connections this calendar month (UTC). Upgrade your membership or Worker Pro for unlimited connections, or try again next month.",
  FORBIDDEN: 'You do not have permission to change this task.',
  NOT_FOUND: 'This task could not be found.',
  TASK_NOT_FOUND: 'This task could not be found.',
  TASK_NOT_EDITABLE:
    'This task can only be edited while it is open or still in draft.',
  TITLE_REQUIRED: 'Please add a task title.',
  DESCRIPTION_REQUIRED: 'Please describe what needs to be done.',
  INVALID_BUDGET: 'Please provide a valid budget greater than zero.',
  INVALID_MAP_LOCATION:
    'Please set a valid location on the map (place name, address, and coordinates).',
  INVALID_ACCEPTED_WORKER_CAP: 'Worker cap must be a positive whole number.',
  ACCEPTED_WORKER_CAP_BELOW_ACCEPTED:
    'Worker cap cannot be lower than the number of quotes already accepted.',
  PROFILE_PHONE_REQUIRED:
    'Save your phone number on your profile first, then verify.',
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

export function getGraphQLErrorCode(error: unknown): string | undefined {
  const graphQLError = pickGraphQLError(error)
  const code = graphQLError?.extensions?.code
  if (typeof code === 'string' && code.trim()) return code
  if (graphQLError?.message) {
    const normalised = normaliseMessage(graphQLError.message)
    if (FRIENDLY_ERROR_BY_MESSAGE[normalised]) return normalised
  }
  return undefined
}

export function getFriendlyErrorMessage(error: unknown, fallback: string) {
  const graphQLError = pickGraphQLError(error)
  const code = graphQLError?.extensions?.code
  if (typeof code === 'string') {
    const byCode = FRIENDLY_ERROR_BY_MESSAGE[code]
    if (byCode) return byCode
  }
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

/** Task create/update mutations — maps API error codes to friendly copy. */
export function getTaskMutationErrorMessage(error: unknown, fallback: string) {
  return getFriendlyErrorMessage(error, fallback)
}
