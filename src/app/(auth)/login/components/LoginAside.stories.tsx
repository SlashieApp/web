import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { LoginAside } from './LoginAside'

/** The brand panel beside the sign-in column (desktop only). */
const meta = {
  title: 'Auth/Login/LoginAside',
  component: LoginAside,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof LoginAside>

export default meta
type Story = StoryObj<typeof meta>

/** Desktop: badge, line, and the two stat cards. */
export const Desktop: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Fast quotes')
  },
}

/** Phones and tablets: hidden, the sign-in column stands alone. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByText('Fast quotes')).not.toBeVisible()
  },
}
