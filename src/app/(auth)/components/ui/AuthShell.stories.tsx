import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { Button } from '@ui'

import { AuthCard } from './AuthCard'
import { AuthShell } from './AuthShell'

/** Every auth page: logo, one centred column, and the legal links. */
const meta = {
  title: 'Auth/Parts/AuthShell',
  component: AuthShell,
  parameters: { layout: 'fullscreen' },
  args: {
    children: (
      <AuthCard title="Log in to Slashie" description="Welcome back.">
        <Button w="full">Log in</Button>
      </AuthCard>
    ),
  },
} satisfies Meta<typeof AuthShell>

export default meta
type Story = StoryObj<typeof meta>

/** Desktop: the card in the middle, legal links at the bottom. */
export const Desktop: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByRole('link', { name: 'Slashie home' })).toBeVisible()
    // Not Log in's page, so there is always a way back (FE-445).
    expect(canvas.getByRole('button', { name: 'Back' })).toBeVisible()
    await canvas.findByRole('link', { name: 'Terms' })
    await canvas.findByRole('link', { name: 'Privacy' })
    await canvas.findByRole('link', { name: 'Contact' })
  },
}

/** Phone: the same column, edge to edge with page gutters, and the way back at the logo's left. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    expect(
      within(canvasElement).getByRole('button', { name: 'Back' }),
    ).toBeVisible()
  },
}
