import { Box, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Button } from '../Button'
import { NavDrawer } from './NavDrawer'

const sampleLinks = [
  { label: 'Home', href: '/' },
  { label: 'Tasks', href: '/tasks' },
  { label: 'Post a Job', href: '/tasks/create' },
] as const

function NavDrawerDemo({
  title = 'Menu',
  links = sampleLinks,
}: {
  title?: string
  links?: readonly { label: string; href: string }[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <Box p={4}>
      <Stack gap={4}>
        <Button size="sm" onClick={() => setOpen(true)}>
          Open drawer
        </Button>
        <NavDrawer
          open={open}
          onOpenChange={setOpen}
          title={title}
          links={links}
          footer={
            <Stack gap={2} w="full">
              <Button as="a" href="/login" size="sm" variant="subtle">
                Log in
              </Button>
              <Button as="a" href="/register" size="sm">
                Register
              </Button>
            </Stack>
          }
        />
      </Stack>
    </Box>
  )
}

const meta = {
  title: 'ui/NavDrawer',
  component: NavDrawerDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof NavDrawerDemo>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
