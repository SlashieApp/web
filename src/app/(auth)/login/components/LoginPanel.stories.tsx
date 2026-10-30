import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { expectRingHugsLabel } from '@/app/(auth)/helpers/authSpacing.testing'
import {
  withAuthWidgets,
  withSession,
} from '@/app/(auth)/helpers/authStoryDecorator'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { formSpace, minHitArea } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

import { LoginPanel } from './LoginPanel'

type Canvas = ReturnType<typeof within>

/** The pieces of the log-in card the spacing checks measure. */
async function loginParts(canvas: Canvas) {
  const title = await canvas.findByRole('heading', { level: 1 })
  const subtitle = title.nextElementSibling as HTMLElement
  const field = (name: string) =>
    canvas.getByText(name, { selector: 'label' }).parentElement as HTMLElement
  const email = field('Email')
  const password = field('Password')
  const shellOf = (root: HTMLElement) =>
    (root.querySelector('input') as HTMLElement).parentElement as HTMLElement
  const forgot = canvas.getByRole('link', { name: 'Forgot password?' })
  const keep = canvas.getByRole('checkbox', { name: 'Keep me signed in' })
  const keepRoot = keep.closest('label') as HTMLElement
  const keepControl = keepRoot.querySelector(
    '[data-part="control"]',
  ) as HTMLElement
  const keepLabel = canvas.getByText('Keep me signed in')
  const main = canvas.getByRole('button', { name: 'Log in' })
  const divider = (await canvas.findByText('Or continue with'))
    .parentElement as HTMLElement
  const apple = await canvas.findByRole('button', {
    name: 'Continue with Apple',
  })
  // Google's widget sits in its own container, above Apple's button.
  const google = apple.previousElementSibling as HTMLElement
  return {
    title,
    subtitle,
    email,
    password,
    emailShell: shellOf(email),
    passwordShell: shellOf(password),
    forgot,
    /** The link's own line: the helper slot, 4 under the field. */
    forgotLine: forgot.parentElement as HTMLElement,
    keepRoot,
    keepControl,
    keepLabel,
    keepRow: keepLabel.parentElement as HTMLElement,
    main,
    divider,
    google,
    apple,
  }
}

/**
 * The spec's gaps (wiki: Foundations-Form-Spacing), measured between visible
 * edges: header 8 and 24, label 8, fields 20, "Forgot password?" 4 under the
 * field, Keep me signed in 20 below it, the main button 20, the divider 24
 * either side, Google and Apple 8 apart; 48 tall; 44 to tap.
 */
async function expectLoginSpacing(canvas: Canvas) {
  const p = await loginParts(canvas)

  await expect(gapBelow(p.title, p.subtitle)).toBe(formSpace.titleToSubtitle)
  await expect(gapBelow(p.subtitle, p.email)).toBe(formSpace.headerToBody)
  for (const field of [p.email, p.password]) {
    const label = field.querySelector('label') as HTMLElement
    const shell = (field.querySelector('input') as HTMLElement)
      .parentElement as HTMLElement
    await expect(gapBelow(label, shell)).toBe(formSpace.labelToControl)
  }
  await expect(gapBelow(p.emailShell, p.password)).toBe(formSpace.fieldGap)
  await expect(gapBelow(p.passwordShell, p.forgotLine)).toBe(
    formSpace.controlToHelper,
  )
  await expect(gapBelow(p.forgotLine, p.keepControl)).toBe(formSpace.fieldGap)
  await expect(gapBelow(p.keepControl, p.main)).toBe(formSpace.bodyToAction)
  await expect(gapBelow(p.main, p.divider)).toBe(formSpace.actionToDivider)
  await expect(gapBelow(p.divider, p.google)).toBe(
    formSpace.dividerToAlternatives,
  )
  await expect(gapBelow(p.google, p.apple)).toBe(formSpace.alternativesGap)

  // Right-aligned in the helper slot, inset 4 like the label and helper text.
  const shellRight = p.passwordShell.getBoundingClientRect().right
  await expect(shellRight - p.forgot.getBoundingClientRect().right).toBe(4)

  // 48 tall: the fields, the main button, Google and Apple.
  for (const control of [
    p.emailShell,
    p.passwordShell,
    p.main,
    p.google,
    p.apple,
  ]) {
    await expect(heightOf(control)).toBe(formSpace.controlHeight)
  }

  // Order, top to bottom: header, fields, button, divider, Google, Apple.
  const inOrder = [p.title, p.email, p.password, p.main, p.divider, p.google]
  inOrder.forEach((node, i) => {
    const next = inOrder[i + 1]
    if (next) {
      expect(node.compareDocumentPosition(next)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      )
    }
  })
  await expect(canvas.queryByText('Or continue with email')).toBeNull()

  // The visible row is one 20px line; the tap targets are 44 and add no space.
  await expect(heightOf(p.keepControl)).toBe(20)
  await expect(heightOf(p.keepRow)).toBeGreaterThanOrEqual(minHitArea)
  await expect(heightOf(p.forgot)).toBeGreaterThanOrEqual(minHitArea)
  await expect(heightOf(p.forgotLine)).toBe(20)
}

