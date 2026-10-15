import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Button } from '../Button/Button'
import { SafetyConfirmDialog } from './SafetyConfirmDialog'
import { SafetyNotice } from './SafetyNotice'

const meta = {
  title: 'UI/SafetyNotice',
  component: SafetyNotice,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { variant: 'inline' },
} satisfies Meta<typeof SafetyNotice>

export default meta
type Story = StoryObj<typeof meta>

/** Inline: one muted line with a link, shown next to accept and complete actions. */
export const Default: Story = {}

/** Panel: the fuller trust card with icon, heading, body and link. */
export const Panel: Story = {
  args: { variant: 'panel' },
}

/** Inline on a phone: the line wraps over several rows at the narrow width. */
export const InlineMobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Panel on a phone: the trust card tightens its padding and gaps. */
export const PanelMobile: Story = {
  args: { variant: 'panel' },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Accept confirm: the dialog that shows the inline notice before accepting a quote. */
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
