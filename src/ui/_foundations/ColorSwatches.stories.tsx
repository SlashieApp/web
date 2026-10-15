import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ColorPalettes, GreenInkDemo } from './ColorSwatches'

const meta = {
  title: 'Foundations/ColorSwatches',
  component: ColorPalettes,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ColorPalettes>

export default meta
type Story = StoryObj<typeof meta>

/** Primitive scales and semantic roles for the light and dark systems, side by side. */
export const Palettes: Story = {}

/** The green-ink rule: every green fill pairs with dark ink text in both modes. */
export const GreenInk: Story = {
  render: () => <GreenInkDemo />,
}
