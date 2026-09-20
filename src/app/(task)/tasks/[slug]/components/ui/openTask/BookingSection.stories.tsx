import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { BookingSection } from './BookingSection'

const meta: Meta<typeof BookingSection> = {
  title: 'task/tasks/ui/openTask/BookingSection',
  component: BookingSection,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
