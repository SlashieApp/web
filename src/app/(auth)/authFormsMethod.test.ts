import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const AUTH_FORMS = [
  'login/components/LoginPanel.tsx',
  'register/components/RegisterScreen.tsx',
  'reset-password/components/ResetPasswordScreen.tsx',
  'forgot-password/components/ui/ForgotPasswordForm.tsx',
]

describe('sign-in forms (FE-423)', () => {
  it.each(AUTH_FORMS)(
    '%s posts, so a submit before hydration never puts details in the URL',
    (file) => {
      const src = readFileSync(
        join(process.cwd(), 'src/app/(auth)', file),
        'utf8',
      )
      expect(src).toMatch(/(<form|as="form")[^>]*method="post"/)
    },
  )
})
