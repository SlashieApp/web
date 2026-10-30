import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { pinnedBarClearance } from '@/theme/styles'

const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8')

describe('the pinned DrawerBar and keyboard focus (WCAG 2.4.11)', () => {
  const drawer = read('src/ui/Drawer/Drawer.tsx')
  const bar = read('src/ui/Drawer/DrawerBar.tsx')

  it('the bar marks itself, and a body that holds one keeps focus above it', () => {
    expect(bar).toContain("export const DRAWER_BAR_ATTR = 'data-drawer-bar'")
    expect(bar).toContain('[DRAWER_BAR_ATTR]')
    expect(drawer).toContain('&:has([${DRAWER_BAR_ATTR}])')
    expect(drawer).toContain('scrollPaddingBottom: `${pinnedBarClearance}px`')
    // Not while focus is in the bar: its buttons sit in the padding, and
    // focusing one would scroll the body to its end.
    expect(drawer).toContain(':not(:has([${DRAWER_BAR_ATTR}]:focus-within))')
  })

  it('the padding is the bar (48 and 16) and the 20 above it', () => {
    expect(pinnedBarClearance).toBe(84)
    // The bar's own bottom padding is the 16 (`pb={4}`).
    expect(bar).toContain('pb={4}')
  })
})
