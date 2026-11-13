import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test'

import { clearRegisterFailCount } from '@/app/(auth)/helpers/authFailCount'
import {
  StorySeed,
  type StorySessionOptions,
  withAuthWidgets,
  withSession,
} from '@/app/(auth)/helpers/authStoryDecorator'
import { withLastSignIn } from '@/app/(auth)/helpers/lastSignIn.testing'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { formSpace, minHitArea } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

import { RegisterScreen } from './RegisterScreen'

/**
 * /register (FE-563, Ryan 13 Nov): one consent line (18 or over, Terms and
 * Privacy) and the unticked marketing box above every way in, then Google,
 * Apple and Continue with email, which opens into the "Or with email" divider
 * and the form. No consent boxes: Google and Apple work in one tap.
 */
const meta = {
  title: 'Auth/Register/RegisterScreen',
  component: RegisterScreen,
  parameters: {
    layout: 'padded',
    nextjs: { navigation: { pathname: '/register' } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 448, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RegisterScreen>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Failed sign-ups count in sessionStorage and the third one asks for the
 * security check, so every story starts from none.
 */
const freshFailCount: Decorator = (Story) => (
  <StorySeed apply={clearRegisterFailCount} reset={clearRegisterFailCount}>
    <Story />
  </StorySeed>
)

/** Most stories are about the form: open it, as for a returning email user. */
const decorate = (session: StorySessionOptions = {}) => [
  freshFailCount,
  withAuthWidgets(),
  withSession(session),
  withLastSignIn('email'),
]

/** A first visit: the three ways in, closed. */
const decorateFirstVisit = () => [
  freshFailCount,
  withAuthWidgets(),
  withSession(),
  withLastSignIn(null),
]

type Canvas = ReturnType<typeof within>

const CONSENT =
  "By continuing, you confirm you're 18 or over and agree to the Terms of Service and Privacy Policy."

async function fillForm(canvas: Canvas) {
  await userEvent.type(canvas.getByLabelText('Full name'), 'Alex Chen')
  await userEvent.type(canvas.getByLabelText('Email'), 'alex@example.com')
  await userEvent.type(canvas.getByLabelText('Password'), 'password1')
  await userEvent.type(canvas.getByLabelText('Confirm password'), 'password1')
  await userEvent.click(canvas.getByRole('button', { name: 'Create account' }))
}

/** The marketing row: its box, its label's lines and its tap target. */
function marketingRow(canvas: Canvas) {
  const root = canvas
    .getByRole('checkbox', { name: /Send me Slashie news and tips/ })
    .closest('label') as HTMLElement
  const label = root.querySelector('[data-part="label"]') as HTMLElement
  return {
    root,
    control: root.querySelector('[data-part="control"]') as HTMLElement,
    label,
    hit: label.parentElement as HTMLElement,
  }
}

/** The consent block and the ways in, open or closed. */
async function topParts(canvas: Canvas) {
  const title = await canvas.findByRole('heading', { level: 1 })
  const subtitle = title.nextElementSibling as HTMLElement
  const consent = canvasConsent(canvas)
  const apple = await canvas.findByRole('button', {
    name: 'Continue with Apple',
  })
  return {
    title,
    subtitle,
    consent,
    marketing: marketingRow(canvas),
    // Google's widget sits in its own container, above Apple's button.
    google: apple.previousElementSibling as HTMLElement,
    apple,
  }
}

function canvasConsent(canvas: Canvas) {
  return canvas.getByText(
    (_: string, node: Element | null) => node?.textContent === CONSENT,
    {
      selector: 'p',
    },
  )
}

/** The open email section's pieces. */
async function formParts(canvas: Canvas) {
  const field = (name: string) =>
    canvas.getByText(name, { selector: 'label' }).parentElement as HTMLElement
  const shellOf = (root: HTMLElement) =>
    (root.querySelector('input') as HTMLElement).parentElement as HTMLElement
  const fullName = field('Full name')
  const email = field('Email')
  const password = field('Password')
  const confirm = field('Confirm password')
  return {
    divider: (await canvas.findByText('Or with email'))
      .parentElement as HTMLElement,
    fullName,
    email,
    password,
    confirm,
    fields: [fullName, email, password, confirm],
    shellOf,
    main: canvas.getByRole('button', { name: 'Create account' }),
  }
}

/**
 * The spec's gaps (wiki: Foundations-Form-Spacing), measured between visible
 * edges: header 8 and 24, the consent line 20 above the marketing row and the
 * row 20 above Google, Google and Apple 8 apart, the "Or with email" divider
 * 24 either side, label 8, fields 20, the password helper 4, 20 to the main
 * button; 48 tall; the marketing row 44 to tap.
 */
async function expectRegisterSpacing(canvas: Canvas) {
  const t = await topParts(canvas)
  const f = await formParts(canvas)

  await expect(gapBelow(t.title, t.subtitle)).toBe(formSpace.titleToSubtitle)
  await expect(gapBelow(t.subtitle, t.consent)).toBe(formSpace.headerToBody)
  await expect(gapBelow(t.consent, t.marketing.control)).toBe(
    formSpace.fieldGap,
  )
  await expect(gapBelow(t.marketing.label, t.google)).toBe(formSpace.fieldGap)
  await expect(gapBelow(t.google, t.apple)).toBe(formSpace.alternativesGap)
  await expect(gapBelow(t.apple, f.divider)).toBe(
    formSpace.dividerToAlternatives,
  )
  await expect(gapBelow(f.divider, f.fullName)).toBe(
    formSpace.dividerToAlternatives,
  )
  for (const field of f.fields) {
    const label = field.querySelector('label') as HTMLElement
    await expect(gapBelow(label, f.shellOf(field))).toBe(
      formSpace.labelToControl,
    )
  }
  await expect(gapBelow(f.shellOf(f.fullName), f.email)).toBe(
    formSpace.fieldGap,
  )
  await expect(gapBelow(f.shellOf(f.email), f.password)).toBe(
    formSpace.fieldGap,
  )
  const helper = canvas.getByText('At least 8 characters.')
  await expect(gapBelow(f.shellOf(f.password), helper)).toBe(
    formSpace.controlToHelper,
  )
  await expect(gapBelow(helper, f.confirm)).toBe(formSpace.fieldGap)
  await expect(gapBelow(f.shellOf(f.confirm), f.main)).toBe(
    formSpace.bodyToAction,
  )

  for (const control of [
    ...f.fields.map(f.shellOf),
    f.main,
    t.google,
    t.apple,
  ]) {
    await expect(heightOf(control)).toBe(formSpace.controlHeight)
  }
  await expect(heightOf(t.marketing.control)).toBe(20)
  await expect(heightOf(t.marketing.hit)).toBeGreaterThanOrEqual(minHitArea)

  // Order: header, consent, marketing, Google, Apple, divider, form.
  const inOrder = [
    t.title,
    t.consent,
    t.marketing.root,
    t.google,
    t.apple,
    f.divider,
    f.fullName,
    f.main,
  ]
  inOrder.forEach((node, i) => {
    const next = inOrder[i + 1]
    if (next) {
      expect(node.compareDocumentPosition(next)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      )
    }
  })
  // No consent boxes any more: the line is the consent.
  await expect(
    canvas.queryByRole('checkbox', { name: /18 or over/ }),
  ).toBeNull()
  await expect(canvas.queryByRole('checkbox', { name: /I agree/ })).toBeNull()
}

/**
 * A first visit (FE-563): the consent line and the unticked marketing box,
 * then Google, Apple and Continue with email, closed. The line's links go to
 * the Terms and the Privacy Policy.
 */
export const Default: Story = {
  decorators: decorateFirstVisit(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', {
      level: 1,
      name: 'Create your account',
    })
    const t = await topParts(canvas)
    const email = canvas.getByRole('button', { name: 'Continue with email' })
    await expect(gapBelow(t.apple, email)).toBe(formSpace.alternativesGap)
    await expect(heightOf(email)).toBe(formSpace.controlHeight)
    await expect(email).toHaveAttribute('aria-expanded', 'false')
    await expect(canvas.queryByLabelText('Full name')).toBeNull()
    await expect(
      within(t.consent).getByRole('link', { name: 'Terms of Service' }),
    ).toHaveAttribute('href', '/terms')
    await expect(
      within(t.consent).getByRole('link', { name: 'Privacy Policy' }),
    ).toHaveAttribute('href', '/privacy')
    await expect(
      canvas.getByRole('checkbox', { name: /Send me Slashie news and tips/ }),
    ).not.toBeChecked()
  },
}

/**
 * Google and Apple work in one tap: nothing blocks or describes them, as the
 * consent line above covers every way in.
 */
export const OneTapGoogleAndApple: Story = {
  decorators: decorateFirstVisit(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const t = await topParts(canvas)
    await expect(t.apple).toBeEnabled()
    await expect(t.apple).not.toHaveAttribute('aria-describedby')
    await expect(canvas.queryByText(/before continuing with Google/)).toBeNull()
  },
}

/** Continue with email opens the section in place; the cursor is in Full name. */
export const ContinueWithEmail: Story = {
  decorators: decorateFirstVisit(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Continue with email' }),
    )
    const name = await canvas.findByLabelText('Full name')
    await waitFor(() => expect(name).toHaveFocus())
    await expectRegisterSpacing(canvas)
  },
}

