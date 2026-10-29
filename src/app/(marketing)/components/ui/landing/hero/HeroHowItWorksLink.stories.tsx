import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { HeroHowItWorksLink } from './HeroHowItWorksLink'

/** `text.link` (green 800), resolved. Never green 400 (`rgb(0, 220, 130)`). */
const TEXT_LINK = 'rgb(5, 104, 63)'
/** `border.focus` (green 600), resolved. */
const BORDER_FOCUS = 'rgb(2, 165, 103)'

const meta = {
  title: 'Marketing/Landing/HeroHowItWorksLink',
  component: HeroHowItWorksLink,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: { children: messages.en.common.ctas.seeHowItWorks },
} satisfies Meta<typeof HeroHowItWorksLink>

export default meta
type Story = StoryObj<typeof meta>

/** Resting: a plain `text.link` (green 800) text action to `#how-it-works`, no underline. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', {
      name: /how it works/i,
    })
    await expect(link).toHaveAttribute('href', '#how-it-works')
    const style = getComputedStyle(link)
    await expect(style.color).toBe(TEXT_LINK)
    await expect(style.textDecorationLine).toBe('none')
    await expect(Number(style.fontWeight)).toBe(500)
  },
}

/**
 * Hover: the underline appears and the colour stays `text.link`, never green
 * 400. A scripted pointer does not set `:hover`, so the story sets Chakra's
 * `data-hover` hook, which the `_hover` condition also matches.
 */
export const Hovered: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', {
      name: /how it works/i,
    })
    link.setAttribute('data-hover', '')
    await waitFor(() =>
      expect(getComputedStyle(link).textDecorationLine).toBe('underline'),
    )
    await expect(getComputedStyle(link).color).toBe(TEXT_LINK)
  },
}

/** Keyboard focus: the green 600 focus ring and the underline. */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab()
    const link = within(canvasElement).getByRole('link', {
      name: /how it works/i,
    })
    await expect(link).toHaveFocus()
    await expect(getComputedStyle(link).outlineColor).toBe(BORDER_FOCUS)
    await expect(getComputedStyle(link).textDecorationLine).toBe('underline')
  },
}

/** Traditional Chinese label (zh_hk bag). */
export const TraditionalChinese: Story = {
  args: { children: messages.zh_hk.common.ctas.seeHowItWorks },
}
