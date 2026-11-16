import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const read = (file: string) =>
  readFileSync(join(process.cwd(), 'src/app', file), 'utf8')

/**
 * Sign-up consent (BE-128, FE-570): only the screens that show the consent
 * line send it, so what the API records is what the person saw.
 */
describe('sign-up consent is sent only where the line shows', () => {
  it.each([
    '(auth)/login/components/LoginPanel.tsx',
    '(auth)/register/components/RegisterScreen.tsx',
  ])('%s shows the line and its Google and Apple send consent', (file) => {
    const src = read(file)
    expect(src).toContain('<ConsentLine />')
    expect(src).toMatch(/<GoogleAuthButton[^>]*\bconsent\b[^>]*\/>/)
    expect(src).toMatch(/<AppleAuthButton[^>]*\bconsent\b[^>]*\/>/)
  })

  it('Sign up with email sends consent with the Terms version', () => {
    expect(read('(auth)/register/components/RegisterScreen.tsx')).toContain(
      'consent: signUpConsent()',
    )
    expect(read('(auth)/register/graphql/Register.gql')).toContain(
      'consent: $consent',
    )
  })

  it('Google and Apple sign-in carry consent only when asked', () => {
    for (const doc of ['LoginWithGoogle.gql', 'LoginWithApple.gql']) {
      expect(read(`(auth)/login/graphql/${doc}`)).toContain('consent: $consent')
    }
    const store = read('(auth)/store/user.ts')
    expect(
      store.match(/options\?\.consent \? \{ consent: signUpConsent\(\) \}/g),
    ).toHaveLength(2)
  })

  it('re-auth while signed in shows no line and sends none', () => {
    const src = read('(dashboard)/account/components/ui/ReauthPrompt.tsx')
    expect(src).not.toContain('ConsentLine')
    expect(src).not.toMatch(/\bconsent\b/)
  })
})
