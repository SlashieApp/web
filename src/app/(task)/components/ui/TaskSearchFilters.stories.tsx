import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskBrowseProvider } from '../../context/TaskBrowseProvider'
import { TaskSearch } from './TaskSearch'
import { TaskSearchFilters } from './TaskSearchFilters'

const meta: Meta = {
  title: 'Tasks/TaskSearchFilters',
  parameters: { layout: 'padded' },
  render: () => (
    <TaskBrowseProvider initialTasks={[]} isDesktop skipTasksQuery>
      <Box maxW="420px" display="flex" flexDirection="column" gap={2}>
        <TaskSearch mode="input" />
        <TaskSearchFilters />
      </Box>
    </TaskBrowseProvider>
  ),
}

export default meta
type Story = StoryObj

/** Date and Budget chips; each opens its panel, active chips get an ×. */
export const Default: Story = {}
