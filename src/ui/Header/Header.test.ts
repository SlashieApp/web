import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('Header mobile polish', () => {
  it('keeps the toolbar language icon at every breakpoint and in nav drawers', () => {
    const src = readFileSync(join(dir, 'Header.tsx'), 'utf8')
    const drawerSrc = readFileSync(
      join(dir, 'account/MobileNavDrawer.tsx'),
      'utf8',
    )
    expect(src).toContain('<LanguageSwitcher />')
    expect(src).toContain('GuestMobileMenu')
    expect(drawerSrc).toContain('<LanguageSwitcher />')
  })
})