/** A returning email user: the section is already open, with the same gaps. */
export const OpenForEmailUsers: Story = {
  decorators: decorate(),
  play: async ({ canvasElement }) => {
    await expectRegisterSpacing(within(canvasElement))
  },
}

/** Phone width: the same gaps; the consent line wraps. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: decorate(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expectRegisterSpacing(canvas)
    await expect(heightOf(canvasConsent(canvas))).toBeGreaterThan(20)
  },
}

/**
 * The marketing row is 44 tall to tap, yet adds no visible space: it reaches
 * into the 20 gaps above and below it, and a press on its edges lands on it,
 * never on the consent line or Google.
 */
export const TapTargets: Story = {
  decorators: decorate(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const t = await topParts(canvas)
    t.marketing.root.scrollIntoView({ block: 'center' })
    const at = (x: number, y: number) => document.elementFromPoint(x, y)
    const hit = t.marketing.hit.getBoundingClientRect()
    await expect(hit.height).toBeGreaterThanOrEqual(minHitArea)
    await expect(t.marketing.root.contains(at(hit.left + 4, hit.top + 1))).toBe(
      true,
    )
    await expect(
      t.marketing.root.contains(at(hit.left + 4, hit.bottom - 1)),
    ).toBe(true)
    await expect(hit.top).toBeGreaterThanOrEqual(
      t.consent.getBoundingClientRect().bottom,
    )
    await expect(hit.bottom).toBeLessThanOrEqual(
      t.google.getBoundingClientRect().top,
    )
  },
}

