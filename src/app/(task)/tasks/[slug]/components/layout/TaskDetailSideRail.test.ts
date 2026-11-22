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
      src.indexOf('<TaskActivityCard />'),
    )
    expect(src).toContain('<TaskHelpCard />')
    expect(src).toContain('<TaskActivityCard />')
    expect(src).not.toContain('TaskDetailMainCta')
  })
})

describe('TaskActivityTrigger', () => {
  it('opens the Activity log in a bottom sheet from a section card, like Analytics', () => {
    const src = readFileSync(join(dir, 'TaskActivityTrigger.tsx'), 'utf8')
    const analytics = readFileSync(
      join(dir, '../analytics/AnalyticsCards.tsx'),
      'utf8',
    )
    expect(src).toContain('LuHistory')
    expect(src).toContain('<TaskSectionSheet')
    expect(src).toContain('<TaskActivityLog')
    expect(analytics).toContain('<TaskSectionSheet')
  })
})

describe('TaskTitle', () => {
  it('is the page h1, with the status pill after it: Back and the options menu are in the bar (FE-458)', () => {
    const src = readFileSync(join(dir, 'TaskTitle.tsx'), 'utf8')
    expect(src).not.toContain('TaskActivityTrigger')
    // 22 Nov: the status pill follows the title on the same line (it was the
    // Task summary's eyebrow).
    expect(src).toContain('<StickyHeaderTitle\n      after={')
    expect(src).toContain(
      '{pill ? <TaskStatusPill status={pill} size="sm" /> : null}',
    )
    const summary = readFileSync(
      join(dir, '../summary/TaskSummary.tsx'),
      'utf8',
    )
    expect(summary).not.toContain('<TaskStatusPill')
    expect(src).toContain('StickyHeaderTitle')
    expect(src).not.toContain('TaskHelpOverflowTrigger')
    expect(src).not.toContain('TaskBackButton')
    expect(src).not.toContain('isStuck')
    // 22 Nov: no row of shortcut chips under the title, here or in the tabs.
    expect(src).not.toContain('TaskDetailMeta')
    const tabs = readFileSync(join(dir, 'TaskDetailTabs.tsx'), 'utf8')
    expect(tabs).not.toContain('TaskDetailMeta')
    expect(tabs).not.toContain('meta=')
    const view = readFileSync(join(dir, 'TaskDetailView.tsx'), 'utf8')
    expect(view).toContain('TaskHelpOverflowTrigger')
  })
})
