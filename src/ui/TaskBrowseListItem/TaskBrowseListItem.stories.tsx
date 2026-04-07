import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskBrowseListItem } from './TaskBrowseListItem'

const meta = {
  title: 'ui/TaskBrowseListItem',
  component: TaskBrowseListItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    title: 'Replace kitchen tap',
    description:
      'Leaking mixer tap in Shoreditch flat. Parts on site; need a qualified plumber.',
    priceLabel: '£85',
    metaLine: '0.8 miles · E1',
    detailsHref: '/task/demo',
    badgeVariant: 'none' as const,
    isActive: false,
  },
} satisfies Meta<typeof TaskBrowseListItem>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithEmergencyBadge: Story = {
  args: {
    badgeVariant: 'emergency',
    badgeText: 'EMERGENCY',
  },
}

export const Active: Story = {
  args: {
    isActive: true,
  },
}

export const InList: Story = {
  args: {},
  render: () => (
    <Stack gap={3} maxW="md">
      <TaskBrowseListItem
        title="Replace kitchen tap"
        description="Leaking mixer tap; parts on site."
        priceLabel="£85"
        metaLine="E1"
        detailsHref="/task/1"
        isActive
        onActivate={() => {}}
      />
      <TaskBrowseListItem
        title="Garden fence repair"
        description="Storm damage to 3 panels along the side return."
        priceLabel="Open"
        metaLine="N16"
        detailsHref="/task/2"
        badgeVariant="featured"
        badgeText="BIG PROJECT"
        onActivate={() => {}}
      />
    </Stack>
  ),
}
