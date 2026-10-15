import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { BillingNonWorkerState } from './BillingNonWorkerState'

const meta = {
  title: 'Dashboard/Billing/BillingNonWorkerState',
  component: BillingNonWorkerState,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BillingNonWorkerState>

export default meta
type Story = StoryObj<typeof meta>

/** A customer on the billing page: billing is for workers, with a link to set up a worker profile. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', {
        name: 'Set up worker profile',
      }),
    ).toBeVisible()
  },
}

/** Phones: the button fills the width. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
}
