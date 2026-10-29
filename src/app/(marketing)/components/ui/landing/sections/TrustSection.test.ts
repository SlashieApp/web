import { describe, expect, it } from 'vitest'

import { SECTION_PY } from '@/app/(marketing)/components/layout/MarketingFrame'

import { trustCellPadding } from './TrustSection'

describe('trustCellPadding', () => {
  it('gives the section its edges the frame rhythm on a phone, and the gaps between points less', () => {
    const cells = [0, 1, 2, 3].map((index) => trustCellPadding(index, 4))
    // Stacked: 56px above the first and under the last, 20px between.
    expect(cells[0].pt.base).toBe(SECTION_PY.base)
    expect(cells[0].pb.base).toBe(5)
    expect(cells[1].pt.base).toBe(5)
    expect(cells[2].pb.base).toBe(5)
    expect(cells[3].pt.base).toBe(5)
    expect(cells[3].pb.base).toBe(SECTION_PY.base)
  })

  it('does the same by row in the two-column grid on a tablet', () => {
    const cells = [0, 1, 2, 3].map((index) => trustCellPadding(index, 4))
    // Row one carries the top edge, row two the bottom edge; 32px between rows.
    for (const index of [0, 1]) {
      expect(cells[index].pt.md).toBe(SECTION_PY.md)
      expect(cells[index].pb.md).toBe(8)
    }
    for (const index of [2, 3]) {
      expect(cells[index].pt.md).toBe(8)
      expect(cells[index].pb.md).toBe(SECTION_PY.md)
    }
  })

  it('is the frame rhythm on every cell from lg, where the four sit in one row', () => {
    for (const index of [0, 1, 2, 3]) {
      const { pt, pb } = trustCellPadding(index, 4)
      expect(pt.lg).toBe(SECTION_PY.lg)
      expect(pb.lg).toBe(SECTION_PY.lg)
      expect(pt.xl).toBe(SECTION_PY.xl)
      expect(pb.xl).toBe(SECTION_PY.xl)
    }
  })

  it('treats a short list by its own last point and row', () => {
    // Three points: the third is alone in the second row.
    expect(trustCellPadding(2, 3).pb.base).toBe(SECTION_PY.base)
    expect(trustCellPadding(2, 3).pb.md).toBe(SECTION_PY.md)
    expect(trustCellPadding(1, 3).pb.md).toBe(8)
    // Two points: one row, so both carry both edges on a tablet.
    expect(trustCellPadding(0, 2).pt.md).toBe(SECTION_PY.md)
    expect(trustCellPadding(1, 2).pb.md).toBe(SECTION_PY.md)
  })
})
