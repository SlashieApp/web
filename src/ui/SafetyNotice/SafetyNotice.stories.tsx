import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Button } from '../Button/Button'
import { SafetyConfirmDialog } from './SafetyConfirmDialog'
import { SafetyNotice } from './SafetyNotice'

const meta = {
  title: 'ui/SafetyNotice',
  component: SafetyNotice,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { variant: 'inline' },
} satisfies Meta<typeof SafetyNotice>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Panel: Story = {
  args: { variant: 'panel' },
}

export const Complete: Story = {
  args: { variant: 'complete' },
}

export const AcceptConfirm: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <Stack gap={4} maxW="480px">
        <Button type="button" onClick={() => setOpen(true)}>
          Accept quote
        </Button>
        <SafetyConfirmDialog
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => setOpen(false)}
        />
      </Stack>
    )
  },
}
