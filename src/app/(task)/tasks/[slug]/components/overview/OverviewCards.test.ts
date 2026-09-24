import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('OverviewCards layout', () => {
  it('stacks pricing, details, photos, then owner in a single column', () => {
    const src = readFileSync(join(dir, 'OverviewCards.tsx'), 'utf8')
    expect(src.indexOf('<BookingSection />')).toBeLessThan(
      src.indexOf('<TaskPricingCard />'),
    )
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
    expect(src).toContain('hideOverviewCards')
    expect(src).not.toContain('TaskShareCard')
    expect(src).not.toContain('TaskHelpCard')
    expect(src).not.toContain('TaskActivitySections')
    expect(src).not.toContain('tabTitle')
    expect(src).not.toContain('templateColumns')
  })

  it('hides overview cards the main CTA already shows; spacer lives on the view', () => {
    const sections = readFileSync(join(dir, 'OverviewCards.tsx'), 'utf8')
    const view = readFileSync(join(dir, '../layout/TaskDetailView.tsx'), 'utf8')
    expect(sections).toContain('hideOverviewCards')
    expect(sections).toContain('hidePrice')
    expect(sections).toContain('permissions.isAwarded')
    expect(sections).toContain('permissions.isJobCompleted')
    expect(sections).toContain('permissions.isCancelled')
    expect(sections).toContain("hidden.has('owner')")
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
