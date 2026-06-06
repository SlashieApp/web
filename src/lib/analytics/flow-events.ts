import { getGraphQLErrorCode } from '@/utils/graphqlErrors'

import { capture, getCurrentRoute } from './capture'
import { captureApiError } from './capture-api-error'
import type { AnalyticsEvent, CaptureProperties } from './events'

export function trackFlowSucceeded(
  event: AnalyticsEvent,
  properties?: CaptureProperties,
): void {
  capture(event, properties)
}

export function trackFlowFailed(
  event: AnalyticsEvent,
  error: unknown,
  context: {
    flow: string
    action: string
    operation: string
    route?: string
    extra?: CaptureProperties
  },
): void {
  captureApiError(error, {
    flow: context.flow,
    action: context.action,
    source: 'graphql',
    url_or_operation: context.operation,
    route: context.route ?? getCurrentRoute(),
    report_global: false,
  })
  capture(event, {
    error_code: getGraphQLErrorCode(error),
    ...context.extra,
  })
}
