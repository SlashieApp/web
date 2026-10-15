import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  SpotIllustration,
  type SpotIllustrationProps,
} from './SpotIllustration'

const meta = {
  title: 'UI/SpotIllustration',
  component: SpotIllustration,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<SpotIllustrationProps>

export default meta

type Story = StoryObj<typeof meta>

/** Houses + person + chat (marketplace / quotes empty). */
export const Quotes: Story = {
  args: { variant: 'quotes', width: 120 },
}

/** E04: chair + lamp (reviews empty state). */
export const Reviews: Story = {
  args: { variant: 'reviews' },
}

/** E14: briefcase (no completed jobs on Slashie yet). */
export const NoWork: Story = {
  args: { variant: 'no-work' },
}

/** Small width: the line art scales down for inline or compact empty rows. */
export const SmallWidth: Story = {
  args: { variant: 'quotes', width: 72 },
}

/** Large width: hero empty state, strokes scale with the SVG. */
export const LargeWidth: Story = {
  args: { variant: 'quotes', width: 280 },
}
