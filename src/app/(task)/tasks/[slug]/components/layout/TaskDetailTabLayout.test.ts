import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('TaskDetailTabLayout slots', () => {
  it('uses a full-width header surface when stuck, without a fade over cards', () => {
    const src = readFileSync(join(dir, 'TaskDetailTabLayout.tsx'), 'utf8')
    expect(src).toContain("stickyBg={isStuck ? 'bg.surface' : 'transparent'}")
    expect(src).toContain("panelBg={{ base: 'bg.canvas', lg: 'transparent' }}")
    expect(src).toContain("width: '100vw'")
    expect(src).toContain('borderRadius: 0')
    expect(src).toContain('&::before')
    expect(src).not.toContain('&::after')
    expect(src).toContain('fadeTabListBorder')
    expect(src).toContain('tabTitle')
    expect(src).toContain('tabDescription')
    expect(src).toContain('tabIconButton')
    expect(src).toContain('mainCta')
    expect(src).toContain('WEB_MQ')
    expect(src).toContain('data-task-detail-main-cta')
  })
})
