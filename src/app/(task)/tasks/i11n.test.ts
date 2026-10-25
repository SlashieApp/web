import { describe, expect, it } from 'vitest'

import taskBag from './[slug]/i11n.json'
import bag from './i11n.json'

/** Every leaf of a copy bag as a dotted path, so two languages can be compared. */
function copyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    copyPaths(child, prefix ? `${prefix}.${key}` : key),
  )
}

describe('My tasks copy', () => {
  it('has the same keys in en and zh_hk', () => {
    expect(copyPaths(bag.zh_hk).sort()).toEqual(copyPaths(bag.en).sort())
  })

  it('has no empty copy', () => {
    for (const language of [bag.en, bag.zh_hk]) {
      const empty = copyPaths(language).filter((path) => {
        const value = path
          .split('.')
          .reduce<unknown>(
            (node, key) => (node as Record<string, unknown>)[key],
            language,
          )
        return typeof value === 'string' && value.trim() === ''
      })
      expect(empty).toEqual([])
    }
  })

  it('names how a quote ended once the booking did (BE-116), as task detail does', () => {
    expect(bag.en.outcomes.otherBookingEnded).toBe('Booking cancelled')
    expect(bag.zh_hk.outcomes.otherBookingEnded).toBe('預約已取消')
    expect(bag.en.outcomes.otherBookingEnded).toBe(
      taskBag.en.summary.bookingCancelledHeadline,
    )
    expect(bag.zh_hk.outcomes.otherBookingEnded).toBe(
      taskBag.zh_hk.summary.bookingCancelledHeadline,
    )
  })

  it('uses no em dashes in the outcomes', () => {
    expect(JSON.stringify([bag.en.outcomes, bag.zh_hk.outcomes])).not.toContain(
      '—',
    )
  })
})