/** The sign-in column for each login view, message and notice (`views/README.md`). */
const meta = {
  title: 'Auth/Login/LoginPanel',
  component: LoginPanel,
  parameters: { layout: 'padded' },
  args: {
    view: 'signIn',
    message: null,
    notice: null,
    retryInSeconds: 0,
    submitting: false,
    securitySolved: false,
    securityResetSignal: 0,
    onSecurityToken: fn(),
    next: null,
    registerHref: '/register',
    defaultValues: { email: '', password: '' },
    onSubmit: fn(),
  },
  decorators: [withAuthWidgets(), withSession()],
} satisfies Meta<typeof LoginPanel>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Signed out: the email form first, then the main button, the "Or continue
 * with" divider and Google and Apple. No eyebrow above the title. The gaps are
 * the form spacing system's (`formSpace`), measured.
 */
export const SignIn: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { level: 1, name: 'Log in to Slashie' })
    expect(canvas.queryByText('Account')).toBeNull()
    await expectLoginSpacing(canvas)
  },
}

/** Phone width: the same gaps. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    await expectLoginSpacing(within(canvasElement))
  },
}

/**
 * "Forgot password?" and the "Keep me signed in" row are 44 tall to tap, yet
 * add no visible space: the link reaches up to the field's edge and down into
 * the gap, the row reaches into the gaps above and below. A press on either
 * edge lands on the control, and the field above keeps its own bottom edge.
 */
export const TapTargets: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const p = await loginParts(canvas)
    p.forgot.scrollIntoView({ block: 'center' })

    const at = (x: number, y: number) => document.elementFromPoint(x, y)
    const link = p.forgot.getBoundingClientRect()
    const x = link.left + link.width / 2
    await expect(link.height).toBe(minHitArea)
    await expect(p.forgot.contains(at(x, link.top + 1))).toBe(true)
    await expect(p.forgot.contains(at(x, link.bottom - 1))).toBe(true)
    // The field's own bottom edge is still the field's.
    const shell = p.passwordShell.getBoundingClientRect()
    await expect(link.top).toBe(shell.bottom)
    await expect(p.forgot.contains(at(x, shell.bottom - 1))).toBe(false)

    const row = p.keepRow.getBoundingClientRect()
    const rx = row.left + 4
    await expect(row.height).toBe(minHitArea)
    await expect(p.keepRoot.contains(at(rx, row.top + 1))).toBe(true)
    await expect(p.keepRoot.contains(at(rx, row.bottom - 1))).toBe(true)
  },
}

/**
 * The keyboard ring on "Forgot password?" is drawn on the text line (20 tall),
 * not around the 44px target it is grown to: the target is padding, and the
 * ring would otherwise run into the gap above "Keep me signed in".
 */
export const ForgotLinkRingHugsText: Story = {
  play: async ({ canvasElement }) => {
    const p = await loginParts(within(canvasElement))
    await expectRingHugsLabel(p.forgot)
  },
}

/** Submitted empty: the fields say what's missing. */
export const EmptySubmit: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Log in' }))
    await canvas.findByText('Enter your email.')
    const passwordError = await canvas.findByText('Password is required.')
    expect(args.onSubmit).not.toHaveBeenCalled()

    // The link is the helper, so the error sits 4 under it; then the field gap.
    const p = await loginParts(canvas)
    const error = passwordError.closest('[id$="-error"]') as HTMLElement
    await expect(gapBelow(p.forgotLine, error)).toBe(formSpace.helperGap)
    await expect(gapBelow(error, p.keepControl)).toBe(formSpace.fieldGap)
    const emailError = (await canvas.findByText('Enter your email.')).closest(
      '[id$="-error"]',
    ) as HTMLElement
    await expect(gapBelow(p.emailShell, emailError)).toBe(
      formSpace.controlToHelper,
    )
    await expect(gapBelow(emailError, p.password)).toBe(formSpace.fieldGap)
  },
}

