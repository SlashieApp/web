import { Box, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { TaskSearchBase } from './TaskSearch'

const copy = {
  placeholder: 'Search a task',
  clearSearch: 'Clear search',
  useCurrentLocation: 'Use current location',
}

const meta: Meta = {
  title: 'Tasks/TaskSearch',
  parameters: {
    layout: 'padded',
  },
}

export default meta

type Story = StoryObj

/** Desktop panel / mobile sheet: typing searches; Enter applies at once. */
export const Input: Story = {
  render: function TaskSearchInputStory() {
    const [value, setValue] = useState('garden')
    const [commits, setCommits] = useState(0)
    return (
      <Stack maxW="460px" gap={3}>
        <TaskSearchBase
          mode="input"
          value={value}
          onValueChange={setValue}
          onCommit={() => setCommits((n) => n + 1)}
          onClear={() => setValue('')}
          onOpen={() => {}}
          onUseCurrentLocation={() => {}}
          copy={copy}
        />
        <Box fontSize="sm" color="text.muted">
          Enter presses: {commits}
        </Box>
      </Stack>
    )
  },
}

/** Results loading: inline spinner. */
export const Pending: Story = {
  render: () => (
    <Box maxW="460px">
      <TaskSearchBase
        mode="input"
        value="garden"
        pending
        onValueChange={() => {}}
        onCommit={() => {}}
        onClear={() => {}}
        onOpen={() => {}}
        onUseCurrentLocation={() => {}}
        copy={copy}
      />
    </Box>
  ),
}

/** Collapsed mobile bar: read-only, opens the search sheet. */
export const Trigger: Story = {
  render: function TaskSearchTriggerStory() {
    const [opens, setOpens] = useState(0)
    return (
      <Stack maxW="460px" gap={3}>
        <TaskSearchBase
          mode="trigger"
          value=""
          onValueChange={() => {}}
          onCommit={() => {}}
          onClear={() => {}}
          onOpen={() => setOpens((n) => n + 1)}
          onUseCurrentLocation={() => {}}
          copy={copy}
        />
        <Box fontSize="sm" color="text.muted">
          Sheet opens: {opens}
        </Box>
      </Stack>
    )
  },
}
