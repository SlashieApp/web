import { describe, expect, it } from 'vitest'

import { townOnly } from './taskLocationDisplay'

// Examples from wiki 02-Engineering/Location-Privacy.md (BE-72).
describe('townOnly', () => {
  it('keeps only the town', () => {
    expect(townOnly('54 Herkomer Road, Bushey, WD23 3LU, United Kingdom')).toBe(
      'Bushey',
    )
    expect(townOnly('Bushey, Hertfordshire, England, United Kingdom')).toBe(
      'Bushey',
    )
    expect(townOnly('Flat 3, 12 High Street, Watford, WD17 2AB')).toBe(
      'Watford',
    )
  })

  it('has no town for a bare postcode or empty input', () => {
    expect(townOnly('WD23 3LU')).toBeNull()
    expect(townOnly('')).toBeNull()
    expect(townOnly(null)).toBeNull()
  })

  it('errs coarse for towns named like streets', () => {
    expect(townOnly('Burgess Hill, West Sussex')).toBe('West Sussex')
  })

  it('drops brackets and postcode districts, then tries the next candidate', () => {
    expect(townOnly('Camden (~5 miles)')).toBe('Camden')
    expect(townOnly('Bushey WD23')).toBe('Bushey')
    expect(townOnly('12 High Street', 'Watford, WD17 2AB')).toBe('Watford')
  })
})
