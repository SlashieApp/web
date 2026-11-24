import { describe, expect, it } from 'vitest'

import {
  formatExactAddress,
  isUkPostcode,
  parseExactAddress,
} from './exactAddress'

describe('parseExactAddress', () => {
  it('splits a Mapbox label into line, city, county and postcode', () => {
    expect(
      parseExactAddress(
        '12 Clarendon Road, Watford, Hertfordshire, WD17 1JJ, United Kingdom',
      ),
    ).toEqual({
      addressLine1: '12 Clarendon Road',
      addressLine2: '',
      city: 'Watford',
      county: 'Hertfordshire',
      postcode: 'WD17 1JJ',
    })
  })

  it('keeps a flat as line 2', () => {
    expect(
      parseExactAddress(
        'Flat 2, 12 Clarendon Road, Watford, WD17 1JJ, United Kingdom',
      ),
    ).toEqual({
      addressLine1: 'Flat 2',
      addressLine2: '12 Clarendon Road',
      city: 'Watford',
      county: '',
      postcode: 'WD17 1JJ',
    })
  })

  it('reads a city written in the same segment as the postcode', () => {
    expect(parseExactAddress('12 Example Street, London SW1A 1AA')).toEqual({
      addressLine1: '12 Example Street',
      addressLine2: '',
      city: 'London',
      county: '',
      postcode: 'SW1A 1AA',
    })
  })

  it('keeps a one-line address as line 1', () => {
    expect(parseExactAddress('12 Example Street')).toEqual({
      addressLine1: '12 Example Street',
      addressLine2: '',
      city: '',
      county: '',
      postcode: '',
    })
  })
})

describe('formatExactAddress', () => {
  it('joins the filled parts and skips the empty ones', () => {
    expect(
      formatExactAddress({
        addressLine1: '12 Clarendon Road',
        addressLine2: '',
        city: 'Watford',
        county: 'Hertfordshire',
        postcode: 'WD17 1JJ',
      }),
    ).toBe('12 Clarendon Road, Watford, Hertfordshire, WD17 1JJ')
  })
})

describe('isUkPostcode', () => {
  it('accepts a postcode with or without the space', () => {
    expect(isUkPostcode('SW1A 1AA')).toBe(true)
    expect(isUkPostcode('sw1a1aa')).toBe(true)
    expect(isUkPostcode('Watford')).toBe(false)
  })
})
