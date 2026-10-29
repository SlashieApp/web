import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { clearRegisterFailCount } from '@/app/(auth)/helpers/authFailCount'
import {
  StorySeed,
  type StorySessionOptions,
  withAuthWidgets,
  withSession,
} from '@/app/(auth)/helpers/authStoryDecorator'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { formSpace, minHitArea } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

import { RegisterScreen } from './RegisterScreen'

/**
 * /register in the form spacing order (FE-481): the fields, then the 18+,
 * Terms and marketing boxes as the last field group above the main button, the
 * "Or continue with" divider, then Google and Apple. The boxes still gate
 * Google and Apple.
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

const decorate = (session: StorySessionOptions = {}) => [
  freshFailCount,
  withAuthWidgets(),
  withSession(session),
]

type Canvas = ReturnType<typeof within>

async function fillForm(canvas: Canvas) {
  await userEvent.click(canvas.getByText('I confirm I am 18 or over.'))
  await userEvent.click(canvas.getByText(/I agree to the/))
  await userEvent.type(canvas.getByLabelText('Full name'), 'Alex Chen')
  await userEvent.type(canvas.getByLabelText('Email'), 'alex@example.com')
  await userEvent.type(canvas.getByLabelText('Password'), 'password1')
  await userEvent.type(canvas.getByLabelText('Confirm password'), 'password1')
  await userEvent.click(canvas.getByRole('button', { name: 'Create account' }))
}

const HINT =
  'Confirm you are 18 or over and agree to the Terms before continuing with Google or Apple.'

/** One consent row: the box, its label's lines, its tap target and its error. */
function consentRow(canvas: Canvas, name: string | RegExp) {
  const root = canvas
    .getByRole('checkbox', { name })
    .closest('label') as HTMLElement
  const control = root.querySelector('[data-part="control"]') as HTMLElement
  const label = root.querySelector('[data-part="label"]') as HTMLElement
  return {
    root,
    control,
    /** The label's lines: the visible row, 20 tall per line. */
    label,
    /** The tap target: the label's row grown to 44 or more. */
    hit: label.parentElement as HTMLElement,
    /** Where the row's error goes, 4 under it. */
    errorOf: (text: string) => canvas.getByText(text),
  }
}

/** The pieces of the sign-up card the spacing checks measure. */
async function registerParts(canvas: Canvas) {
  const title = await canvas.findByRole('heading', { level: 1 })
  const subtitle = title.nextElementSibling as HTMLElement
  const field = (name: string) =>
    canvas.getByText(name, { selector: 'label' }).parentElement as HTMLElement
  const shellOf = (root: HTMLElement) =>
    (root.querySelector('input') as HTMLElement).parentElement as HTMLElement
  const fullName = field('Full name')
  const email = field('Email')
  const password = field('Password')
  const confirm = field('Confirm password')
  const apple = await canvas.findByRole('button', {
    name: 'Continue with Apple',
  })
  return {
    title,
    subtitle,
    fullName,
    email,
    password,
    confirm,
    fields: [fullName, email, password, confirm],
    shellOf,
    over18: consentRow(canvas, 'I confirm I am 18 or over.'),
    terms: consentRow(canvas, /I agree to the/),
    marketing: consentRow(canvas, /Send me Slashie news and tips/),
    main: canvas.getByRole('button', { name: 'Create account' }),
    divider: (await canvas.findByText('Or continue with'))
      .parentElement as HTMLElement,
    // Google's widget sits in its own container, above Apple's button.
    google: apple.previousElementSibling as HTMLElement,
    apple,
  }
}

/**
 * The spec's gaps (wiki: Foundations-Form-Spacing), measured between visible
 * edges: header 8 and 24, label 8, fields 20, the password helper 4, the three
 * consent rows 20 apart as one last field group, 20 to the main button, the
 * divider 24 either side, Google and Apple 8 apart, the hint 8 under Apple;
 * 48 tall. Labels may wrap on a phone, so each row is measured from its
 * label's lines, not from a fixed height.
 */
