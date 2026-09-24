import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_NAV } from '@/utils/accountNav'

import { ACCOUNT_NAV_ITEMS, resolveAccountNavItems } from './accountNav.config'

const dir = dirname(fileURLToPath(import.meta.url))

describe('account nav destinations', () => {
  it('includes every dashboard hub href from ACCOUNT_NAV', () => {
    const hrefs = new Set(
      ACCOUNT_NAV_ITEMS.filter((item) => item.kind === 'link' && item.href).map(
        (item) => item.href,
      ),
    )
    for (const item of ACCOUNT_NAV) {
      expect(hrefs.has(item.href)).toBe(true)
    }
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
    expect(language?.section).toBe('account')
  })

  it('shows send-a-notification only for Slashie admins', () => {
    const hidden = resolveAccountNavItems(true).some(
      (item) => item.id === 'admin-notifications',
    )
    const shown = resolveAccountNavItems(false, { isAdmin: true }).some(
      (item) => item.href === '/admin/notifications',
    )
    expect(hidden).toBe(false)
    expect(shown).toBe(true)
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
