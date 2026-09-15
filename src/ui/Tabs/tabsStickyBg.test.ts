import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('Tabs sticky background', () => {
  it('defaults sticky chrome to the canvas and allows an override', () => {
    const src = readFileSync(join(dir, 'Tabs.tsx'), 'utf8')
    expect(src).toContain('stickyBg')
    expect(src).toContain("sticky ? (stickyBg ?? 'bg.canvas')")
    expect(src).toContain('panelBg')
  })
})
