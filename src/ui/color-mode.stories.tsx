import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { ColorModeButton } from './color-mode'

const meta = {
  title: 'UI/ColorMode',
  component: ColorModeButton,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof ColorModeButton>

export default meta
type Story = StoryObj<typeof meta>

/** Ghost icon button: a sun in light mode and a moon in dark mode (follows the toolbar theme). */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', {
        name: 'Toggle color mode',
      }),
    ).toBeEnabled()
  },
}

/** Small size. */
export const Small: Story = { args: { size: 'sm' } }

/** Large size. */
export const Large: Story = { args: { size: 'lg' } }

/** Disabled: dimmed and not focusable. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', {
        name: 'Toggle color mode',
      }),
    ).toBeDisabled()
  },
}
