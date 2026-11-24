import { describe, expect, it } from 'vitest'

import { monthCells, parseYmd, shiftMonth, toYmd } from './dateTime'

describe('monthCells', () => {
  it('starts June 2026 on Monday, with no leading blanks', () => {
    const cells = monthCells(2026, 5)
    expect(cells[0]).toMatchObject({ day: 1 })
    expect(cells.filter((cell) => cell.day)).toHaveLength(30)
    expect(cells.length % 7).toBe(0)
  })

  it('pads a month that starts later in the week', () => {
    // 1 May 2026 is a Friday, four days after Monday.
    expect(
      monthCells(2026, 4)
        .slice(0, 5)
        .map((cell) => cell.day),
    ).toEqual([null, null, null, null, 1])
  })
})

describe('shiftMonth', () => {
  it('crosses the year', () => {
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, monthIndex: 11 })
    expect(toYmd(2026, 5, 14)).toBe('2026-06-14')
    expect(parseYmd('2026-02-30')).toBeNull()
  })
})
