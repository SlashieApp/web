import { HStack, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Button } from '../Button/Button'
import { FeedbackDialog } from './FeedbackDialog'
import { FeedbackDialogProvider } from './FeedbackDialogProvider'
import { FeedbackTrigger } from './FeedbackTrigger'

const meta = {
  title: 'ui/FeedbackDialog',
  component: FeedbackDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    open: true,
    onOpenChange: () => {},
    onSubmit: async () => true,
  },
} satisfies Meta<typeof FeedbackDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(true)
    return (
      <Stack gap={4}>
        <Button type="button" onClick={() => setOpen(true)}>
          Send feedback
        </Button>
        <FeedbackDialog {...args} open={open} onOpenChange={setOpen} />
      </Stack>
    )
  },
}

export const SignedIn: Story = {
  args: {
    defaultEmail: 'ryan@example.com',
    defaultName: 'Ryan Kwan',
    emailLocked: true,
  },
  render: function Render(args) {
    return <FeedbackDialog {...args} open onOpenChange={() => undefined} />
  },
}

export const Rating: Story = {
  render: function Render(args) {
    return <FeedbackDialog {...args} open onOpenChange={() => undefined} />
  },
}

export const Triggers: Story = {
  render: () => (
    <FeedbackDialogProvider onSubmit={async () => true}>
      <HStack gap={3} flexWrap="wrap" align="center">
        <FeedbackTrigger variant="button" />
        <FeedbackTrigger variant="nav" />
        <FeedbackTrigger variant="footer" />
        <FeedbackTrigger variant="footerMeta" />
      </HStack>
    </FeedbackDialogProvider>
  ),
}
