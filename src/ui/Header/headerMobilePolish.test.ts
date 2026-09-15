import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('Header mobile polish', () => {
  it('hides the toolbar language switcher below md and keeps it in nav drawers', () => {
    const src = readFileSync(join(dir, 'Header.tsx'), 'utf8')
    const drawerSrc = readFileSync(
      join(dir, 'account/MobileNavDrawer.tsx'),
      'utf8',
    )
    expect(src).toContain("display={{ base: 'none', md: 'inline-flex' }}")
    expect(src).toContain('<LanguageSwitcher />')
    expect(src).toContain('GuestMobileMenu')
    expect(drawerSrc).toContain('<LanguageSwitcher />')
  })
})
