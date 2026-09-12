import { describe, expect, it } from 'vitest'

import { registerFormSchema } from './registerFormSchema'

const valid = {
  fullName: 'Alex Chen',
  email: 'alex@example.com',
  password: 'password1',
  confirmPassword: 'password1',
  isOver18: true,
  agreedToTerms: true,
}

describe('registerFormSchema', () => {
  it('accepts an explicit 18+ confirmation', () => {
    expect(registerFormSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects an unticked 18+ checkbox', () => {
    const result = registerFormSchema.safeParse({ ...valid, isOver18: false })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.flatten().fieldErrors.isOver18?.[0]).toMatch(/18/)
  })

  it('rejects missing Terms agreement', () => {
    const result = registerFormSchema.safeParse({
      ...valid,
      agreedToTerms: false,
    })
    expect(result.success).toBe(false)
  })
})
