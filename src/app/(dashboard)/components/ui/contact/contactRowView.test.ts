import { LoginMethod } from '@codegen/schema'
import { afterAll, describe, expect, it } from 'vitest'

import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'

import {
  CONTACT_ROW_VIEWS,
  type ContactRowView,
  getEmailRowView,
  getPhoneRowView,
} from './contactRowView'

const PHONE = '+447700900123'
const seen = new Set<ContactRowView>()
const email = (...args: Parameters<typeof storyMe>) => {
  const view = getEmailRowView(storyMe(...args))
  seen.add(view)
  return view
}
const phone = (...args: Parameters<typeof storyMe>) => {
  const view = getPhoneRowView(storyMe(...args))
  seen.add(view)
  return view
}

describe('the email row', () => {
  it('offers Change on a verified password account', () => {
    expect(email()).toBe('emailVerified')
  })

  it('locks the email on a Google-only account', () => {
    expect(email({ enabledLoginMethods: [LoginMethod.Google] })).toBe(
      'emailLocked',
    )
  })

  it('offers Verify while the email is unconfirmed', () => {
    expect(email({ emailVerified: false })).toBe('emailUnverified')
  })

  it('shows the pending change while the new link is unopened', () => {
    expect(email({ pendingEmail: 'new@example.com' })).toBe('emailPending')
  })
})

describe('the phone row', () => {
  it('offers Add phone when there is no number', () => {
    expect(phone()).toBe('phoneMissing')
  })

  it('offers Verify for a saved, unconfirmed number', () => {
    expect(phone({ profile: { contactNumber: PHONE } })).toBe('phoneUnverified')
  })

  it('offers Change for a verified number', () => {
    expect(
      phone({ phoneVerified: true, profile: { contactNumber: PHONE } }),
    ).toBe('phoneVerified')
  })

  it('shows the pending change while the new code is unentered', () => {
    expect(
      phone({
        phoneVerified: true,
        pendingPhone: '+447700900456',
        profile: { contactNumber: PHONE },
      }),
    ).toBe('phonePending')
  })
})

// Every row view in the registry is reached by at least one test above.
afterAll(() => {
  expect([...seen].sort()).toEqual(Object.keys(CONTACT_ROW_VIEWS).sort())
})
