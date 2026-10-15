import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { DashboardPageHeader } from './DashboardPageHeader'

const meta = {
  title: 'Dashboard/Shared/DashboardPageHeader',
  component: DashboardPageHeader,
  parameters: { layout: 'padded' },
  args: {
    eyebrow: 'Account',
    title: 'Account & security',
    description: 'Login, security and contact settings for your account.',
  },
} satisfies Meta<typeof DashboardPageHeader>

export default meta
type Story = StoryObj<typeof meta>

/** Eyebrow, title and a plain-text description. */
export const Default: Story = {}

/** No description: the title stands alone. */
export const WithoutDescription: Story = {
  args: { description: undefined },
}

/** The description is a node, so it can carry inline links. */
export const RichDescription: Story = {
  args: {
    description: (
      <>
        Your photo, name and bio live on <strong>Profile</strong>.
      </>
    ),
  },
}

/** A long title wraps instead of overflowing. */
export const LongTitle: Story = {
  args: {
    title: 'Good evening, Alexandria Montgomery-Featherstonehaugh',
  },
}
