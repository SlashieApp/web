import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Button } from '../Button'
import { FormField } from '../FormField/FormField'
import { Input } from '../Input/Input'
import { Modal } from './Modal'

const meta = {
  title: 'ui/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Modal>

export default meta

type Story = StoryObj<typeof meta>

export const VerifyPhoneNumber: Story = {
  render: function VerifyPhoneModal() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button type="button" m={6} onClick={() => setOpen(true)}>
          Verify phone number
        </Button>
        <Modal
          title="Add contact phone number"
          open={open}
          onOpenChange={setOpen}
          onSubmit={() => setOpen(false)}
          submitLabel="Send code"
        >
          <Stack gap={4}>
            <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
              We’ll text a 6-digit code to confirm your number before you can
              quote on tasks.
            </Text>
            <FormField label="Mobile number">
              <Input placeholder="+44 7700 900000" />
            </FormField>
          </Stack>
        </Modal>
      </>
    )
  },
}

export const ChangeEmail: Story = {
  render: function ChangeEmailModal() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button
          type="button"
          variant="secondary"
          m={6}
          onClick={() => setOpen(true)}
        >
          Update email
        </Button>
        <Modal
          title="Change email address"
          open={open}
          onOpenChange={setOpen}
          onSubmit={() => setOpen(false)}
          submitLabel="Save"
        >
          <FormField
            label="New email"
            helperText="We’ll send a verification link to this address."
          >
            <Input type="email" placeholder="you@example.com" />
          </FormField>
        </Modal>
      </>
    )
  },
}
