import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('TaskDetailMainCta pin', () => {
  it('pins every CTA card in compact chrome with the action on the right', () => {
    const src = readFileSync(join(dir, 'TaskDetailMainCta.tsx'), 'utf8')
    expect(src).toContain('<TaskPricingCard compact />')
    expect(src).toContain('<TaskShareCard compact />')
    expect(src).toContain('<TaskOwnerCard compact />')
    expect(src).toContain('TaskDetailPinCard')
    expect(src).toContain('size="sm"')
    expect(src).not.toContain('variant="stickyBar"')
    expect(src).toContain('WEB_MQ')
    expect(src).toContain('insetX={0}')
    expect(src).toContain('position="fixed"')
    expect(src).toContain('data-task-detail-main-cta')
    expect(src).toContain('data-task-detail-main-cta-fade')
    expect(src).toContain('linear-gradient(to top')
    expect(src).toContain('#FFFFFF')
  })
})
