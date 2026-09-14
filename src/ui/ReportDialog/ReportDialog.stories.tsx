import { HStack, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Button } from '../Button/Button'
import { ReportControl } from './ReportControl'
import { ReportDialog } from './ReportDialog'

const meta = {
  title: 'ui/ReportDialog',
  component: ReportDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    open: true,
    onOpenChange: () => {},
    kind: 'task',
    targetTitle: 'Mount a 55-inch TV',
    targetMeta: 'Southwark · Tech setup',
    targetImageSrc:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=300&fit=crop',
    onSubmit: async () => true,
  },
} satisfies Meta<typeof ReportDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(true)
    return (
      <Stack gap={4}>
        <Button type="button" onClick={() => setOpen(true)}>
          Report task
        </Button>
        <ReportDialog {...args} open={open} onOpenChange={setOpen} />
      </Stack>
    )
  },
}

export const Worker: Story = {
  args: {
    kind: 'worker',
    targetTitle: 'Jordan Lee',
    targetMeta: 'Peckham',
  },
  render: function Render(args) {
    const [open, setOpen] = useState(true)
    return <ReportDialog {...args} open={open} onOpenChange={() => undefined} />
  },
}

export const Triggers: Story = {
  render: () => (
    <HStack gap={3} flexWrap="wrap">
      <ReportControl
        kind="task"
        targetId="task-42"
        targetTitle="Garden tidy"
        targetMeta="Peckham · Cleaning"
        targetImageSrc="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=300&fit=crop"
        variant="button"
        onSubmit={async () => true}
      />
      <ReportControl
        kind="worker"
        targetId="worker-9"
        targetTitle="Jordan"
        variant="icon"
        onSubmit={async () => true}
      />
      <ReportControl
        kind="task"
        targetId="task-42"
        targetTitle="Garden tidy"
        targetMeta="Peckham · Cleaning"
        targetImageSrc="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=300&fit=crop"
        variant="overflow"
        onSubmit={async () => true}
      />
    </HStack>
  ),
}
