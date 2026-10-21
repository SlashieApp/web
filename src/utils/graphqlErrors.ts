'use client'

type GraphQLErrorLike = {
  message?: string
  extensions?: {
    code?: string
    missing?: unknown
    retryAfterSeconds?: unknown
    retryAfter?: unknown
  }
}

const FRIENDLY_ERROR_BY_MESSAGE: Record<string, string> = {
  UNAUTHENTICATED: 'You need to log in to continue.',
  INVALID_CREDENTIALS: 'Email or password is incorrect.',
  INVALID_OAUTH_TOKEN:
    'Sign-in could not be verified. Try again or use email instead.',
  OAUTH_ACCOUNT_CONFLICT:
    'This email is already linked to a different Google or Apple account. Sign in with that account, or use email.',
  OAUTH_LINK_REQUIRES_VERIFIED_EMAIL:
    'An account with this email already exists. Sign in with your password and verify your email first, then you can use Google or Apple.',
  WEAK_PASSWORD: 'Password must meet the minimum complexity requirements.',
  PASSWORD_UNCHANGED: 'Choose a password you have not used here.',
  PASSWORD_NOT_SET: 'This account has no password yet. Set one first.',
  PASSWORD_ALREADY_SET:
    'This account already has a password. Change it instead.',
  LAST_LOGIN_METHOD:
    'Set a password or keep your other sign-in before removing this one.',
  LOGIN_METHOD_NOT_SUPPORTED: 'That sign-in method cannot be changed here.',
  APPLE_EMAIL_REQUIRED:
    'Apple did not share an email address. Try again and share your email.',
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
  PHONE_CHANGE_REQUIRES_VERIFICATION:
    'To change a verified number, confirm the new one with the code we text you.',
  EMAIL_CHANGE_NOT_ALLOWED:
    'This account signs in with Google, so its email can only change in Google.',
  INVALID_EMAIL: 'Enter a valid email address.',
  EMAIL_UNCHANGED: "That's already your email.",
  EMAIL_OR_PHONE_IN_USE:
    'This email or phone is already registered to another account.',
  EMAIL_NOT_VERIFIED: 'Verify your email to continue.',
  CATEGORY_REQUIRED: 'Add at least one category.',
  TOO_MANY_CATEGORIES: 'Use up to 10 categories.',
  CATEGORY_TOO_LONG: 'Keep each category under 64 characters.',
  INVALID_UNSUBSCRIBE_TOKEN: "This unsubscribe link doesn't work.",
  PHONE_NOT_VERIFIED: 'Verify your phone to continue.',
  MONTHLY_CONNECTION_LIMIT_REACHED:
    "You've reached the free limit of 3 quote connections this calendar month (UTC). Upgrade to Slashie Unlimited for unlimited quotes, or try again next month.",
  WORKER_QUOTE_LIMIT_REACHED:
    "You've quoted your free limit of new tasks this month (UTC). You can still edit quotes on tasks you've already quoted. Upgrade to Slashie Unlimited to quote more tasks, or wait until next month.",
  WORKER_SETUP_INCOMPLETE: 'Finish worker setup before quoting on tasks.',
  TAGLINE_TOO_LONG: 'Keep your headline to 80 characters.',
  BIO_TOO_LONG: 'Keep your bio to 300 characters.',
  TOO_MANY_SKILLS: 'Use up to 12 skills.',
  INVALID_SKILL: 'Each skill needs 2 to 30 characters.',
  YEARS_EXPERIENCE_INVALID: 'Enter between 0 and 60 years.',
  TOO_MANY_PORTFOLIO_URLS: 'Add up to 12 portfolio links.',
  INVALID_PORTFOLIO_URL: 'Portfolio links must start with https://.',
  WORKER_PROFILE_INCOMPLETE:
    'Complete your profile requirements before finishing setup.',
  INVALID_SETUP_SUB_STEP:
    'That setup step is not valid. Refresh and try again.',
  INVALID_NAME: 'Enter your first and last name.',
  AVATAR_REQUIRED: 'Add a profile photo before continuing.',
  SKILLS_REQUIRED: 'List at least one skill or service you offer.',
  YEARS_EXPERIENCE_REQUIRED: 'Enter your years of experience.',
  LOCATION_REQUIRED:
    "We couldn't find that place. Try a city name or full postcode.",
  LOCATION_LABEL_REQUIRED: 'Add your primary service area.',
  NOT_FOUND: 'This task could not be found.',
  TASK_NOT_FOUND: 'This task could not be found.',
  TASK_NOT_EDITABLE:
    'This task can only be edited while it is open or still in draft.',
  DATE_REQUIRED: 'Pick a date for this task.',
  INVALID_DATE: 'That date is not valid. Pick another.',
  DATE_IN_PAST: 'That date has passed. Pick today or a later date.',
  INVALID_INDEX: 'That photo could not be added. Use up to 10 photos.',
  FORBIDDEN_TASK_UPLOAD: 'Only the person who posted this task can add photos.',
  UPLOAD_NOT_FOUND: "That photo didn't finish uploading. Please try again.",
  IMAGE_TOO_LARGE: 'That photo is too large. Try a smaller one.',
  UNSUPPORTED_IMAGE:
    "That photo couldn't be read. Use a JPG, PNG, WebP, HEIC or AVIF photo.",
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
  RATE_LIMITED: 'Too many attempts right now. Please wait a bit and try again.',
  TOO_MANY_REQUESTS:
    'Too many attempts right now. Please wait a bit and try again.',
  AUTH_RATE_LIMITED:
    'Too many attempts right now. Please wait a bit and try again, or sign in with Google if available.',
  LOGIN_RATE_LIMITED:
    'Too many sign-in attempts. Please wait a bit and try again, or sign in with Google if available.',
  PASSWORD_RESET_RATE_LIMITED:
    'Too many reset requests. Please wait a bit and try again.',
  REGISTER_RATE_LIMITED:
    'Too many registration attempts. Please wait a bit and try again, or continue with Google if available.',
  ACCOUNT_TEMPORARILY_LOCKED:
    'Too many attempts. Please wait a bit and try again, or sign in with Google if available.',
  LOGIN_LOCKED:
    'Too many attempts. Please wait a bit and try again, or sign in with Google if available.',
  CAPTCHA_REQUIRED: 'Complete the security check to continue.',
  CAPTCHA_FAILED:
    'Security check failed or expired. Complete it again and retry.',
  INVALID_CAPTCHA:
    'Security check failed or expired. Complete it again and retry.',
  TURNSTILE_FAILED:
    'Security check failed or expired. Complete it again and retry.',
  REPORT_RATE_LIMITED:
    "You've sent too many reports. Please wait a bit and try again.",
  FEEDBACK_RATE_LIMITED:
    "You've sent too much feedback. Please wait a bit and try again.",
  REPORT_SELF_NOT_ALLOWED: "You can't report your own listing.",
  REPORT_TARGET_NOT_FOUND:
    "We couldn't find that listing. It may have been removed.",
  ACCOUNT_DISABLED:
    'This user is being suspended, please contact accounts@slashie.app.',
  ACCOUNT_DELETION_SCHEDULED:
    'This account is waiting to be deleted. Restore it to keep using Slashie.',
  ACCOUNT_DELETED: 'This account has been deleted.',
  ACCOUNT_BANNED:
    "This email or phone number can't be used on Slashie. Contact accounts@slashie.app if you think this is a mistake.",
  REAUTH_REQUIRED:
    'For your security, sign in again, then delete your account within 10 minutes.',
  ACCOUNT_HAS_LIVE_ORDERS:
    'Finish or cancel your active bookings before deleting your account.',
  INVALID_SLOT_COUNT: 'Offer one or two times.',
  INVALID_SLOT:
    'One of those times is not valid. Check the start time and length.',
  SLOT_IN_PAST: 'That time has already passed. Pick a time in the future.',
  SLOT_NOT_FOUND: 'That time is no longer available. Refresh and pick again.',
  QUOTE_NOT_FOUND: 'This quote could not be found. It may have been withdrawn.',
  QUOTE_NOT_PENDING:
    'This quote has already been accepted, declined or withdrawn. Refresh to see the latest.',
  QUOTE_ALREADY_EXISTS:
    "You've already quoted on this task. Edit your quote instead.",
  INVALID_QUOTE_AMOUNT: 'Enter a price greater than zero.',
  CANNOT_QUOTE_OWN_TASK: "You can't quote on your own task.",
  TASK_NOT_OPEN: 'This task is no longer taking quotes.',
  TASK_ACCEPTED_WORKER_CAP_REACHED:
    'This task already has all the workers it needs.',
  TASK_HAS_ACCEPTED_QUOTE:
    'This task already has an accepted quote, so it can no longer be changed this way.',
  ORDER_NOT_FOUND: 'This booking could not be found.',
  ORDER_REQUEST_PENDING:
    'A request is already waiting on this booking. Answer or withdraw it first.',
  ORDER_NOT_ACTIVE: 'This booking can no longer be changed.',
  ORDER_ALREADY_STARTED:
    'The booked time has started. Mark the job Done or Failed instead.',
  ORDER_NOT_STARTED:
    'You can mark the job Done or Failed once the booked time starts.',
  ORDER_NO_PENDING_REQUEST:
    'That request is no longer open. Refresh to see the latest.',
  ORDER_OWN_REQUEST: "You can't answer your own request.",
  ORDER_NOT_REQUESTER: 'Only the person who made this request can withdraw it.',
  MESSAGE_EMPTY: 'Write a message first.',
  MESSAGE_TOO_LONG: 'Messages can be up to 2,000 characters.',
  MESSAGE_LOCKED: 'You can message here once a quote is accepted.',
  MESSAGE_BLOCKED: 'Messages are blocked between you and this person.',
  MESSAGE_RATE_LIMITED:
    "You're sending messages too quickly. Wait a moment and try again.",
  CANNOT_BLOCK_SELF: "You can't block yourself.",
  ORDER_CHANGED:
    'This booking just changed. We have loaded the latest, so check it and try again.',
}

