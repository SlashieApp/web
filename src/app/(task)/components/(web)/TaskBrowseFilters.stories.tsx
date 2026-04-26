import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskBrowseFilters } from './TaskBrowseFilters'

const meta = {
  title: 'ui/Card',
  component: TaskBrowseFilters,
  // tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    searchQuery: 'plumber',
    onSearchChange: () => {},
    areaLocationInput: 'Soho, London',
    onAreaLocationChange: () => {},
    onAreaLocationCommit: () => {},
    radiusMiles: 10,
    onRadiusChange: () => {},
    minBudgetPounds: '50',
    maxBudgetPounds: '300',
    onMinBudgetChange: () => {},
    onMaxBudgetChange: () => {},
    urgency: 'any',
    onUrgencyChange: () => {},
  },
  render: (args) => (
    <Box maxW="460px">
      <TaskBrowseFilters {...args} />
    </Box>
  ),
} satisfies Meta<typeof TaskBrowseFilters>

export default meta

type Story = StoryObj<typeof meta>

export const Filter: Story = {}
