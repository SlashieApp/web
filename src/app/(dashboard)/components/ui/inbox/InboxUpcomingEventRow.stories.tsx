import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { InboxUpcomingEventRow } from './InboxUpcomingEventRow'

const meta: Meta<typeof InboxUpcomingEventRow> = {
  title: 'dashboard/ui/inbox/InboxUpcomingEventRow',
  component: InboxUpcomingEventRow,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
