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
    const dockSrc = readFileSync(
      join(dir, '../MobileBottomNav/MobileBottomNav.tsx'),
      'utf8',
    )
    expect(src).not.toContain('LanguageSwitcher')
    expect(drawerSrc).not.toContain('LanguageSwitcher')
    // FE-269: Post a task is the dock's centre item, not an account action.
    expect(drawerSrc).not.toContain('postTask')
    expect(menuSrc).toContain('LanguageSwitcher')
    expect(menuSrc).toContain('onOpenLanguage')
    // Phones: the dock's Account item hosts the drawer and the switcher.
    expect(dockSrc).toContain('MobileNavDrawer')
    expect(dockSrc).toContain('LanguageSwitcher')
  })

  it('has no mobile header and no bell (Mobile-Navigation-IA, FE-202)', () => {
    const src = readFileSync(join(dir, 'Header.tsx'), 'utf8')
    expect(src).toContain("display={{ base: 'none', lg: 'flex' }}")
    expect(src).not.toContain('NotificationsBell')
    expect(src).not.toContain('GuestMobileMenu')
  })
})
