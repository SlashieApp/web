/** A private exact address, in the parts a poster fills (UK). */
export type ExactAddress = {
  addressLine1: string
  addressLine2: string
  city: string
  county: string
  postcode: string
}

export const EMPTY_EXACT_ADDRESS: ExactAddress = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  county: '',
  postcode: '',
}

/** Nations Mapbox appends; they are not a line, a city, or a county. */
const NATIONS = new Set([
  'united kingdom',
  'uk',
  'great britain',
  'england',
  'scotland',
  'wales',
  'northern ireland',
])

/** Outward then inward, with or without the space: "SW1A 1AA", "WD171JJ". */
const POSTCODE = /([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})/i

/** A numberless street ("High Street") is still a line, not a city. */
const STREET =
  /\b(street|st|road|rd|avenue|ave|lane|ln|close|drive|dr|way|court|gardens|place|crescent|terrace|square|grove|mews|walk)\b/i

function isAddressLine(segment: string): boolean {
  return /\d/.test(segment) || STREET.test(segment)
}

const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i

/** "WD171JJ" and "wd17 1jj" both read as a postcode. */
export function isUkPostcode(value: string): boolean {
  return UK_POSTCODE.test(value.trim())
}

function normalizePostcode(outward: string, inward: string): string {
  return `${outward.toUpperCase()} ${inward.toUpperCase()}`
}

/**
 * A Mapbox label, or an older one-line address, as the form's parts.
 * "12 Clarendon Road, Watford, Hertfordshire, WD17 1JJ, United Kingdom"
 * becomes line 1, city Watford, county Hertfordshire, postcode WD17 1JJ.
 * A second street segment (a flat) is line 2.
 */
export function parseExactAddress(raw: string): ExactAddress {
  const segments = raw
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part && !NATIONS.has(part.toLowerCase()))

  let postcode = ''
  const before: string[] = []
  for (const segment of segments) {
    const match = POSTCODE.exec(segment)
    if (!match || postcode) {
      if (!postcode) before.push(segment)
      continue
    }
    postcode = normalizePostcode(match[1], match[2])
    const cityInSegment = segment.slice(0, match.index).trim()
    if (cityInSegment) before.push(cityInSegment)
  }

  const lines: string[] = []
  const places: string[] = []
  for (const segment of before) {
    if (isAddressLine(segment)) lines.push(segment)
    else places.push(segment)
  }

  return {
    addressLine1: lines[0] ?? '',
    addressLine2: lines.slice(1).join(', '),
    city: places[0] ?? '',
    county: places.slice(1).join(', '),
    postcode,
  }
}

/** The parts in one line, for the API and the review step. */
export function formatExactAddress(address: ExactAddress): string {
  return [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.county,
    address.postcode,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ')
}
