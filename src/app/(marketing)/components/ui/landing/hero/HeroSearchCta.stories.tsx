import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { getRouter } from '@storybook/nextjs-vite/navigation.mock'
import { expect, userEvent, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { HeroSearchCta } from './HeroSearchCta'

const hero = messages.en.landing.hero

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

/** Empty: placeholder showing, "Search" button, arrow icon from `sm` up. */
export const Default: Story = {}

/** Focused: the whole bar lifts to the green border and the larger shadow. */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox')
    await userEvent.click(input)
    await expect(input).toHaveFocus()
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

/** Phone width: tighter padding, 48px controls and no arrow on the button. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
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
