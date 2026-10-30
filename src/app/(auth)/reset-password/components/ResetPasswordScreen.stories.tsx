import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import {
  cardParts,
  controlShell,
  expectRingHugsLabel,
  formColumn,
  gapsBetweenChildren,
} from '@/app/(auth)/helpers/authSpacing.testing'
import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { formSpace, minHitArea } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

import { ResetLinkMissing, ResetPasswordScreen } from './ResetPasswordScreen'

/** /reset-password: a new password from the emailed link. */
const meta = {
  title: 'Auth/Reset password/ResetPasswordScreen',
  component: ResetPasswordScreen,
  parameters: {
    layout: 'padded',
    nextjs: {
      navigation: { pathname: '/reset-password', query: { token: 'story' } },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 448, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResetPasswordScreen>

export default meta
type Story = StoryObj<typeof meta>

type Canvas = ReturnType<typeof within>

/**
 * The spec's gaps (wiki: Foundations-Form-Spacing), measured between visible
 * edges: header 8 and 24, label 8, the hint 4 under New password, fields 20
 * apart, 20 to the main button; fields and button 48 tall.
 */
async function expectFormSpacing(canvas: Canvas) {
  const { title, subtitle, below } = await cardParts(canvas)
  const column = formColumn(below[0])
  const field = (name: string) =>
    canvas.getByText(name, { selector: 'label' }).parentElement as HTMLElement
  const password = field('New password')
  const confirm = field('Confirm new password')
  const main = canvas.getByRole('button', { name: 'Reset password' })
  const hint = canvas.getByText('At least 8 characters.')

  await expect(gapBelow(title, subtitle)).toBe(formSpace.titleToSubtitle)
  for (const f of [password, confirm]) {
    const label = f.querySelector('label') as HTMLElement
    await expect(gapBelow(label, controlShell(f))).toBe(
      formSpace.labelToControl,
    )
    await expect(heightOf(controlShell(f))).toBe(formSpace.controlHeight)
  }
  await expect(gapBelow(controlShell(password), hint)).toBe(
    formSpace.controlToHelper,
  )
  await expect(column.lastElementChild).toBe(main)
  await expect(heightOf(main)).toBe(formSpace.controlHeight)
  // The first block is 24 under the header; the blocks of the form (fields, a
  // message, the button) are 20 apart.
  await expect(gapBelow(subtitle, column.firstElementChild as Element)).toBe(
    formSpace.headerToBody,
  )
  for (const gap of gapsBetweenChildren(column)) {
    await expect(gap).toBe(formSpace.fieldGap)
  }
  return { password, confirm, main }
}

async function submit(canvas: Canvas, password: string, confirm = password) {
  await userEvent.type(canvas.getByLabelText('New password'), password)
  await userEvent.type(canvas.getByLabelText('Confirm new password'), confirm)
  await userEvent.click(canvas.getByRole('button', { name: 'Reset password' }))
}

/** From the email link: new password, with the rule as a hint. */
export const Default: Story = {
  decorators: [withSession()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', {
      level: 1,
      name: 'Create a new password',
    })
    await canvas.findByText('At least 8 characters.')
    const { confirm, main } = await expectFormSpacing(canvas)
    // Nothing is wrong yet: the hint is the last line of New password, 20
    // above Confirm, and Confirm is 20 above the button.
    await expect(
      gapBelow(canvas.getByText('At least 8 characters.'), confirm),
    ).toBe(formSpace.fieldGap)
    await expect(gapBelow(controlShell(confirm), main)).toBe(
      formSpace.bodyToAction,
    )
  },
}

/** Phone width: the same gaps. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withSession()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('At least 8 characters.')
    await expectFormSpacing(canvas)
  },
}

/** Too short and not matching. */
export const ValidationErrors: Story = {
  decorators: [withSession()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await submit(canvas, 'short', 'shorter')
    const tooShort = await canvas.findByText('Use at least 8 characters.')
    const mismatch = await canvas.findByText('Passwords do not match.')
    // The hint and the error are 4 apart (hint first); each error is 4 under
    // its field and 20 above what follows.
    const { confirm, main } = await expectFormSpacing(canvas)
    const hint = canvas.getByText('At least 8 characters.')
    await expect(gapBelow(hint, tooShort)).toBe(formSpace.helperGap)
    await expect(gapBelow(tooShort, confirm)).toBe(formSpace.fieldGap)
    await expect(gapBelow(controlShell(confirm), mismatch)).toBe(
      formSpace.controlToHelper,
    )
    await expect(gapBelow(mismatch, main)).toBe(formSpace.bodyToAction)
  },
}

/** The link expired: a way to ask for a new one. */
export const LinkExpired: Story = {
  decorators: [
    withSession({
      responses: {
        ResetPassword: {
          kind: 'graphqlError',
          code: 'INVALID_OR_EXPIRED_RESET_TOKEN',
        },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await submit(canvas, 'password1')
    const alert = await canvas.findByRole('alert')
    expect(alert).toHaveTextContent(
      'This reset link is invalid or has expired. Request a new one.',
    )
    const link = await canvas.findByRole('link', { name: 'Request reset link' })
    const line = link.parentElement as HTMLElement
    // The alert is one more field (20 above it). The link's line hangs 4 under
    // it, like "Forgot password?" under its field, and the button is 20 below.
    const { confirm, main } = await expectFormSpacing(canvas)
    await expect(gapBelow(controlShell(confirm), alert)).toBe(
      formSpace.fieldGap,
    )
    await expect(heightOf(line)).toBe(20)
    await expect(gapBelow(alert, line)).toBe(formSpace.controlToHelper)
    await expect(gapBelow(line, main)).toBe(formSpace.bodyToAction)
    // 44 to tap, taken from the gaps: it adds no visible space, reaches up to
    // the alert's edge and down to the button's, and a press at either end
    // lands on the link.
    const target = link.getBoundingClientRect()
    await expect(target.height).toBeGreaterThanOrEqual(minHitArea)
    await expect(target.top).toBe(alert.getBoundingClientRect().bottom)
    await expect(target.bottom).toBe(main.getBoundingClientRect().top)
    const x = target.left + 4
    await expect(
      link.contains(document.elementFromPoint(x, target.top + 1)),
    ).toBe(true)
    await expect(
      link.contains(document.elementFromPoint(x, target.bottom - 1)),
    ).toBe(true)
    // The keyboard ring hugs the text line, not the 44.
    await expectRingHugsLabel(link)
  },
}

/** The API can't be reached. */
export const NetworkError: Story = {
  decorators: [
    withSession({ responses: { ResetPassword: { kind: 'networkError' } } }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await submit(canvas, 'password1')
    const alert = await canvas.findByRole('alert')
    expect(alert).toHaveTextContent(
      "Can't reach Slashie. Check your connection and try again.",
    )
    // No link here: the alert is the last field, 20 above the button.
    const { main } = await expectFormSpacing(canvas)
    await expect(gapBelow(alert, main)).toBe(formSpace.bodyToAction)
  },
}

/** Opened without a token: ask for a new link. */
export const LinkMissing: Story = {
  render: () => <ResetLinkMissing />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', {
      level: 1,
      name: 'Reset link required',
    })
    // A status page: icon 24 above the title, 8 to the description, then 24
    // to the one button, which is 48 tall.
    const { icon, title, subtitle } = await cardParts(canvas)
    const button = canvas.getByRole('link', { name: 'Request reset link' })
    await expect(gapBelow(icon as HTMLElement, title)).toBe(
      formSpace.headerToBody,
    )
    await expect(gapBelow(title, subtitle)).toBe(formSpace.titleToSubtitle)
    await expect(gapBelow(subtitle, button)).toBe(formSpace.headerToBody)
    await expect(heightOf(button)).toBe(formSpace.controlHeight)
  },
}
