import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_NAV_ITEMS, resolveAccountNavItems } from './accountNav.config'

const dir = dirname(fileURLToPath(import.meta.url))

describe('account nav destinations', () => {
  it('names the settings pages the way their headings do', () => {
    const labelOf = (href: string) =>
      ACCOUNT_NAV_ITEMS.find((item) => item.href === href)?.label
    expect(labelOf('/profile')).toBe('Profile')
    expect(labelOf('/account')).toBe('Account')
    expect(labelOf('/billing')).toBe('Plan & billing')
    expect(labelOf('/search')).toBe('Search')
    expect(labelOf('/about')).toBe('About')
  })

  it('links My tasks to the hub rather than requests or quotes', () => {
    const myTasks = ACCOUNT_NAV_ITEMS.find((item) => item.href === '/tasks')
    expect(myTasks?.id).toBe('my-tasks')
    expect(myTasks?.label).toBe('My tasks')
    expect(ACCOUNT_NAV_ITEMS.some((item) => item.href === '/requests')).toBe(
      false,
    )
    expect(ACCOUNT_NAV_ITEMS.some((item) => item.href === '/quotes')).toBe(
      false,
    )
  })

  it('opens language from the account menu', () => {
    const language = ACCOUNT_NAV_ITEMS.find((item) => item.id === 'language')
    expect(language?.kind).toBe('action')
    expect(language?.action).toBe('language')
    expect(language?.section).toBe('more')
  })

  // Staff tools live in the admin panel (FE-612), never in this menu.
  it('has no admin entries', () => {
    for (const item of ACCOUNT_NAV_ITEMS) {
      expect(item.id).not.toMatch(/admin/i)
      expect(item.href ?? '').not.toMatch(/^\/admin(?:\/|$)/)
      expect(['all', 'worker', 'non-worker']).toContain(item.audience)
    }
  })

  it('keeps Terms, Privacy and Cookie settings in the menu, since the app has no footer', () => {
    const items = resolveAccountNavItems(false)
    const terms = items.find((item) => item.id === 'terms')
    const privacy = items.find((item) => item.id === 'privacy')
    const cookies = items.find((item) => item.id === 'cookie-settings')
    expect(terms?.href).toBe('/terms')
    expect(privacy?.href).toBe('/privacy')
    expect(cookies?.kind).toBe('action')
    expect(cookies?.action).toBe('cookieSettings')
    expect(
      [terms, privacy, cookies].every((item) => item?.section === 'more'),
    ).toBe(true)
  })

  it('includes a Send feedback action for signed-in users', () => {
    const feedback = ACCOUNT_NAV_ITEMS.find((item) => item.id === 'feedback')
    expect(feedback?.kind).toBe('action')
    expect(feedback?.action).toBe('feedback')
    expect(feedback?.label).toBe('Send feedback')
  })
})

describe('Header chrome', () => {
  it('does not mount dashboard section switcher chrome', () => {
    const src = readFileSync(join(dir, '../Header.tsx'), 'utf8')
    expect(src).not.toContain('DashboardSectionMenuButton')
    expect(src).not.toContain('DashboardContextLabel')
    expect(src).not.toContain('DashboardSectionDrawer')
    expect(src).not.toContain('isAccountHubPath')
  })
})
