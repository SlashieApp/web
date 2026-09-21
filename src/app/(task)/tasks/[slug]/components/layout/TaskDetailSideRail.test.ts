import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('TaskDetailSideRail', () => {
  it('hosts Help and Activity outside the tab body', () => {
    const src = readFileSync(join(dir, 'TaskDetailSideRail.tsx'), 'utf8')
    expect(src).toContain('<TaskHelpCard />')
    expect(src).toContain('<TaskActivitySections />')
    expect(src).not.toContain('TaskDetailMainCta')
  })
})

describe('TaskActivityTrigger', () => {
  it('opens Activity in a drawer from a compact icon button', () => {
    const src = readFileSync(join(dir, 'TaskActivityTrigger.tsx'), 'utf8')
    expect(src).toContain('t.nav.taskActivityAria')
    expect(src).toContain('LuHistory')
    expect(src).toContain('Drawer')
    expect(src).toContain('<TaskActivitySections />')
  })
})

describe('TaskTitle compact actions', () => {
  it('shows Activity and options icons on compact, not on web', () => {
    const src = readFileSync(join(dir, 'TaskTitle.tsx'), 'utf8')
    expect(src).toContain('TaskActivityTrigger')
    expect(src).toContain('TaskHelpOverflowTrigger')
    expect(src).toContain("display={{ base: 'flex', lg: 'none' }}")
    expect(src).toContain('TaskDetailMeta')
    expect(src).toContain('isStuck ? null')
    expect(src).toContain('COMPACT_TITLE_OFFSET')
    expect(src).toContain('flex="0 1 auto"')
  })
})
