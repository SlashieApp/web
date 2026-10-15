import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MessagesContext } from '../context/MessagesProvider'
import { ThreadList } from './ThreadList'
import { messagesValue } from './messagesStoryFixtures'

const meta = {
  title: 'Messages/ThreadList',
  component: ThreadList,
  args: { selectedId: 't1' },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ThreadList>

export default meta
type Story = StoryObj<typeof meta>

function Frame({
  value,
  selectedId,
}: {
  value: ReturnType<typeof messagesValue>
  selectedId: string | null
}) {
  return (
    <MessagesContext.Provider value={value}>
      <Box
        maxW="360px"
        h="560px"
        display="flex"
        flexDirection="column"
        bg="bg.surface"
      >
        <ThreadList selectedId={selectedId} />
      </Box>
    </MessagesContext.Provider>
  )
}

export const Default: Story = {
  render: (args) => <Frame value={messagesValue()} {...args} />,
}

export const Empty: Story = {
  args: { selectedId: null },
  render: (args) => (
    <Frame value={messagesValue({ threads: [], unreadCount: 0 })} {...args} />
  ),
}

export const LoadError: Story = {
  args: { selectedId: null },
  render: (args) => (
    <Frame value={messagesValue({ threads: [], error: true })} {...args} />
  ),
}
