import { HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from './Button'

const meta = {
  title: 'ui/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const PostTask: Story = {
  render: () => <Button variant="primary">Post a task</Button>,
}

export const ReviewQuotes: Story = {
  render: () => <Button variant="primary">Review quotes</Button>,
}

export const SendQuote: Story = {
  render: () => <Button variant="primary">Send quote</Button>,
}

export const SaveDraft: Story = {
  render: () => <Button variant="secondary">Save draft</Button>,
}

export const SignIn: Story = {
  render: () => <Button variant="primary">Sign in</Button>,
}

export const CreateAccount: Story = {
  render: () => <Button variant="secondary">Create account</Button>,
}

export const ContinueAsGuest: Story = {
  render: () => <Button variant="ghost">Continue as guest</Button>,
}

export const ConfirmBooking: Story = {
  render: () => <Button variant="success">Confirm booking</Button>,
}

export const CancelTask: Story = {
  render: () => <Button variant="danger">Cancel task</Button>,
}

export const Dismiss: Story = {
  render: () => <Button variant="ghost">Dismiss</Button>,
}

export const CompactToolbar: Story = {
  render: () => (
    <HStack gap={2}>
      <Button size="sm" variant="secondary">
        Edit task
      </Button>
      <Button size="sm" variant="ghost">
        Share
      </Button>
      <Button size="sm" variant="primary">
        Choose pro
      </Button>
    </HStack>
  ),
}
