import { describe, expect, it } from 'vitest'

import {
  ADMIN_NOTIFICATION_DEFAULTS,
  adminNotificationDraftKey,
  parseAdminNotificationDraft,
  parseUserIds,
} from './adminNotificationDraft'
import { isSlashieAdminEmail } from './isSlashieAdminEmail'

describe('admin notification targeting', () => {
  it('rejects an empty target so nothing can push to everyone', () => {
    const parsed = parseAdminNotificationDraft({
      ...ADMIN_NOTIFICATION_DEFAULTS,
      title: 'Hello',
      body: 'A note',
    })
    expect(parsed.ok).toBe(false)
  })

  it('accepts user ids, cohort keys, or both', () => {
    const users = parseAdminNotificationDraft({
      ...ADMIN_NOTIFICATION_DEFAULTS,
      title: 'Hello',
      body: 'A note',
      userIdsText: 'user-a, user-a\nuser-b',
    })
    expect(users.ok).toBe(true)
    if (users.ok) expect(users.draft.userIds).toEqual(['user-a', 'user-b'])

    const cohort = parseAdminNotificationDraft({
      ...ADMIN_NOTIFICATION_DEFAULTS,
      title: 'Hello',
      body: 'A note',
      cohortKeys: ['founding_workers', 'geo_watford_bushey'],
    })
    expect(cohort.ok).toBe(true)
  })

  it('changes the dry-run key when the audience changes', () => {
    const first = parseAdminNotificationDraft({
      ...ADMIN_NOTIFICATION_DEFAULTS,
      title: 'Hello',
      body: 'A note',
      cohortKeys: ['founding_workers'],
    })
    const second = parseAdminNotificationDraft({
      ...ADMIN_NOTIFICATION_DEFAULTS,
      title: 'Hello',
      body: 'A note',
      cohortKeys: ['geo_watford_bushey'],
    })
    expect(first.ok && second.ok).toBe(true)
    if (first.ok && second.ok) {
      expect(adminNotificationDraftKey(first.draft)).not.toBe(
        adminNotificationDraftKey(second.draft),
      )
    }
  })

  it('parses ids without treating blank input as everyone', () => {
    expect(parseUserIds('  , \n ')).toEqual([])
  })
})

describe('isSlashieAdminEmail', () => {
  it('allows slashie.app addresses only', () => {
    expect(isSlashieAdminEmail('ops@slashie.app')).toBe(true)
    expect(isSlashieAdminEmail(' Ops@Slashie.app ')).toBe(true)
    expect(isSlashieAdminEmail('ops@slashie.app.evil.com')).toBe(false)
    expect(isSlashieAdminEmail('person@example.com')).toBe(false)
    expect(isSlashieAdminEmail(null)).toBe(false)
  })
})