/** Logging in: the button is busy. */
export const Submitting: Story = {
  args: {
    submitting: true,
    defaultValues: { email: 'sam@example.com', password: 'correct-horse' },
  },
}

/** Wrong email or password. */
export const InvalidCredentials: Story = {
  args: { message: 'invalidCredentials' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const alert = await canvas.findByRole('alert')
    expect(alert).toHaveTextContent('Email or password is incorrect.')
    // A form-level error is one more field: 20 above it and 20 to the button.
    const p = await loginParts(canvas)
    await expect(gapBelow(p.keepControl, alert)).toBe(formSpace.fieldGap)
    await expect(gapBelow(alert, p.main)).toBe(formSpace.bodyToAction)
  },
}

/** Third failed attempt: Log in waits for the security check. */
export const SecurityCheck: Story = {
  args: { view: 'securityCheck', message: 'invalidCredentials' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Security check placeholder')
    expect(canvas.getByRole('button', { name: 'Log in' })).toBeDisabled()
    // The check is a field: 20 below Keep me signed in, 8 label to widget, then
    // 20 to the error that came with the failed attempt, and 20 to the button.
    const p = await loginParts(canvas)
    const check = canvas.getByText('Security check')
      .parentElement as HTMLElement
    const widget = check.lastElementChild as HTMLElement
    const alert = canvas.getByRole('alert')
    await expect(gapBelow(p.keepControl, check)).toBe(formSpace.fieldGap)
    await expect(gapBelow(canvas.getByText('Security check'), widget)).toBe(
      formSpace.labelToControl,
    )
    await expect(gapBelow(check, alert)).toBe(formSpace.fieldGap)
    await expect(gapBelow(alert, p.main)).toBe(formSpace.bodyToAction)
  },
}

/** The security check is solved: Log in is available again. */
export const SecurityCheckSolved: Story = {
  args: { view: 'securityCheck', securitySolved: true },
  play: async ({ canvasElement }) => {
    expect(
      within(canvasElement).getByRole('button', { name: 'Log in' }),
    ).toBeEnabled()
  },
}

/** The API asked for the security check before the third failure. */
export const SecurityCheckRequired: Story = {
  args: { view: 'securityCheck', message: 'securityCheckRequired' },
}

/** The security check failed or expired. */
export const SecurityCheckFailed: Story = {
  args: { view: 'securityCheck', message: 'securityCheckFailed' },
}

/** Too many attempts: the button counts down to the retry. */
export const RateLimited: Story = {
  args: { view: 'rateLimited', message: 'rateLimited', retryInSeconds: 42 },
  play: async ({ canvasElement }) => {
    expect(
      within(canvasElement).getByRole('button', { name: 'Try again in 42s' }),
    ).toBeDisabled()
  },
}

/** The API can't be reached. */
export const NetworkError: Story = {
  args: { message: 'networkError' },
  play: async ({ canvasElement }) => {
    expect(await within(canvasElement).findByRole('alert')).toHaveTextContent(
      "Can't reach Slashie. Check your connection and try again.",
    )
  },
}

/** Any other failure. */
export const Failed: Story = {
  args: { message: 'failed' },
}

/** After requesting deletion: the date it happens. */
export const DeletionScheduled: Story = {
  args: { notice: { kind: 'scheduled', date: '2030-11-12' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const notice = await canvas.findByText(
      'Your account will be deleted on 12 November 2030. Sign in before then to restore it.',
    )
    // Header 24, the notice, then 20 to the first field.
    const p = await loginParts(canvas)
    const box = notice.closest('[role="status"]') as HTMLElement
    await expect(gapBelow(p.subtitle, box)).toBe(formSpace.headerToBody)
    await expect(gapBelow(box, p.email)).toBe(formSpace.fieldGap)
  },
}

/** Deletion link without a usable date. */
export const DeletionScheduledNoDate: Story = {
  args: { notice: { kind: 'scheduled', date: null } },
}

/** From the deletion emails: sign in to restore. */
export const RestoreAccount: Story = {
  args: { notice: { kind: 'restore' } },
}

/** Traditional Chinese copy, picked from the `/zh-hk` URL prefix. */
export const TraditionalChinese: Story = {
  args: { message: 'networkError' },
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/login' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', {
      level: 1,
      name: '登入 Slashie',
    })
    await canvas.findByText('或使用以下方式繼續')
    expect(canvas.queryByText('或使用電郵繼續')).toBeNull()
  },
}
