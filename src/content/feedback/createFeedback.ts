import type {
  FeedbackCategoryValue,
  FeedbackFormValues,
} from '@/ui/FeedbackDialog/feedbackFormSchema'
import { getGraphQLErrorCode, pickGraphQLError } from '@/utils/graphqlErrors'

/** BE-48 `FeedbackCategory` — local so builds do not require codegen enums. */
export type FeedbackCategory = FeedbackCategoryValue

export type FeedbackStatusValue = 'OPEN' | 'REVIEWED' | 'REPLIED' | 'DISMISSED'

export type CreateFeedbackInput = {
  email?: string | null
  name?: string | null
  category: FeedbackCategory
  rating?: number | null
  message: string
  pageUrl?: string | null
  path?: string | null
  userAgent?: string | null
}

export type CreateFeedbackMutationVariables = {
  input: CreateFeedbackInput
}

export type CreateFeedbackMutation = {
  createFeedback: {
    id: string
    category: FeedbackCategory
    rating?: number | null
    status: FeedbackStatusValue
    createdAt: string
  }
}

export const FEEDBACK_ERROR_CODE = {
  RATE_LIMITED: 'FEEDBACK_RATE_LIMITED',
} as const

export type PageContext = {
  pageUrl?: string
  path?: string
  userAgent?: string
}

export function currentPageContext(href?: string): PageContext {
  const raw =
    href?.trim() || (typeof window !== 'undefined' ? window.location.href : '')
  if (!raw) return {}
  try {
    const url = new URL(raw, 'https://slashie.app')
    return {
      pageUrl: raw,
      path: `${url.pathname}${url.search}`,
    }
  } catch {
    return { pageUrl: raw, path: raw }
  }
}

export function currentUserAgent(): string | undefined {
  return typeof navigator !== 'undefined' ? navigator.userAgent : undefined
}

export function toCreateFeedbackInput(
  values: FeedbackFormValues,
  page: PageContext = {},
): CreateFeedbackInput {
  const name = values.name.trim()
  const email = values.email.trim()
  return {
    category: values.category,
    message: values.message.trim(),
    email: email || undefined,
    name: name || undefined,
    rating: values.rating,
    pageUrl: page.pageUrl || undefined,
    path: page.path || undefined,
    userAgent: page.userAgent || undefined,
  }
}

export function getFeedbackRetryAfterSeconds(error: unknown): number | null {
  const graphQLError = pickGraphQLError(error)
  const extensions = graphQLError?.extensions as
    | { retryAfterSeconds?: unknown; retryAfter?: unknown }
    | undefined
  const candidates = [extensions?.retryAfterSeconds, extensions?.retryAfter]
  for (const value of candidates) {
    const n =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number(value)
          : Number.NaN
    if (Number.isFinite(n) && n > 0) return Math.ceil(n)
  }
  return null
}

export type FeedbackCopy = {
  rateLimited: string
  rateLimitedGeneric: string
  errorFallback: string
}

const RATE_LIMIT_CODES = new Set([
  FEEDBACK_ERROR_CODE.RATE_LIMITED,
  'RATE_LIMITED',
  'TOO_MANY_REQUESTS',
])

export function getFeedbackErrorMessage(
  error: unknown,
  copy: FeedbackCopy,
): string {
  const code = getGraphQLErrorCode(error)
  if (code && RATE_LIMIT_CODES.has(code)) {
    const seconds = getFeedbackRetryAfterSeconds(error)
    if (seconds) return copy.rateLimited.replace('{seconds}', String(seconds))
    return copy.rateLimitedGeneric
  }
  return copy.errorFallback
}
