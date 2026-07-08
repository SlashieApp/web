import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  SpotIllustration,
  type SpotIllustrationProps,
} from './SpotIllustration'

const meta = {
  title: 'ui/SpotIllustration',
  component: SpotIllustration,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<SpotIllustrationProps>

export default meta

type Story = StoryObj<typeof meta>

/** E04 — chair + lamp (reviews empty state). */
export const Reviews: Story = {
  args: { variant: 'reviews' },
}

/** E14 — briefcase (no completed jobs on Slashie yet). */
export const NoWork: Story = {
  args: { variant: 'no-work' },
}
