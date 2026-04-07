import { Box, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskBrowseMapHeroBackdrop } from './TaskBrowseMapHeroBackdrop'

const meta = {
  title: 'ui/TaskBrowseMapHeroBackdrop',
  component: TaskBrowseMapHeroBackdrop,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    display: 'block',
  },
} satisfies Meta<typeof TaskBrowseMapHeroBackdrop>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Box
      position="relative"
      h="220px"
      w="full"
      maxW="md"
      borderWidth="1px"
      borderColor="border"
      borderRadius="2xl"
      overflow="hidden"
    >
      <Box position="absolute" inset={0} bg="primary.100" opacity={0.35} />
      <TaskBrowseMapHeroBackdrop {...args} />
      <Text position="relative" zIndex={2} p={4} fontSize="xs" color="muted">
        Map would sit behind this gradient rail.
      </Text>
    </Box>
  ),
}
