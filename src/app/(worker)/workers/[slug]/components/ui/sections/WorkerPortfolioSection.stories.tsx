import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerPortfolioSection } from './WorkerPortfolioSection'

const meta: Meta<typeof WorkerPortfolioSection> = {
  title: 'Worker profile/WorkerPortfolioSection',
  component: WorkerPortfolioSection,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
