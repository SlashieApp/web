import { describe, expect, it } from 'vitest'

import { registerFormSchema } from './registerFormSchema'

const valid = {
  fullName: 'Alex Chen',
  email: 'alex@example.com',
  password: 'password1',
  confirmPassword: 'password1',
  marketingOptIn: false,
}

describe('registerFormSchema', () => {
  it('accepts the fields alone: age and Terms are the consent line above every way in (FE-563)', () => {
    expect(registerFormSchema.safeParse(valid).success).toBe(true)
  })

  it('leaves marketing email opt-in, unticked by default', () => {
    expect(
      registerFormSchema.safeParse({ ...valid, marketingOptIn: true }).success,
    ).toBe(true)
  })

  it('asks for a name, a valid email and 8 characters', () => {
    const result = registerFormSchema.safeParse({
      ...valid,
      fullName: ' ',
      email: 'alex',
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const errors = result.error.flatten().fieldErrors
    expect(errors.fullName?.[0]).toBe('fullNameRequired')
    expect(errors.email?.[0]).toBe('emailInvalid')
    expect(errors.password?.[0]).toBe('passwordTooShort')
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
