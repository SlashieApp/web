import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('TaskDetailSectionTabs sticky chrome', () => {
  it('uses a full-width header surface when stuck, without a fade over cards', () => {
    const src = readFileSync(join(dir, 'TaskDetailSectionTabs.tsx'), 'utf8')
    expect(src).toContain("stickyBg={isStuck ? 'bg.surface' : 'transparent'}")
    expect(src).toContain("panelBg={{ base: 'bg.canvas', lg: 'transparent' }}")
    expect(src).toContain("width: '100vw'")
    expect(src).toContain('borderRadius: 0')
    expect(src).toContain('&::before')
    expect(src).not.toContain('&::after')
    expect(src).toContain('fadeTabListBorder')
    expect(src).toContain('TASK_DETAIL_TAB.overview')
    expect(src).toContain('TASK_DETAIL_TAB.quotes')
    expect(src).not.toContain('TASK_DETAIL_TAB.activity')
    expect(src).not.toContain('TaskActivitySections')
  })
})
