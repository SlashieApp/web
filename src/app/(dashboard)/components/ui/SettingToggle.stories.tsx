import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { SettingToggle } from './SettingToggle'

const meta = {
  title: 'Dashboard/Shared/SettingToggle',
  component: SettingToggle,
  parameters: { layout: 'padded' },
  args: {
    label: 'Product news by email',
    description: 'Occasional news and tips.',
    checked: false,
    onChange: fn(),
  },
} satisfies Meta<typeof SettingToggle>

export default meta
type Story = StoryObj<typeof meta>

/** Off: flipping it reports the new value. */
export const Off: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('checkbox', {
        name: 'Product news by email',
      }),
    )
    await expect(args.onChange).toHaveBeenCalledWith(true)
  },
}

/** On. */
export const On: Story = { args: { checked: true } }

/** Saving, or not allowed right now: the switch is disabled. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('checkbox', {
        name: 'Product news by email',
      }),
    ).toBeDisabled()
  },
}

/** The line under the label explains why it can't change. */
export const WithReason: Story = {
  args: {
    label: 'Browser notifications',
    description: 'This browser does not support notifications.',
    disabled: true,
  },
}
