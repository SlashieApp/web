import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { getRouter } from '@storybook/nextjs-vite/navigation.mock'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { HeroSearchCta } from './HeroSearchCta'

const hero = messages.en.landing.hero

/** `text.subtle`, `border.strong`, `border.focus` and green 400, resolved. */
const TEXT_SUBTLE = 'rgb(107, 107, 116)'
const BORDER_STRONG = 'rgb(212, 212, 216)'
const BORDER_FOCUS = 'rgb(2, 165, 103)'
const GREEN_400 = 'rgb(0, 220, 130)'

/** The pill: the bordered shell around the field and the Search button. */
function getPill(canvasElement: HTMLElement) {
  const pill = within(canvasElement).getByRole('textbox').parentElement
  if (!pill) throw new Error('The search field has no pill around it')
  return pill
}

const meta = {
  title: 'Marketing/Landing/HeroSearchCta',
  component: HeroSearchCta,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    placeholder: hero.searchPlaceholder,
    submitLabel: hero.searchSubmit,
    ariaLabel: hero.searchAriaLabel,
  },
} satisfies Meta<typeof HeroSearchCta>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Empty: one 52px pill with a 1px `border.strong` hairline, the `text.subtle`
 * placeholder and the green Search pill inside it (the hero's one green fill).
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
    const submit = canvas.getByRole('button', { name: hero.searchSubmit })
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

/** Typed intent: the text is what gets handed to the create-task flow. */
export const Typed: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox')
    await userEvent.type(input, 'Help moving two boxes')
    await expect(input).toHaveValue('Help moving two boxes')
  },
}

/** Phone width: still 52px tall, tighter side padding and no arrow on the button. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await expect(getPill(canvasElement).getBoundingClientRect().height).toBe(52)
  },
}

/** Traditional Chinese copy (zh_hk bag) in the same bar. */
export const TraditionalChinese: Story = {
  args: {
    placeholder: messages.zh_hk.landing.hero.searchPlaceholder,
    submitLabel: messages.zh_hk.landing.hero.searchSubmit,
    ariaLabel: messages.zh_hk.landing.hero.searchAriaLabel,
  },
}

/** Submitting opens /search with the typed text as the query. */
export const SubmitsToSearch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      canvas.getByRole('textbox', { name: hero.searchAriaLabel }),
      'Fix a leaking tap{Enter}',
    )
    await expect(getRouter().push).toHaveBeenCalledWith(
      '/search?q=Fix+a+leaking+tap',
    )
  },
}

/** Submitting empty opens /search with no query. */
export const SubmitsEmpty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: hero.searchSubmit }),
    )
    await expect(getRouter().push).toHaveBeenCalledWith('/search')
  },
}
