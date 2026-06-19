import { Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Button } from '../Button'
import { Modal } from './Modal'

const meta = {
  title: 'ui/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    title: 'Add contact phone number',
    size: 'md' as const,
    cancelLabel: 'Cancel',
    submitLabel: 'Submit',
  },
} satisfies Meta<typeof Modal>

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
      <>
        <Button type="button" onClick={() => setOpen(true)}>
          Open modal
        </Button>
        <Modal
          {...args}
          open={open}
          onOpenChange={setOpen}
          onSubmit={() => setOpen(false)}
        >
          <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
            Enter your new contact phone number below to get verified.
          </Text>
        </Modal>
      </>
    )
  },
}
