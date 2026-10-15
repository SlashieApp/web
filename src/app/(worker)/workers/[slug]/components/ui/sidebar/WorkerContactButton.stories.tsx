import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerContactButton } from './WorkerContactButton'

const meta: Meta<typeof WorkerContactButton> = {
  title: 'Worker profile/WorkerContactButton',
  component: WorkerContactButton,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
