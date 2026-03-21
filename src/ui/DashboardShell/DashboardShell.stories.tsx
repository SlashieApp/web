import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Heading, Text } from '../Typography'
import { DashboardShell } from './DashboardShell'

function DashboardShellStory() {
  const [search, setSearch] = useState('')
  return (
    <DashboardShell
      activeNav="jobs"
      searchValue={search}
      onSearchChange={setSearch}
      userLabel="craftsman@example.com"
      userInitial="C"
      userStatus="Verified worker workspace"
      workerEnabled
    >
      <Stack gap={4}>
        <Heading size="lg">My Jobs</Heading>
        <Text color="muted">
          Shell content area — listings and summaries render here.
        </Text>
      </Stack>
    </DashboardShell>
  )
}

const meta = {
  title: 'layout/DashboardShell',
  component: DashboardShellStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DashboardShellStory>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
