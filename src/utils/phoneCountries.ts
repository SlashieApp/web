export type PhoneCountry = {
  iso: string
  name: string
  dial: string
}

/** UK-only for MVP — expand when international numbers are supported. */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: 'GB', name: 'United Kingdom', dial: '+44' },
]

const DIALS_LONGEST_FIRST = [
  ...new Set(PHONE_COUNTRIES.map((c) => c.dial)),
].sort((a, b) => b.length - a.length)

export const DEFAULT_CALLING_CODE = '+44'

/** UK-only MVP — always +44. */
export function detectDefaultCallingCode(): string {
  return DEFAULT_CALLING_CODE
}

export function countryForDial(dial: string): PhoneCountry | undefined {
  return PHONE_COUNTRIES.find((c) => c.dial === dial)
}

/** Split an E.164 or loose international string into dial code + national digits. */
export function splitPhoneE164(
  value: string,
): { dial: string; national: string } | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const compact = trimmed.replace(/[\s()-]/g, '')
  if (!compact.startsWith('+')) {
    const digits = compact.replace(/\D/g, '')
    if (digits.startsWith('0')) {
      return { dial: DEFAULT_CALLING_CODE, national: digits.slice(1) }
    }
    if (digits) {
      return { dial: DEFAULT_CALLING_CODE, national: digits }
    }
    return null
  }

  for (const dial of DIALS_LONGEST_FIRST) {
    if (compact.startsWith(dial)) {
      const national = compact.slice(dial.length).replace(/\D/g, '')
      return { dial, national }
    }
  }

  const digits = compact.slice(1).replace(/\D/g, '')
  if (!digits) return null
  return { dial: DEFAULT_CALLING_CODE, national: digits }
}

/** Combine dial code + national number into E.164 (`+…` only digits). */
export function combinePhoneParts(dial: string, national: string): string {
  let nationalDigits = national.replace(/\D/g, '')
  if (!nationalDigits) return ''

  if (dial === DEFAULT_CALLING_CODE && nationalDigits.startsWith('0')) {
    nationalDigits = nationalDigits.slice(1)
  }

  return `${dial}${nationalDigits}`
}
