import { capture, getCurrentRoute } from './capture'
import { EVENTS } from './events'
import { truncateMessage } from './sanitize'

export type ApiErrorSource = 'graphql' | 'fetch' | 'upload' | 'ssr'

export type CaptureApiErrorContext = {
  flow: string
  action: string
  source: ApiErrorSource
  url_or_operation?: string
  route?: string
  operation_type?: 'query' | 'mutation' | 'subscription'
  /** When false, skip the global graphql_error / api_fetch_failed event (flow-only). */
  report_global?: boolean
}

const DEDUPE_TTL_MS = 4_000
const recentGlobalErrors = new Map<string, number>()

function errorFingerprint(
  error: unknown,
  context: CaptureApiErrorContext,
): string {
  const message = extractErrorMessage(error)
  const code = extractErrorCode(error)
  return [
    context.source,
    context.url_or_operation ?? '',
    code ?? '',
    truncateMessage(message, 120),
  ].join('|')
}

function shouldReportGlobal(
  fingerprint: string,
  reportGlobal: boolean,
): boolean {
  if (!reportGlobal) return false
  const now = Date.now()
  const last = recentGlobalErrors.get(fingerprint)
  if (last && now - last < DEDUPE_TTL_MS) return false
  recentGlobalErrors.set(fingerprint, now)
  if (recentGlobalErrors.size > 200) {
    for (const [key, ts] of recentGlobalErrors) {
      if (now - ts > DEDUPE_TTL_MS) recentGlobalErrors.delete(key)
    }
  }
  return true
}

function extractErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error'
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return 'Unknown error'
}

function extractErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined
  const extensions = (error as { extensions?: { code?: unknown } }).extensions
  if (typeof extensions?.code === 'string') return extensions.code
  const graphQLErrors = (
    error as { graphQLErrors?: Array<{ extensions?: { code?: unknown } }> }
  ).graphQLErrors
  const first = graphQLErrors?.[0]?.extensions?.code
  return typeof first === 'string' ? first : undefined
}

export function captureApiError(
  error: unknown,
  context: CaptureApiErrorContext,
): void {
  try {
    const route = context.route ?? getCurrentRoute()
    const errorMessage = truncateMessage(extractErrorMessage(error))
    const errorCode = extractErrorCode(error)
    const fingerprint = errorFingerprint(error, context)
    const reportGlobal = context.report_global !== false

    const baseProps = {
      flow: context.flow,
      action: context.action,
      source: context.source,
      url_or_operation: context.url_or_operation,
      route,
      operation_type: context.operation_type,
      error_code: errorCode,
      error_message: errorMessage,
    }

    if (
      shouldReportGlobal(fingerprint, reportGlobal) &&
      context.source === 'graphql'
    ) {
      capture(EVENTS.graphql_error, baseProps)
      return
    }

    if (
      shouldReportGlobal(fingerprint, reportGlobal) &&
      (context.source === 'fetch' || context.source === 'upload')
    ) {
      capture(EVENTS.api_fetch_failed, baseProps)
    }
  } catch {
    // Never throw from analytics.
  }
}
