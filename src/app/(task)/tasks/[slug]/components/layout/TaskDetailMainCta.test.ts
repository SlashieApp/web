import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('TaskDetailMainCta pin', () => {
  it('pins compact to the viewport and the web card beside TabIntro, with no placement prop', () => {
    const src = readFileSync(join(dir, 'TaskDetailMainCta.tsx'), 'utf8')
    expect(src).toContain('<TaskPricingCard compact={compact} rail={web} />')
    expect(src).toContain('<TaskShareCard compact={compact} rail={web} />')
    expect(src).toContain('<TaskOwnerCard compact={compact} rail={web} />')
    expect(src).toContain('<TaskDetailCompletionBar web={web} />')
    expect(src).toContain("surface: 'pin' | 'web'")
    expect(src).not.toContain('placement')
    expect(src).toContain('TaskDetailMainCtaCard')
    expect(src).not.toContain('LuPencil')
    expect(src).toContain('TaskDetailPinCard')
    expect(src).toContain('size="sm"')
    expect(src).not.toContain('variant="stickyBar"')
    expect(src).toContain('WEB_MQ')
    expect(src).toContain('insetX={0}')
    expect(src).toContain('position="fixed"')
    expect(src).toContain('createPortal')
    expect(src).toContain('useIsBrowser')
    expect(src).toContain('data-task-detail-main-cta')
    expect(src).toContain('data-task-detail-main-cta-fade')
    expect(src).not.toContain('data-task-detail-main-cta-placement')
    expect(src).toContain('linear-gradient(to top')
    expect(src).toContain('#FFFFFF')
  })
})
