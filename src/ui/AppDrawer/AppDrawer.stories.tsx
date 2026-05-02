import { Box, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Button } from '../Button'
import { AppDrawer } from './AppDrawer'

const meta = {
  title: 'ui/AppDrawer',
  component: AppDrawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    title: 'Filters',
    description: 'Refine results by category and budget.',
    placement: 'start' as const,
    size: 'md' as const,
    primaryActionLabel: 'Apply',
  },
} satisfies Meta<typeof AppDrawer>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: false,
    onOpenChange: () => {},
    children: null,
  },
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <Box>
        <Button type="button" onClick={() => setOpen(true)}>
          Open drawer
        </Button>
        <AppDrawer {...args} open={open} onOpenChange={setOpen}>
          <Text fontSize="sm" color="formLabelMuted">
            Drawer body content goes here.
          </Text>
        </AppDrawer>
      </Box>
    )
  },
}