async function expectRegisterSpacing(canvas: Canvas) {
  const p = await registerParts(canvas)

  await expect(gapBelow(p.title, p.subtitle)).toBe(formSpace.titleToSubtitle)
  await expect(gapBelow(p.subtitle, p.fullName)).toBe(formSpace.headerToBody)
  for (const field of p.fields) {
    const label = field.querySelector('label') as HTMLElement
    await expect(gapBelow(label, p.shellOf(field))).toBe(
      formSpace.labelToControl,
    )
  }
  // The password helper sits 4 under its field; then the field gap.
  const helper = canvas.getByText('At least 8 characters.')
  await expect(gapBelow(p.shellOf(p.password), helper)).toBe(
    formSpace.controlToHelper,
  )
  await expect(gapBelow(helper, p.confirm)).toBe(formSpace.fieldGap)
  await expect(gapBelow(p.shellOf(p.fullName), p.email)).toBe(
    formSpace.fieldGap,
  )
  await expect(gapBelow(p.shellOf(p.email), p.password)).toBe(
    formSpace.fieldGap,
  )

  // The last field group: the three rows, 20 apart, then 20 to the button.
  await expect(gapBelow(p.shellOf(p.confirm), p.over18.control)).toBe(
    formSpace.fieldGap,
  )
  await expect(gapBelow(p.over18.label, p.terms.control)).toBe(
    formSpace.fieldGap,
  )
  await expect(gapBelow(p.terms.label, p.marketing.control)).toBe(
    formSpace.fieldGap,
  )
  await expect(gapBelow(p.marketing.label, p.main)).toBe(formSpace.bodyToAction)

  await expect(gapBelow(p.main, p.divider)).toBe(formSpace.actionToDivider)
  await expect(gapBelow(p.divider, p.google)).toBe(
    formSpace.dividerToAlternatives,
  )
  await expect(gapBelow(p.google, p.apple)).toBe(formSpace.alternativesGap)

  // Nothing ticked: the hint is one more item in the group, 8 under Apple.
  await expect(gapBelow(p.apple, canvas.getByText(HINT))).toBe(
    formSpace.alternativesGap,
  )

  // 48 tall: the fields, the main button, Google and Apple.
  for (const control of [
    ...p.fields.map(p.shellOf),
    p.main,
    p.google,
    p.apple,
  ]) {
    await expect(heightOf(control)).toBe(formSpace.controlHeight)
  }

  // Every box is 20, level with its label's first line, and its row is whole
  // lines of 20.
  for (const row of [p.over18, p.terms, p.marketing]) {
    await expect(heightOf(row.control)).toBe(20)
    await expect(row.control.getBoundingClientRect().top).toBe(
      row.label.getBoundingClientRect().top,
    )
    await expect(heightOf(row.label) % 20).toBe(0)
    await expect(heightOf(row.hit)).toBeGreaterThanOrEqual(minHitArea)
  }

  // Order, top to bottom: header, fields, the boxes, the button, the divider,
  // then Google and Apple. The old order is gone.
  const inOrder = [
    p.title,
    p.fullName,
    p.email,
    p.password,
    p.confirm,
    p.over18.root,
    p.terms.root,
    p.marketing.root,
    p.main,
    p.divider,
    p.google,
    p.apple,
  ]
  inOrder.forEach((node, i) => {
    const next = inOrder[i + 1]
    if (next) {
      expect(node.compareDocumentPosition(next)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      )
    }
  })
  await expect(canvas.queryByText('Or continue with email')).toBeNull()
}

/** Nothing ticked yet: the consent hint shows under Google and Apple. */
export const Default: Story = {
  decorators: decorate(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', {
      level: 1,
      name: 'Create your account',
    })
    await canvas.findByText(HINT)
    await expectRegisterSpacing(canvas)
  },
}

/**
 * Phone width: the same gaps, with the longer labels on two or three lines.
 */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: decorate(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expectRegisterSpacing(canvas)
    // At this width the marketing label wraps, so a wrapped row is measured.
    const marketing = consentRow(canvas, /Send me Slashie news and tips/)
    await expect(heightOf(marketing.label)).toBeGreaterThan(20)
  },
}

/**
 * Every box row is at least 44 tall to tap, yet adds no visible space: it
 * reaches into the gaps above and below it. The first row reaches up to the
 * gap under the last field, the last reaches down to the gap above the button,
 * and a press on the visible row always lands on its own box. Rows sit 20
 * apart, so two neighbours' targets share 4px between them (the lower row
 * takes it).
 */
export const TapTargets: Story = {
  decorators: decorate(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const p = await registerParts(canvas)
    p.terms.root.scrollIntoView({ block: 'center' })

    const at = (x: number, y: number) => document.elementFromPoint(x, y)
    const rows = [p.over18, p.terms, p.marketing]
    for (const row of rows) {
      const hit = row.hit.getBoundingClientRect()
      const x = hit.left + 4
      await expect(hit.height).toBeGreaterThanOrEqual(minHitArea)
      // A press on the visible row's top and bottom lines lands on its box.
      const visible = row.label.getBoundingClientRect()
      await expect(row.root.contains(at(x, visible.top + 1))).toBe(true)
      await expect(row.root.contains(at(x, visible.bottom - 1))).toBe(true)
    }

    const first = p.over18.hit.getBoundingClientRect()
    const last = p.marketing.hit.getBoundingClientRect()
    await expect(
      p.over18.root.contains(at(first.left + 4, first.top + 1)),
    ).toBe(true)
    await expect(
      p.marketing.root.contains(at(last.left + 4, last.bottom - 1)),
    ).toBe(true)
    // The confirm field keeps its own bottom edge.
    const shell = p.shellOf(p.confirm).getBoundingClientRect()
    await expect(
      p.over18.root.contains(at(first.left + 4, shell.bottom - 1)),
    ).toBe(false)
  },
}

