import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PostedTaskCalendar } from './PostedTaskCalendar'

const meta: Meta<typeof PostedTaskCalendar> = {
  title: 'dashboard/requests/calendar/PostedTaskCalendar',
  component: PostedTaskCalendar,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
