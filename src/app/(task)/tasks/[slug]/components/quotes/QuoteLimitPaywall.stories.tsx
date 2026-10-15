import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'

import { QuoteLimitPaywall } from './QuoteLimitPaywall'

/** Shown to a worker who has used every free quote this month. */
const meta = {
  title: 'Task detail/Quotes/QuoteLimitPaywall',
  component: QuoteLimitPaywall,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuoteLimitPaywall>

export default meta
type Story = StoryObj<typeof meta>

/** The limit card with an Upgrade on billing button. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', {
      name: 'Upgrade on billing',
    })
  },
}

/** Phone width: the same card full width. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
}
