import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('AppShellBody main pane', () => {
  it('overlays the task-detail scrollbar so content matches the fixed map', () => {
    const src = readFileSync(join(dir, 'AppShellBody.tsx'), 'utf8')
    expect(src).toContain('OVERLAY_PANE_SCROLLBAR_CSS')
    expect(src).toContain('hideMobileNav ? OVERLAY_PANE_SCROLLBAR_CSS')
    expect(src).toContain("scrollbarWidth: 'none'")
    expect(src).toContain("'&::-webkit-scrollbar'")
    expect(src).toContain('overflowX="clip"')
    expect(src).toContain('overflowY="auto"')
    expect(src).toContain("overflowAnchor: 'none'")
    expect(src).toContain('data-header-hidden')
    expect(src).toContain("hidden ? 'translateY(-100%)' : 'translateY(0)'")
    expect(src).toContain('HEADER_SLOT_MAX_H')
    expect(src).toContain(
      'style={{ maxHeight: hidden ? 0 : HEADER_SLOT_MAX_H }}',
    )
  })
})
