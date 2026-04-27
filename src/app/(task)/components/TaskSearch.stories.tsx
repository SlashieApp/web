import { Box, Button as ChakraButton } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { TaskSearchBase } from './TaskSearch'

const meta: Meta = {
  title: 'task/TaskSearch',
  parameters: {
    layout: 'padded',
  },
}

export default meta

type Story = StoryObj

export const ClosedOpensFiltersOpenTypes: Story = {
  render: function TaskSearchStory() {
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [value, setValue] = useState('')
    const [commits, setCommits] = useState(0)

    return (
      <Box maxW="460px">
        <ChakraButton
          type="button"
          size="sm"
          mb={3}
          onClick={() => setFiltersOpen((o) => !o)}
        >
          Toggle filters open (demo): {filtersOpen ? 'open' : 'closed'}
        </ChakraButton>
        <TaskSearchBase
          value={value}
          filtersOpen={filtersOpen}
          onValueChange={setValue}
          onActivateFilters={() => setFiltersOpen(true)}
          onCommitLocationSearch={() => setCommits((n) => n + 1)}
          onUseCurrentLocation={async () => {
            setValue('Example address after reverse geocode')
          }}
        />
        <Box mt={3} fontSize="sm" color="formLabelMuted">
          Location commits (open state): {commits}
        </Box>
      </Box>
    )
  },
}
