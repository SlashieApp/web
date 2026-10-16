import { describe, expect, it } from 'vitest'

import { registerFormSchema } from './registerFormSchema'

const valid = {
  fullName: 'Alex Chen',
  email: 'alex@example.com',
  password: 'password1',
  confirmPassword: 'password1',
  isOver18: true,
  agreedToTerms: true,
  marketingOptIn: false,
}

describe('registerFormSchema', () => {
  it('accepts an explicit 18+ confirmation', () => {
    expect(registerFormSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects an unticked 18+ checkbox', () => {
    const result = registerFormSchema.safeParse({ ...valid, isOver18: false })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.flatten().fieldErrors.isOver18?.[0]).toBe(
      'over18Required',
    )
  })

  it('rejects missing Terms agreement', () => {
    const result = registerFormSchema.safeParse({
      ...valid,
      agreedToTerms: false,
      marketingOptIn: false,
    })
    expect(result.success).toBe(false)
  })

  it('asks for matching passwords', () => {
    const result = registerFormSchema.safeParse({
      ...valid,
      confirmPassword: 'password2',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.flatten().fieldErrors.confirmPassword?.[0]).toBe(
      'passwordsDontMatch',
    )
  })
})
