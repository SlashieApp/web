import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerAboutSection } from './WorkerAboutSection'

const meta: Meta<typeof WorkerAboutSection> = {
  title: 'Worker profile/WorkerAboutSection',
  component: WorkerAboutSection,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
