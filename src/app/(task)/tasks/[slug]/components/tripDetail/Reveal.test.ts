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

  it('wraps task-detail content and the mobile CTA so skeletons also enter', () => {
    const view = readFileSync(join(dir, 'openTask/TaskDetailView.tsx'), 'utf8')
    const cta = readFileSync(join(dir, 'TaskDetailCtaBar.tsx'), 'utf8')
    expect(view).toContain('<Reveal>')
    expect(view).toContain('TaskDetailSectionTabs')
    expect(cta).toContain('<Reveal>')
  })
})
