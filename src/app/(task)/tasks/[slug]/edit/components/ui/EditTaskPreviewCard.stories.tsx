import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskStatusPill } from '../../../components/ui/TaskStatusPill'
import { EditTaskPreviewCard } from './EditTaskPreviewCard'

const meta: Meta<typeof EditTaskPreviewCard> = {
  title: 'task/tasks/edit/ui/EditTaskPreviewCard',
  component: EditTaskPreviewCard,
  parameters: { layout: 'padded' },
  args: {
    eyebrow: 'Task preview',
    statusBadge: <TaskStatusPill status="OPEN" size="sm" />,
    title: 'feed my cat',
    description:
      "Need someone to feed my cat while I'm away. Please make sure he has fresh water and food.",
    locationLabel: 'London',
    whenLabel: 'Sat 19 Sept · Any time',
    categoryLabel: 'Delivery',
    budgetLabel: '£23',
    lat: 51.5074,
    lng: -0.0719,
    mapboxAccessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  },
  decorators: [
    (Story) => (
      <Box maxW="400px">
        <Story />
      </Box>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
