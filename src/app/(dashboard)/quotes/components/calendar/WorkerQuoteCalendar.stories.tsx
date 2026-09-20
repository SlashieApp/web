import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerQuoteCalendar } from './WorkerQuoteCalendar'

const meta: Meta<typeof WorkerQuoteCalendar> = {
  title: 'dashboard/quotes/calendar/WorkerQuoteCalendar',
  component: WorkerQuoteCalendar,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
