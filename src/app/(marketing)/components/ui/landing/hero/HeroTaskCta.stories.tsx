import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { getRouter } from '@storybook/nextjs-vite/navigation.mock'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { HeroTaskCta } from './HeroTaskCta'

const hero = messages.en.landing.hero
const postTask = messages.en.common.ctas.postTask

/** `text.subtle`, `border.strong`, `border.focus` and green 400, resolved. */
const TEXT_SUBTLE = 'rgb(107, 107, 116)'
const BORDER_STRONG = 'rgb(212, 212, 216)'
const BORDER_FOCUS = 'rgb(2, 165, 103)'
const GREEN_400 = 'rgb(0, 220, 130)'

/** The pill: the bordered shell around the field and the Post a task button. */
function getPill(canvasElement: HTMLElement) {
  const pill = within(canvasElement).getByRole('textbox').parentElement
  if (!pill) throw new Error('The task field has no pill around it')
  return pill
}

const meta = {
  title: 'Marketing/Landing/HeroTaskCta',
  component: HeroTaskCta,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    placeholder: hero.taskPlaceholder,
    submitLabel: postTask,
    ariaLabel: hero.taskAriaLabel,
  },
} satisfies Meta<typeof HeroTaskCta>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Empty: one 52px pill with a 1px `border.strong` hairline, the `text.subtle`
 * placeholder and the green Post a task pill inside it (the hero's one green
 * fill).
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const pill = getPill(canvasElement)
    await expect(pill.getBoundingClientRect().height).toBe(52)
    const pillStyle = getComputedStyle(pill)
    await expect(pillStyle.borderTopWidth).toBe('1px')
    await expect(pillStyle.borderTopColor).toBe(BORDER_STRONG)
    await expect(
      Number.parseFloat(pillStyle.borderTopLeftRadius),
    ).toBeGreaterThan(26)
    const input = canvas.getByRole('textbox')
    await expect(getComputedStyle(input, '::placeholder').color).toBe(
      TEXT_SUBTLE,
    )
    const submit = canvas.getByRole('button', { name: postTask })
    await expect(pill).toContainElement(submit)
    await expect(getComputedStyle(submit).backgroundColor).toBe(GREEN_400)
    // The header's Get started yields to this pill, not to the hero around it.
    await expect(submit).toHaveAttribute('data-page-green-action', '')
  },
}

/** Focused: the pill's border and ring step to green 600 (`border.focus`). */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox')
    await userEvent.click(input)
    await expect(input).toHaveFocus()
    await waitFor(() =>
      expect(getComputedStyle(getPill(canvasElement)).borderTopColor).toBe(
        BORDER_FOCUS,
      ),
    )
  },
}

/** Typed: the text is what Post a task starts with, as the task's title. */
export const Typed: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox')
    await userEvent.type(input, 'Help moving two boxes')
    await expect(input).toHaveValue('Help moving two boxes')
  },
}

/**
 * Phone width: still 52px tall, tighter side padding and no arrow on the
 * button, whose label stays on one line inside the pill.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const pill = getPill(canvasElement)
    await expect(pill.getBoundingClientRect().height).toBe(52)
    const submit = within(canvasElement).getByRole('button', { name: postTask })
    const box = submit.getBoundingClientRect()
    await expect(box.height).toBeLessThan(52)
    await expect(box.right).toBeLessThanOrEqual(
      pill.getBoundingClientRect().right,
    )
  },
}

/** Traditional Chinese copy (zh_hk bag) in the same bar. */
export const TraditionalChinese: Story = {
  args: {
    placeholder: messages.zh_hk.landing.hero.taskPlaceholder,
    submitLabel: messages.zh_hk.common.ctas.postTask,
    ariaLabel: messages.zh_hk.landing.hero.taskAriaLabel,
  },
}

/**
 * Submitting goes to sign-up, then on to Post a task with the typed text as
 * the title (the title rides inside `next`, encoded once more).
 */
export const SubmitsToPostTask: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      canvas.getByRole('textbox', { name: hero.taskAriaLabel }),
      'Fix a leaking tap{Enter}',
    )
    await expect(getRouter().push).toHaveBeenCalledWith(
      '/register?next=%2Ftasks%2Fcreate%3Ftitle%3DFix%2Ba%2Bleaking%2Btap',
    )
  },
}

/** Submitting empty goes to sign-up, then Post a task with no title. */
export const SubmitsEmpty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: postTask }))
    await expect(getRouter().push).toHaveBeenCalledWith(
      '/register?next=%2Ftasks%2Fcreate',
    )
  },
}
