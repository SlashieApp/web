import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { buildQuickActions } from '../../helpers/dashboardOverview'
import bag from '../../i11n.json'
import { DashboardQuickActions } from './DashboardQuickActions'

const copy = bag.en.quickActions

const meta = {
  title: 'Dashboard/Home/DashboardQuickActions',
  component: DashboardQuickActions,
  parameters: { layout: 'padded' },
  args: { actions: buildQuickActions(true, copy) },
} satisfies Meta<typeof DashboardQuickActions>

export default meta
type Story = StoryObj<typeof meta>

/** Worker: five shortcuts, the last keeps the worker profile fresh. */
export const Worker: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Keep your worker profile fresh'),
    ).toBeVisible()
    await expect(canvas.getAllByRole('link')).toHaveLength(5)
  },
}

/** Customer: the last shortcut invites them to set up a worker profile. */
export const Customer: Story = {
  args: { actions: buildQuickActions(false, copy) },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Set up your worker profile'),
    ).toBeVisible()
  },
}

/** Phones: the shortcuts stack in a single column. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
}
