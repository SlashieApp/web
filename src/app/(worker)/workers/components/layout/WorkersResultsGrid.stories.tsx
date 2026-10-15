import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkersResultsGrid } from './WorkersResultsGrid'

const meta: Meta<typeof WorkersResultsGrid> = {
  title: 'Workers/WorkersResultsGrid',
  component: WorkersResultsGrid,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
