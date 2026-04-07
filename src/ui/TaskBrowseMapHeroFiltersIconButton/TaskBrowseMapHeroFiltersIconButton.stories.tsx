import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskBrowseMapHeroFiltersIconButton } from './TaskBrowseMapHeroFiltersIconButton'

const meta = {
  title: 'ui/TaskBrowseMapHeroFiltersIconButton',
  component: TaskBrowseMapHeroFiltersIconButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    onOpenFilters: () => {},
  },
} satisfies Meta<typeof TaskBrowseMapHeroFiltersIconButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Box position="relative" h="100px" w="full" maxW="md">
      <TaskBrowseMapHeroFiltersIconButton {...args} />
    </Box>
  ),
}
