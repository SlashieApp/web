import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { ViewSwitch } from './ViewSwitch'

const meta = {
  title: 'ui/ViewSwitch',
  component: ViewSwitch,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {},
} satisfies Meta<typeof ViewSwitch>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 'list',
    onChange: () => {},
  },
  render: () => {
    const [value, setValue] = useState<'list' | 'map'>('list')
    return (
      <Box position="relative" h="80px">
        <ViewSwitch value={value} onChange={setValue} />
      </Box>
    )
  },
}
