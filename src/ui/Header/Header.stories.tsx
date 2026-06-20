import { HStack, Heading } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '../Button'
import { Header } from './Header'
import { headerMeWorker, seedHeaderMeStore } from './headerStoryFixtures'

const meta = {
  title: 'header/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Header>

export default meta

type Story = StoryObj<typeof meta>

export const BrowseLoggedIn: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/' } },
  },
  decorators: [
    (Story) => {
      seedHeaderMeStore(headerMeWorker)
      return <Story />
    },
  ],
  render: () => <Header />,
}

export const Dashboard: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/dashboard' } },
  },
  decorators: [
    (Story) => {
      seedHeaderMeStore(headerMeWorker)
      return <Story />
    },
  ],
  render: () => <Header />,
}

export const Guest: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/' } },
  },
  decorators: [
    (Story) => {
      seedHeaderMeStore(null)
      return <Story />
    },
  ],
  render: () => <Header />,
}

export const CustomChildren: Story = {
  render: () => (
    <Header>
      <HStack justify="space-between" w="full">
        <Heading size="md">Custom header</Heading>
        <Button size="sm">Action</Button>
      </HStack>
    </Header>
  ),
}
