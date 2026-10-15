import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('Reveal surface enter', () => {
  it('fades the whole section up from the bottom on first paint', () => {
    const src = readFileSync(join(dir, 'Reveal.tsx'), 'utf8')
    expect(src).toContain('transform: `translateY(${SURFACE_ENTER_OFFSET})`')
    expect(src).toContain("'@starting-style'")
    expect(src).toContain('opacity: 0')
    expect(src).toContain('prefers-reduced-motion')
    expect(src).toContain('sdlMotion.duration.slow')
  })

  it('wraps task-detail content and the compact CTA so skeletons also enter', () => {
    const view = readFileSync(join(dir, 'TaskDetailView.tsx'), 'utf8')
    const tabs = readFileSync(join(dir, 'TaskDetailTabs.tsx'), 'utf8')
    const cta = readFileSync(join(dir, 'TaskDetailMainCta.tsx'), 'utf8')
    expect(view).toContain('<Reveal>')
    expect(view).toContain('TaskDetailTabs')
    expect(view).not.toContain('TaskDetailMainCta')
    expect(tabs).toContain('<TaskDetailMainCta />')
    expect(cta).toContain('<Reveal>')
    expect(cta).toContain('mainCta')
    expect(cta).toContain('data-task-detail-main-cta')
    expect(cta).toContain('position="fixed"')
    expect(cta).toContain('createPortal')
  })
})
