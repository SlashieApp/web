import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { EditTaskAcceptedWorkerCapSection } from './EditTaskAcceptedWorkerCapSection'

const meta: Meta<typeof EditTaskAcceptedWorkerCapSection> = {
  title: 'task/tasks/edit/ui/EditTaskAcceptedWorkerCapSection',
  component: EditTaskAcceptedWorkerCapSection,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
