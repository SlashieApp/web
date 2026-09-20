import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CreateTaskScheduleSection } from './CreateTaskScheduleSection'

const meta: Meta<typeof CreateTaskScheduleSection> = {
  title: 'stepflow/tasks/create/ui/sections/CreateTaskScheduleSection',
  component: CreateTaskScheduleSection,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
