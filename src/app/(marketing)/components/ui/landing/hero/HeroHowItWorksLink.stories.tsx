import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { HeroHowItWorksLink } from './HeroHowItWorksLink'

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

/** Resting: underlined in-page anchor to `#how-it-works`. */
export const Default: Story = {}

/** Keyboard focus: the link shows the green focus-visible outline. */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab()
    await expect(
      within(canvasElement).getByRole('link', { name: /how it works/i }),
    ).toHaveFocus()
  },
}
