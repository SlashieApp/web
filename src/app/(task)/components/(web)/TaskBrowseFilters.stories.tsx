import { ApolloProvider } from '@apollo/client/react'
import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { apolloClient } from '@/utils/apolloClient'
import { TaskBrowseProvider } from '../../context/TaskBrowseProvider'

import { TaskBrowseFilters } from './TaskBrowseFilters'

const meta = {
  title: 'task/TaskBrowseFilters',
  component: TaskBrowseFilters,
  parameters: {
    layout: 'padded',
  },
  args: {
    searchQuery: '',
    onSearchChange: () => {},
    radiusMiles: 10,
    onRadiusChange: () => {},
    minBudgetPounds: '50',
    maxBudgetPounds: '300',
    onMinBudgetChange: () => {},
    onMaxBudgetChange: () => {},
    urgency: 'any' as const,
    onUrgencyChange: () => {},
  },
  decorators: [
    (Story) => (
      <ApolloProvider client={apolloClient}>
        <TaskBrowseProvider initialTasks={[]} isDesktop>
          <Story />
        </TaskBrowseProvider>
      </ApolloProvider>
    ),
  ],
  render: (args) => (
    <Box maxW="460px">
      <TaskBrowseFilters {...args} />
    </Box>
  ),
} satisfies Meta<typeof TaskBrowseFilters>

export default meta

type Story = StoryObj<typeof meta>

export const Filter: Story = {}
