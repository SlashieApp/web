import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { QuotesPanel } from './QuotesPanel'

const meta: Meta<typeof QuotesPanel> = {
  title: 'task/tasks/ui/openTask/QuotesPanel',
  component: QuotesPanel,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
