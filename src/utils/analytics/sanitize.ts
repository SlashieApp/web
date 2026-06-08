import type { CaptureProperties } from './events'

const PII_KEYS =
  /^(email|password|token|phone|contact_number|address|street|oauth_token|authorization)$/i

export function truncateMessage(message: string, max = 200): string {
  const trimmed = message.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

export function sanitizeProperties(
  properties?: CaptureProperties,
): CaptureProperties | undefined {
  if (!properties) return undefined
  const safe: CaptureProperties = {}
  for (const [key, value] of Object.entries(properties)) {
    if (PII_KEYS.test(key)) continue
    if (typeof value === 'string' && key === 'error_message') {
      safe[key] = truncateMessage(value)
      continue
    }
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null ||
      value === undefined
    ) {
      safe[key] = value
    }
  }
  return safe
}