export const MONTHLY_CONNECTION_LIMIT_ERROR_CODE =
  'MONTHLY_CONNECTION_LIMIT_REACHED' as const

export const WORKER_QUOTE_LIMIT_ERROR_CODE =
  'WORKER_QUOTE_LIMIT_REACHED' as const

export const ACCOUNT_DISABLED_ERROR_CODE = 'ACCOUNT_DISABLED' as const
export const ACCOUNT_DELETION_SCHEDULED_ERROR_CODE =
  'ACCOUNT_DELETION_SCHEDULED' as const
export const ACCOUNT_DELETED_ERROR_CODE = 'ACCOUNT_DELETED' as const

function normaliseMessage(message: string) {
  return message.trim().toUpperCase()
}

export function pickGraphQLError(error: unknown): GraphQLErrorLike | null {
  if (!error || typeof error !== 'object') return null
  const candidate = error as {
    errors?: unknown
    graphQLErrors?: unknown
  }
  const fromErrors = Array.isArray(candidate.errors)
    ? (candidate.errors[0] as GraphQLErrorLike | undefined)
    : undefined
  if (fromErrors?.message || fromErrors?.extensions?.code) return fromErrors
  const fromGraphQLErrors = Array.isArray(candidate.graphQLErrors)
    ? (candidate.graphQLErrors[0] as GraphQLErrorLike | undefined)
    : undefined
  if (fromGraphQLErrors?.message || fromGraphQLErrors?.extensions?.code)
    return fromGraphQLErrors
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

export function isWorkerQuoteLimitError(error: unknown) {
  const graphQLError = pickGraphQLError(error)
  if (graphQLError?.extensions?.code === WORKER_QUOTE_LIMIT_ERROR_CODE)
    return true
  if (!graphQLError?.message) return false
  return (
    normaliseMessage(graphQLError.message) === WORKER_QUOTE_LIMIT_ERROR_CODE
  )
}

export function isAccountDisabledError(error: unknown) {
  const graphQLError = pickGraphQLError(error)
  if (graphQLError?.extensions?.code === ACCOUNT_DISABLED_ERROR_CODE)
    return true
  if (!graphQLError?.message) return false
  return normaliseMessage(graphQLError.message) === ACCOUNT_DISABLED_ERROR_CODE
}

/** The account is waiting for deletion: only `me` and `restoreAccount` work. */
export function isAccountDeletionScheduledError(error: unknown) {
  return getGraphQLErrorCode(error) === ACCOUNT_DELETION_SCHEDULED_ERROR_CODE
}

export function isAccountDeletedError(error: unknown) {
  return getGraphQLErrorCode(error) === ACCOUNT_DELETED_ERROR_CODE
}

/** The API rejected the session: drop it. Network or server trouble keeps it. */
export function isSessionEndedError(error: unknown) {
  return isUnauthenticatedError(error) || isAccountDeletedError(error)
}

/** Codes `finalizeTaskImage` and `finalizeAvatarUpload` send for a refused image. */
export const IMAGE_UPLOAD_ERROR_CODES = [
  'UPLOAD_NOT_FOUND',
  'IMAGE_TOO_LARGE',
  'UNSUPPORTED_IMAGE',
] as const

export type ImageUploadErrorCode = (typeof IMAGE_UPLOAD_ERROR_CODES)[number]

/** Why the API refused an uploaded image, or null for any other failure. */
export function imageUploadErrorCode(
  error: unknown,
): ImageUploadErrorCode | null {
  const code = getGraphQLErrorCode(error)
  return IMAGE_UPLOAD_ERROR_CODES.find((known) => known === code) ?? null
}

export function getGraphQLErrorCode(error: unknown): string | undefined {
  const graphQLError = pickGraphQLError(error)
  const rawCode = graphQLError?.extensions?.code
  const code = typeof rawCode === 'string' && rawCode.trim() ? rawCode : null
  // Apollo Server tags every plain `throw new Error('CODE')` as
  // INTERNAL_SERVER_ERROR, so the real code is the message.
  if (code && code !== 'INTERNAL_SERVER_ERROR') return code
  if (graphQLError?.message) {
    const normalised = normaliseMessage(graphQLError.message)
    if (FRIENDLY_ERROR_BY_MESSAGE[normalised]) return normalised
  }
  return code ?? undefined
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
