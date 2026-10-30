import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * The account dialogs on the form spacing (wiki: Foundations-Form-Spacing,
 * FE-481 account-dialogs). The gaps are measured in each dialog's stories; these
 * pin that the numbers come from the form pieces and tokens, so a screen does
 * not go back to typing its own steps.
 */
const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8')

const VERIFICATION = 'src/app/(dashboard)/components/ui/verification'
const ACCOUNT = 'src/app/(dashboard)/account/components/ui'

const DIALOGS = {
  EmailChangeModal: read(`${VERIFICATION}/EmailChangeModal.tsx`),
  EmailVerificationModal: read(`${VERIFICATION}/EmailVerificationModal.tsx`),
  PhoneVerificationModal: read(`${VERIFICATION}/PhoneVerificationModal.tsx`),
  AccountPasswordDialog: read(`${ACCOUNT}/AccountPasswordDialog.tsx`),
  DeleteAccountDialog: read(`${ACCOUNT}/DeleteAccountDialog.tsx`),
  LoginMethodDialogs: read(`${ACCOUNT}/LoginMethodDialogs.tsx`),
} as const

const entries = Object.entries(DIALOGS)

describe('account dialogs: one rhythm from the form pieces', () => {
  it.each(entries)('%s lays its body out in a FormStack', (_name, source) => {
    expect(source).toContain('<FormStack>')
  })

  it.each(entries)('%s types no vertical gap of its own', (_name, source) => {
    // The step numbers the old bodies used between blocks (12 is gap 3, 16 is
    // gap 4, 20 is gap 5, 24 is gap 6) and the half-step list margin. The
    // button bar's own HStack gap is the footer's, not a form gap.
    expect(source).not.toMatch(/<Stack\s+gap=\{(?:1\.5|3|4|5|6)\}/)
    expect(source).not.toMatch(/\bmb=\{1\.5\}/)
  })

  it.each(entries)('%s uses no font weight above 600', (_name, source) => {
    for (const [, weight] of source.matchAll(/fontWeight=\{(\d+)\}/g)) {
      expect(Number(weight)).toBeLessThanOrEqual(600)
    }
  })

  it.each([
    'EmailChangeModal',
    'EmailVerificationModal',
    'PhoneVerificationModal',
    'AccountPasswordDialog',
    'DeleteAccountDialog',
    'LoginMethodDialogs',
  ] as const)('%s puts its intro in the Modal description slot', (name) => {
    expect(DIALOGS[name]).toContain('description=')
  })

  it('the delete dialog and unlink read their lead sentence as the description; the list stays in the body', () => {
    const del = DIALOGS.DeleteAccountDialog
    // Both variants (confirm, and blocked by live bookings) have a description.
    expect(
      del.match(/description=\{t\.delete(?:Intro|BlockedBody)\}/g),
    ).toHaveLength(2)
    expect(del).toContain('<BulletList>')
    expect(del).not.toContain('LeadInList')
    // Unlink: the sentence is the description, and the body is only its error.
    expect(DIALOGS.LoginMethodDialogs).toMatch(
      /description=\{formatMessage\(t\.unlinkBody/,
    )
  })
})

describe('the verification code boxes', () => {
  const otp = read('src/ui/OtpInput/OtpInput.tsx')

  it('are as tall as every field in a form, and the padding takes no room', () => {
    expect(otp).toContain("h: 'form.controlHeight'")
    // The focus-ring padding is taken back out of the layout, so the gaps are
    // measured from the boxes' own edges.
    expect(otp).toMatch(/p=\{2\}\s+m=\{-2\}/)
  })

  it('share the row up to 44 wide, so six fit a dialog on a 320 phone', () => {
    // Not a fixed width: a fixed 44 ran 8px out of the dialog at 320.
    expect(otp).not.toMatch(/\bw: '44px'/)
    expect(otp).toMatch(/flex: '1 1 0',\s+minW: 0,\s+maxW: '44px'/)
  })

  it('have their help line 4 under them, like a helper', () => {
    const phone = DIALOGS.PhoneVerificationModal
    expect(phone).toContain('mt="form.controlToHelper"')
    expect(phone).toContain('formControlHelperTextProps')
  })

  it('end the help line with a link: link colour, 44 to press with no space added, aria-disabled', () => {
    const phone = DIALOGS.PhoneVerificationModal
    expect(phone).toContain('<ResendLink')
    expect(phone).toContain(
      'hitAreaGrowth(RESEND_LINE_HEIGHT, formSpace.controlToHelper)',
    )
    expect(phone).toContain('{...hitAreaLinkFocusRing}')
    expect(phone).toContain('{...hitAreaLabel}')
    expect(phone).toContain("'text.link'")
    expect(phone).toContain('aria-disabled=')
    // A real disabled button leaves the tab order and says nothing.
    expect(phone).not.toMatch(/<chakra\.button[^>]*\sdisabled=/)
  })
})

describe('re-auth: Google and Apple 8 apart, the sentence 8 above them', () => {
  const reauth = read(`${ACCOUNT}/ReauthPrompt.tsx`)

  it('is one block shared by the password and delete dialogs', () => {
    expect(reauth).toContain('gap="form.labelToControl"')
    expect(reauth).toContain('<FormAlternatives>')
    for (const name of [
      'AccountPasswordDialog',
      'DeleteAccountDialog',
    ] as const) {
      expect(DIALOGS[name]).toContain('<ReauthPrompt')
      expect(DIALOGS[name]).not.toContain('<GoogleAuthButton')
      expect(DIALOGS[name]).not.toContain('<AppleAuthButton')
    }
  })

  it('has no "Or continue with" divider: the main button is in the bar, before these buttons', () => {
    expect(reauth).not.toContain('FormDivider')
    for (const source of Object.values(DIALOGS)) {
      expect(source).not.toContain('FormDivider')
    }
  })
})
