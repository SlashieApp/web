import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('TaskDetailSideRail', () => {
  it('hosts Help, then owner Analytics, then Activity outside the tab body', () => {
    const src = readFileSync(join(dir, 'TaskDetailSideRail.tsx'), 'utf8')
    expect(src).not.toContain('TaskPricingCard')
    expect(src.indexOf('<TaskHelpCard />')).toBeLessThan(
      src.indexOf('<AnalyticsCards />'),
    )
    expect(src.indexOf('<AnalyticsCards />')).toBeLessThan(
      src.indexOf('<TaskActivitySections />'),
    )
    expect(src).toContain('<TaskHelpCard />')
    expect(src).toContain('<TaskActivitySections />')
    expect(src).not.toContain('TaskDetailMainCta')
  })
})

describe('TaskActivityTrigger', () => {
  it('opens Activity in a bottom sheet from a section card, like Analytics', () => {
    const src = readFileSync(join(dir, 'TaskActivityTrigger.tsx'), 'utf8')
    const analytics = readFileSync(
      join(dir, '../analytics/AnalyticsCards.tsx'),
      'utf8',
    )
    expect(src).toContain('LuHistory')
    expect(src).toContain('<TaskSectionSheet')
    expect(src).toContain('<ActivitySteps')
    expect(analytics).toContain('<TaskSectionSheet')
  })
})

describe('TaskTitle compact actions', () => {
  it('shows the options icon on compact, not on web; Activity is an Overview card', () => {
    const src = readFileSync(join(dir, 'TaskTitle.tsx'), 'utf8')
    expect(src).not.toContain('TaskActivityTrigger')
    expect(src).toContain('TaskHelpOverflowTrigger')
    expect(src).toContain("display={{ base: 'flex', lg: 'none' }}")
    expect(src).toContain('TaskDetailMeta')
    expect(src).toContain('isStuck ? null')
    expect(src).toContain('COMPACT_TITLE_OFFSET')
    expect(src).toContain('flex="0 1 auto"')
  })
})
