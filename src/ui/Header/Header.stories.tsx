import { HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '../Button'
import { Heading } from '../Typography'
import { Header } from './Header'

function HeaderStory() {
  return (
    <Header>
      <HStack justify="space-between" py={2}>
        <Heading size="md">HandyBox</Heading>
        <HStack gap={2}>
          <Button size="sm" variant="subtle" bg="surfaceContainerLow">
            Log in
          </Button>
          <Button size="sm">Post a job</Button>
        </HStack>
      </HStack>
    </Header>
  )
}

const meta: Meta<typeof HeaderStory> = {
  title: 'UI/Layout/Header',
  component: HeaderStory,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof HeaderStory>

export const Default: Story = {}
