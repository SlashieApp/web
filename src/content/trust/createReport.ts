import type {
  ReportReasonValue,
  ReportTargetKind,
} from '@/ui/ReportDialog/reportFormSchema'
import { getGraphQLErrorCode, pickGraphQLError } from '@/utils/graphqlErrors'

/** BE-40 `ReportTargetType` — local so builds do not require codegen enums. */
export type ReportTargetTypeValue = 'TASK' | 'WORKER' | 'USER'

export type CreateReportInput = {
  targetType: ReportTargetTypeValue
  targetId: string
  reason: ReportReasonValue
  details?: string | null
}

export type CreateReportMutationVariables = {
  input: CreateReportInput
}

export type CreateReportMutation = {
  createReport: {
    id: string
    targetType: ReportTargetTypeValue
    targetId: string
    reason: ReportReasonValue
    details?: string | null
    status: string
    targetUrl?: string | null
    createdAt: string
  }
}

export const REPORT_ERROR_CODE = {
  RATE_LIMITED: 'REPORT_RATE_LIMITED',
  SELF_NOT_ALLOWED: 'REPORT_SELF_NOT_ALLOWED',
  TARGET_NOT_FOUND: 'REPORT_TARGET_NOT_FOUND',
} as const

export const REPORT_QUERY_PARAM = 'report'
export const REPORT_TARGET_QUERY_PARAM = 'reportTarget'

export function reportTargetType(
  kind: ReportTargetKind,
): Extract<ReportTargetTypeValue, 'TASK' | 'WORKER'> {
  return kind === 'worker' ? 'WORKER' : 'TASK'
}

export function toReportReason(reason: ReportReasonValue): ReportReasonValue {
  return reason
}

export function reportReturnPath(targetId: string, href?: string): string {
  const raw =
    href?.trim() || (typeof window !== 'undefined' ? window.location.href : '/')
  const url = new URL(raw, 'https://slashie.app')
  url.searchParams.set(REPORT_QUERY_PARAM, '1')
  url.searchParams.set(REPORT_TARGET_QUERY_PARAM, targetId)
  return `${url.pathname}${url.search}${url.hash}`
}

/** Strip `?report=1` after the matching control consumes it. */
export function consumeReportQueryParam(targetId: string): boolean {
  if (typeof window === 'undefined') return false
  const url = new URL(window.location.href)
  if (url.searchParams.get(REPORT_QUERY_PARAM) !== '1') return false
  const wanted = url.searchParams.get(REPORT_TARGET_QUERY_PARAM)
  if (wanted && wanted !== targetId) return false
  url.searchParams.delete(REPORT_QUERY_PARAM)
  url.searchParams.delete(REPORT_TARGET_QUERY_PARAM)
  const next = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState(window.history.state, '', next)
  return true
}

export function getReportRetryAfterSeconds(error: unknown): number | null {
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

export type ReportCopy = {
  rateLimited: string
  rateLimitedGeneric: string
  selfNotAllowed: string
  targetNotFound: string
  loginRequired: string
  errorFallback: string
}

export function getReportErrorMessage(
  error: unknown,
  copy: ReportCopy,
): string {
  const code = getGraphQLErrorCode(error)
  if (code === 'UNAUTHENTICATED') return copy.loginRequired
  if (code === REPORT_ERROR_CODE.SELF_NOT_ALLOWED) return copy.selfNotAllowed
  if (code === REPORT_ERROR_CODE.TARGET_NOT_FOUND) return copy.targetNotFound
  if (code === REPORT_ERROR_CODE.RATE_LIMITED) {
    const seconds = getReportRetryAfterSeconds(error)
    if (seconds) return copy.rateLimited.replace('{seconds}', String(seconds))
    return copy.rateLimitedGeneric
  }
  return copy.errorFallback
}