/**
 * Submitted empty: every field and both required boxes say what's missing,
 * each 4 under what it is about and 20 above the next field.
 */
export const EmptySubmit: Story = {
  decorators: decorate(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Create account' }),
    )
    await canvas.findByText('Enter your full name.')
    await canvas.findByText('Enter your email.')
    await canvas.findByText('Use at least 8 characters.')
    const ageError = await canvas.findByText(
      'You must confirm you are 18 or over to use Slashie.',
    )
    const termsError = await canvas.findByText(
      'Please agree to the Terms of Service and Privacy Policy.',
    )

    const p = await registerParts(canvas)
    const errorOf = (field: HTMLElement) =>
      field.querySelector('[id$="-error"]') as HTMLElement
    await expect(gapBelow(p.shellOf(p.fullName), errorOf(p.fullName))).toBe(
      formSpace.controlToHelper,
    )
    await expect(gapBelow(errorOf(p.fullName), p.email)).toBe(
      formSpace.fieldGap,
    )
    // The password helper and its error are 4 apart, helper first.
    const helper = canvas.getByText('At least 8 characters.')
    await expect(gapBelow(helper, errorOf(p.password))).toBe(
      formSpace.helperGap,
    )
    await expect(gapBelow(errorOf(p.password), p.confirm)).toBe(
      formSpace.fieldGap,
    )
    // A box's error sits 4 under its row, then the next row's 20.
    await expect(gapBelow(p.over18.label, ageError)).toBe(
      formSpace.controlToHelper,
    )
    await expect(gapBelow(ageError, p.terms.control)).toBe(formSpace.fieldGap)
    await expect(gapBelow(p.terms.label, termsError)).toBe(
      formSpace.controlToHelper,
    )
    await expect(gapBelow(termsError, p.marketing.control)).toBe(
      formSpace.fieldGap,
    )
    await expect(gapBelow(p.marketing.label, p.main)).toBe(
      formSpace.bodyToAction,
    )
  },
}

/** Both required boxes ticked: the consent hint goes and Google / Apple open. */
export const ConsentGiven: Story = {
  decorators: decorate(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('I confirm I am 18 or over.'))
    await userEvent.click(canvas.getByText(/I agree to the/))
    expect(
      canvas.queryByText(/before continuing with Google or Apple/),
    ).toBeNull()
    // Without the hint, Apple is the last item: nothing trails it.
    const p = await registerParts(canvas)
    await expect(p.apple.nextElementSibling).toBeNull()
    await expect(gapBelow(p.google, p.apple)).toBe(formSpace.alternativesGap)
  },
}

/**
 * The boxes still gate Google and Apple, now under the divider: pressing Apple
 * with them unticked asks for them, in the boxes above.
 */
export const ConsentGatesAlternatives: Story = {
  decorators: decorate(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const apple = await canvas.findByRole('button', {
      name: 'Continue with Apple',
    })
    await expect(apple).toBeEnabled()
    await userEvent.click(apple)
    await canvas.findByText(
      'You must confirm you are 18 or over to use Slashie.',
    )
    await canvas.findByText(
      'Please agree to the Terms of Service and Privacy Policy.',
    )
    // Still on the page, the hint still shows, and the boxes are above Apple.
    await canvas.findByText(HINT)
    const p = await registerParts(canvas)
    await expect(p.marketing.root.compareDocumentPosition(p.apple)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
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
    const p = await registerParts(canvas)
    await expect(gapBelow(p.marketing.label, alert)).toBe(formSpace.fieldGap)
    await expect(gapBelow(alert, p.main)).toBe(formSpace.bodyToAction)
  },
}

/**
 * The API asks for the security check: it is one more field, 20 below the
 * boxes, 8 from its label to the widget, and 20 to the error and the button.
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

    const p = await registerParts(canvas)
    const label = canvas.getByText('Security check')
    const check = label.parentElement as HTMLElement
    const widget = check.lastElementChild as HTMLElement
    await expect(gapBelow(p.marketing.label, check)).toBe(formSpace.fieldGap)
    await expect(gapBelow(label, widget)).toBe(formSpace.labelToControl)
    await expect(gapBelow(check, alert)).toBe(formSpace.fieldGap)
    await expect(gapBelow(alert, p.main)).toBe(formSpace.bodyToAction)
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

/** Traditional Chinese copy, picked from the `/zh-hk` URL prefix. */
export const TraditionalChinese: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/register' } } },
  decorators: [
    ...decorate(),
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { level: 1, name: '建立你的帳戶' })
    await canvas.findByText('或使用以下方式繼續')
    expect(canvas.queryByText('或使用電郵繼續')).toBeNull()
    // The divider sits under the main button, then Google and Apple.
    const main = canvas.getByRole('button', { name: '建立帳戶' })
    const divider = (await canvas.findByText('或使用以下方式繼續'))
      .parentElement as HTMLElement
    await expect(gapBelow(main, divider)).toBe(formSpace.actionToDivider)
  },
}
