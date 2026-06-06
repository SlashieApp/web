import { combinePhoneParts, splitPhoneE164 } from '@/utils/phoneCountries'

/**
 * Normalise a phone string to E.164 for API calls. Accepts combined
 * `PhoneInput` output (`+447…`) or legacy UK local (`07…`) formats.
 */
export function toE164ForApi(phone: string): string {
  const trimmed = phone.trim()
  if (!trimmed) {
    throw new Error('INVALID_PHONE_NUMBER')
  }

  const split = splitPhoneE164(trimmed)
  if (split) {
    const e164 = combinePhoneParts(split.dial, split.national)
    const digits = e164.slice(1)
    if (!/^\d{10,15}$/.test(digits)) {
      throw new Error('INVALID_PHONE_NUMBER')
    }
    return e164
  }

  throw new Error('INVALID_PHONE_NUMBER')
}

/** Best-effort comparison of two phone strings after E.164 normalisation. */
export function phonesMatchForApi(a: string, b: string): boolean {
  try {
    return toE164ForApi(a) === toE164ForApi(b)
  } catch {
    return a.trim() === b.trim()
  }
}

export function formatPhoneForDisplay(phone: string): string {
  const trimmed = phone.trim()
  if (!trimmed) return ''
  try {
    const e164 = toE164ForApi(trimmed)
    if (e164.startsWith('+44') && e164.length >= 13) {
      return `+44 ${e164.slice(3, 7)} ${e164.slice(7)}`
    }
    return e164
  } catch {
    return trimmed
  }
}

export function maskPhoneForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 4) return phone
  const last4 = digits.slice(-4)
  return phone.includes('+') ? `+${digits.slice(0, 2)} … ${last4}` : `…${last4}`
}
