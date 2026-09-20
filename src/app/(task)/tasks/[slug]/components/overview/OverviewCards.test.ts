import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('OverviewCards layout', () => {
  it('puts pricing first, then details, then photos; owner on the sidebar', () => {
    const src = readFileSync(join(dir, 'OverviewCards.tsx'), 'utf8')
    expect(src.indexOf('<TaskPricingCard />')).toBeLessThan(
      src.indexOf('<TaskDetailsCard />'),
    )
    expect(src.indexOf('<TaskDetailsCard />')).toBeLessThan(
      src.indexOf('<PhotosCard />'),
    )
    expect(src.indexOf('<TaskActivitySections />')).toBeGreaterThan(
      src.indexOf('<PhotosCard />'),
    )
    expect(src.indexOf('<TaskHelpCard />')).toBeLessThan(
      src.indexOf('<TaskActivitySections />'),
    )
    expect(src.indexOf('id="owner"')).toBeGreaterThan(
      src.indexOf('<PhotosCard />'),
    )
    expect(src).toContain('<TaskOwnerCard />')
    expect(src).toContain('sectionFlowCss')
    expect(src).not.toContain('TaskShareCard')
    expect(src).not.toContain('tabTitle')
  })

  it('hides the in-flow twin when a card is pinned; spacer lives on the view', () => {
    const sections = readFileSync(join(dir, 'OverviewCards.tsx'), 'utf8')
    const view = readFileSync(join(dir, '../layout/TaskDetailView.tsx'), 'utf8')
    expect(sections).toContain('sectionFlowCss')
    expect(sections).toContain(
      'Hide the in-flow twin when that section is the mobile pin',
    )
    expect(view).toContain('taskDetailPinClearance')
    expect(view).toContain('TaskDetailTabs')
  })

  it('merges quote CTAs onto the pricing card, not a separate thin bar', () => {
    const pricing = readFileSync(join(dir, 'TaskPricingCard.tsx'), 'utf8')
    expect(pricing).toContain('t.cta.sendQuote')
    expect(pricing).toContain('t.cta.signInToQuote')
    expect(pricing).toContain('SafetyNotice')
  })
})
