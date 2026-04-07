import { Box, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskBrowseMapHeroSideRail } from './TaskBrowseMapHeroSideRail'

const meta = {
  title: 'ui/TaskBrowseMapHeroSideRail',
  component: TaskBrowseMapHeroSideRail,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    panelDisplay: 'flex',
  },
} satisfies Meta<typeof TaskBrowseMapHeroSideRail>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: null,
  },
  render: (args) => (
    <Box
      position="relative"
      h="200px"
      w="full"
      maxW="sm"
      borderWidth="1px"
      borderColor="border"
      borderRadius="md"
    >
      <TaskBrowseMapHeroSideRail {...args}>
        <Box
          bg="surfaceContainerLowest"
          p={3}
          borderRadius="lg"
          m={2}
          boxShadow="sm"
        >
          <Text fontSize="sm">Floating columns mount here.</Text>
        </Box>
      </TaskBrowseMapHeroSideRail>
    </Box>
  ),
}
