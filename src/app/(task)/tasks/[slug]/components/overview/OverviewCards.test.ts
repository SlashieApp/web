import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('OverviewCards layout', () => {
  it('stacks pricing, details, photos, then owner in a single column', () => {
    const src = readFileSync(join(dir, 'OverviewCards.tsx'), 'utf8')
    expect(src.indexOf('<TaskPricingCard />')).toBeLessThan(
      src.indexOf('<TaskDetailsCard />'),
    )
    expect(src.indexOf('<TaskDetailsCard />')).toBeLessThan(
      src.indexOf('<PhotosCard />'),
    )
    expect(src.indexOf('<PhotosCard />')).toBeLessThan(
      src.indexOf('<TaskOwnerCard />'),
    )
    expect(src).toContain('<TaskOwnerCard />')
    expect(src).toContain('sectionFlowCss')
    expect(src).not.toContain('TaskShareCard')
    expect(src).not.toContain('TaskHelpCard')
    expect(src).not.toContain('TaskActivitySections')
    expect(src).not.toContain('tabTitle')
    expect(src).not.toContain('templateColumns')
  })

  it('hides the in-flow twin when a card is pinned; spacer lives on the view', () => {
    const sections = readFileSync(join(dir, 'OverviewCards.tsx'), 'utf8')
    const view = readFileSync(join(dir, '../layout/TaskDetailView.tsx'), 'utf8')
    expect(sections).toContain('sectionFlowCss')
    expect(sections).toContain(
      'Hide the in-flow twin when that section is the mobile pin or the web rail CTA',
    )
    expect(view).toContain('taskDetailPinClearance')
    expect(view).toContain('TaskDetailTabs')
  })

  it('merges quote CTAs onto the pricing card, not a separate thin bar', () => {
    const pricing = readFileSync(join(dir, 'TaskPricingCard.tsx'), 'utf8')
    expect(pricing).toContain('t.cta.sendQuote')
    expect(pricing).toContain('t.cta.signInToQuote')
    expect(pricing).toContain('SafetyNotice')
    expect(pricing).toContain('TaskDetailSplitCta')
    expect(pricing).toContain('eyebrow={t.details.budget}')
  })
})
