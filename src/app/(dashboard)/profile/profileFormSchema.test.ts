import { TaskContactMethod } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import { profileApiFormSchema } from './profileFormSchema'

const valid = {
  displayName: 'Alex Chen',
  dateOfBirth: '',
  defaultPreferredContactMethod: TaskContactMethod.InApp,
}

describe('profileApiFormSchema', () => {
  it('allows an empty date of birth', () => {
    expect(profileApiFormSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects an under-18 self-report', () => {
    const result = profileApiFormSchema.safeParse({
      ...valid,
      dateOfBirth: '2015-01-01',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.flatten().fieldErrors.dateOfBirth?.[0]).toMatch(/18/)
  })

  it('accepts an adult date of birth', () => {
    expect(
      profileApiFormSchema.safeParse({
        ...valid,
        dateOfBirth: '1990-04-12',
      }).success,
    ).toBe(true)
  })
})