/**
 * Submitted empty: every field says what's missing, each 4 under what it is
 * about and 20 above the next field.
 */
export const EmptySubmit: Story = {
  decorators: decorate(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Create account' }),
    )
    await canvas.findByText('Enter your full name.')
    await canvas.findByText('Enter your email.')
    await canvas.findByText('Use at least 8 characters.')
    const f = await formParts(canvas)
    const errorOf = (field: HTMLElement) =>
      field.querySelector('[id$="-error"]') as HTMLElement
    await expect(gapBelow(f.shellOf(f.fullName), errorOf(f.fullName))).toBe(
      formSpace.controlToHelper,
    )
    await expect(gapBelow(errorOf(f.fullName), f.email)).toBe(
      formSpace.fieldGap,
    )
    const helper = canvas.getByText('At least 8 characters.')
    await expect(gapBelow(helper, errorOf(f.password))).toBe(
      formSpace.helperGap,
    )
    await expect(gapBelow(errorOf(f.password), f.confirm)).toBe(
      formSpace.fieldGap,
    )
  },
}

/** The email already has an account. */
export const EmailTaken: Story = {
  decorators: decorate({
    responses: {
      Register: { kind: 'graphqlError', code: 'EMAIL_ALREADY_REGISTERED' },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await fillForm(canvas)
    const alert = await canvas.findByRole('alert')
    expect(alert).toHaveTextContent(
      'An account with this email already exists. Log in instead.',
    )
    // A form-level error is one more field: 20 above it and 20 to the button.
    const f = await formParts(canvas)
    await expect(gapBelow(f.shellOf(f.confirm), alert)).toBe(formSpace.fieldGap)
    await expect(gapBelow(alert, f.main)).toBe(formSpace.bodyToAction)
  },
}

/**
 * The API asks for the security check: it is one more field, 20 below the
 * last field, 8 from its label to the widget, and 20 to the error and the
 * button.
 */
export const SecurityCheck: Story = {
  decorators: decorate({
    responses: {
      Register: { kind: 'graphqlError', code: 'CAPTCHA_REQUIRED' },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await fillForm(canvas)
    const alert = await canvas.findByRole('alert')
    await canvas.findByText('Security check placeholder')
    expect(
      canvas.getByRole('button', { name: 'Create account' }),
    ).toBeDisabled()

    const f = await formParts(canvas)
    const label = canvas.getByText('Security check')
    const check = label.parentElement as HTMLElement
    const widget = check.lastElementChild as HTMLElement
    await expect(gapBelow(f.shellOf(f.confirm), check)).toBe(formSpace.fieldGap)
    await expect(gapBelow(label, widget)).toBe(formSpace.labelToControl)
    await expect(gapBelow(check, alert)).toBe(formSpace.fieldGap)
    await expect(gapBelow(alert, f.main)).toBe(formSpace.bodyToAction)
  },
}

/** Too many sign-ups from this address. */
export const RateLimited: Story = {
  decorators: decorate({
    responses: {
      Register: { kind: 'graphqlError', code: 'REGISTER_RATE_LIMITED' },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await fillForm(canvas)
    expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Too many attempts right now. Please wait a bit and try again.',
    )
  },
}

/** The API can't be reached. */
export const NetworkError: Story = {
  decorators: decorate({
    responses: { Register: { kind: 'networkError' } },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await fillForm(canvas)
    expect(await canvas.findByRole('alert')).toHaveTextContent(
      "Can't reach Slashie. Check your connection and try again.",
    )
  },
}

/** Traditional Chinese, first visit: the consent line, then 使用電郵繼續. */
export const TraditionalChinese: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/register' } } },
  decorators: [
    ...decorateFirstVisit(),
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { level: 1, name: '建立你的帳戶' })
    await expect(
      canvas.getByText(
        (_, node) =>
          node?.textContent ===
          '繼續即表示你確認已年滿 18 歲，並同意服務條款及私隱政策。',
        { selector: 'p' },
      ),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: '使用電郵繼續' }),
    ).toBeVisible()
    expect(canvas.queryByText('或使用以下方式繼續')).toBeNull()
  },
}
