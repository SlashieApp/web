import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_NAV } from '@/utils/accountNav'

import { ACCOUNT_NAV_ITEMS } from './accountNav.config'

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

  it('labels quotes as My quotes rather than Jobs', () => {
    const quotes = ACCOUNT_NAV_ITEMS.find((item) => item.href === '/quotes')
    expect(quotes?.id).toBe('quotes')
    expect(quotes?.label).toBe('My quotes')
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
