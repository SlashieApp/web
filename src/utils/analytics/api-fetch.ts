import {
  type ApiErrorSource,
  type CaptureApiErrorContext,
  captureApiError,
} from './capture-api-error'

type ApiFetchContext = Omit<CaptureApiErrorContext, 'source'> & {
  source?: ApiErrorSource
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  context?: ApiFetchContext,
): Promise<Response> {
  const url = typeof input === 'string' ? input : input.toString()
  try {
    const response = await fetch(input, init)
    if (!response.ok) {
      captureApiError(new Error(`HTTP ${response.status}`), {
        flow: context?.flow ?? 'api_fetch',
        action: context?.action ?? 'apiFetch',
        source: context?.source ?? 'fetch',
        url_or_operation: context?.url_or_operation ?? url,
        route: context?.route,
      })
    }
    return response
  } catch (error: unknown) {
    captureApiError(error, {
      flow: context?.flow ?? 'api_fetch',
      action: context?.action ?? 'apiFetch',
      source: context?.source ?? 'fetch',
      url_or_operation: context?.url_or_operation ?? url,
      route: context?.route,
    })
    throw error
  }
}
