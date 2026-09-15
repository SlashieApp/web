import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('TaskDetailSectionTabs sticky chrome', () => {
  it('keeps sticky chrome transparent and a solid mobile panel surface', () => {
    const src = readFileSync(join(dir, 'TaskDetailSectionTabs.tsx'), 'utf8')
    expect(src).toContain('stickyBg="transparent"')
    expect(src).toContain("panelBg={{ base: 'bg.canvas', lg: 'transparent' }}")
  })
})
