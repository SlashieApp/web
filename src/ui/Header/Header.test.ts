import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('Header mobile polish', () => {
  it('keeps language out of the nav toolbar and inside the account menu', () => {
    const src = readFileSync(join(dir, 'Header.tsx'), 'utf8')
    const drawerSrc = readFileSync(
      join(dir, 'account/MobileNavDrawer.tsx'),
      'utf8',
    )
    const menuSrc = readFileSync(join(dir, 'account/AccountMenu.tsx'), 'utf8')
    expect(src).not.toContain('LanguageSwitcher')
    expect(src).toContain('GuestMobileMenu')
    expect(drawerSrc).not.toContain('LanguageSwitcher')
    expect(menuSrc).toContain('LanguageSwitcher')
    expect(menuSrc).toContain('onOpenLanguage')
  })
})
