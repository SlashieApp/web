import { LoginMethod } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import type { MeSnapshot } from '@/app/(auth)/store/user'

import { canChangeEmail, pendingEmailChange } from './emailVerification'
import { pendingPhoneChange } from './phoneVerification'

function me(overrides: Partial<MeSnapshot>): MeSnapshot {
  return {
    email: 'sam@example.com',
    enabledLoginMethods: [LoginMethod.Password],
    pendingEmail: null,
    pendingPhone: null,
    profile: { contactNumber: '+447700900123' },
    ...overrides,
  } as MeSnapshot
}

describe('pendingPhoneChange', () => {
  it('returns a different pending number', () => {
    expect(pendingPhoneChange(me({ pendingPhone: '+447700900456' }))).toBe(
      '+447700900456',
    )
  })

  it("ignores the saved number's own first-time code, in any format", () => {
    expect(pendingPhoneChange(me({ pendingPhone: '+447700900123' }))).toBe('')
    expect(
      pendingPhoneChange(
        me({
          pendingPhone: '+447700900123',
          profile: { contactNumber: '07700 900123' } as MeSnapshot['profile'],
        }),
      ),
    ).toBe('')
    expect(pendingPhoneChange(me({}))).toBe('')
  })
})

describe('email change', () => {
  it('reads the pending address', () => {
    expect(pendingEmailChange(me({ pendingEmail: 'new@example.com' }))).toBe(
      'new@example.com',
    )
    expect(pendingEmailChange(me({}))).toBe('')
  })

  it('is for password accounts only', () => {
    expect(canChangeEmail(me({}))).toBe(true)
    expect(
      canChangeEmail(me({ enabledLoginMethods: [LoginMethod.Google] })),
    ).toBe(false)
  })
})
