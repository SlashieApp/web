import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Container } from './Container'

const meta: Meta<typeof Container> = {
  title: 'UI/Layout/Container',
  component: Container,
}

export default meta

type Story = StoryObj<typeof Container>

export const Default: Story = {
  render: (args) => (
    <Box bg="surfaceContainerLow" py={8}>
      <Container {...args}>
        <Box bg="surfaceContainerLowest" p={4} borderRadius="md">
          Container content
        </Box>
      </Container>
    </Box>
  ),
}
