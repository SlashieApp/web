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
        variant="overflow"
        onSubmit={async () => true}
      />
    </HStack>
  ),
}
