import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { WebPushSetting } from './WebPushSetting'

const meta = {
  title: 'Dashboard/Account/WebPushSetting',
  component: WebPushSetting,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    label: 'Browser notifications',
    description:
      'Get a notification when a quote, job update, or review request arrives and this tab is in the background.',
    checked: false,
    onChange: fn(),
  },
} satisfies Meta<typeof WebPushSetting>

export default meta
type Story = StoryObj<typeof meta>

/** Off: ready to be turned on. */
export const Off: Story = {
  play: async ({ canvasElement, args }) => {
    const toggle = within(canvasElement).getByRole('checkbox', {
      name: 'Browser notifications',
    })
    await userEvent.click(toggle)
    await expect(args.onChange).toHaveBeenCalledWith(true)
  },
}

/** On: notifications are enabled. */
export const On: Story = {
  args: { checked: true },
}

/** Busy: a change is being saved, so the switch is disabled. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('checkbox', {
        name: 'Browser notifications',
      }),
    ).toBeDisabled()
  },
}

/** Unavailable: the reason replaces the description and the switch is disabled. */
export const Unavailable: Story = {
  args: {
    unavailable: 'Browser notifications are not available in this browser yet.',
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('checkbox', {
        name: 'Browser notifications',
      }),
    ).toBeDisabled()
  },
}

/** Error text in place of the description, switch left off. */
export const DeniedByBrowser: Story = {
  args: {
    description: 'Notifications stay off until you allow them in the browser.',
  },
}
