import { describe, expect, it } from 'vitest'

import {
  publicAreaFromName,
  stripStreetFromPlaceName,
} from './taskLocationDisplay'

describe('publicAreaFromName', () => {
  it('shows the town for an area-level name', () => {
    expect(publicAreaFromName('Bushey, Hertfordshire, England')).toBe('Bushey')
  })

  it('is what leaks for a street-level name (why create stores areas)', () => {
    expect(publicAreaFromName('54 Herkomer Road, Bushey, WD23 3LU')).toBe(
      '54 Herkomer Road',
    )
    expect(publicAreaFromName('WD23 3LU, Bushey')).toBe('')
  })
})

describe('stripStreetFromPlaceName', () => {
  it('drops house numbers and postcodes', () => {
    expect(
      stripStreetFromPlaceName(
        '54 Herkomer Road, Bushey, WD23 3LU, United Kingdom',
      ),
    ).toBe('Bushey, United Kingdom')
    expect(stripStreetFromPlaceName('')).toBe('')
  })
})
