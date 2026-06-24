import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Button } from '../Button'
import { FormField } from '../FormField/FormField'
import { Input } from '../Input/Input'
import { Modal } from './Modal'

const meta = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    open: false,
    onOpenChange: () => {},
    title: 'Modal',
    size: 'md',
    submitLoading: false,
    submitDisabled: false,
    hideFooter: false,
    children: null,
  },
  argTypes: {
    title: { control: 'text' },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Max-width preset.',
    },
    submitLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    backLabel: { control: 'text' },
    submitLoading: { control: 'boolean' },
    submitDisabled: { control: 'boolean' },
    hideFooter: { control: 'boolean' },
    onOpenChange: { action: 'openChange' },
    onSubmit: { action: 'submit' },
    onCancel: { action: 'cancel' },
    onBack: { action: 'back' },
    children: { control: false, table: { disable: true } },
    footer: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof Modal>

export default meta

type Story = StoryObj<typeof meta>

/** A self-opening wrapper so each story has a trigger button + controlled open state. */
function ModalDemo({
  triggerLabel = 'Open modal',
  triggerVariant = 'primary',
  children,
  ...args
}: Omit<React.ComponentProps<typeof Modal>, 'open' | 'onOpenChange'> & {
  triggerLabel?: string
  triggerVariant?: React.ComponentProps<typeof Button>['variant']
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        m={6}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>
      <Modal
        {...args}
        open={open}
        onOpenChange={setOpen}
        onSubmit={() => setOpen(false)}
      >
        {children}
      </Modal>
    </>
  )
}

/** Default: title + body copy + primary/secondary footer actions. */
export const Default: Story = {
  args: {
    title: 'Add contact phone number',
    submitLabel: 'Send code',
  },
  render: (args) => (
    <ModalDemo {...args} triggerLabel="Verify phone number">
      <Stack gap={4}>
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          We will text a 6-digit code to confirm your number before you can
          quote on tasks.
        </Text>
        <FormField label="Mobile number">
          <Input placeholder="+44 7700 900000" />
        </FormField>
      </Stack>
    </ModalDemo>
  ),
}

/** Submit disabled: primary action is non-interactive until the form is valid. */
export const SubmitDisabled: Story = {
  args: {
    title: 'Change email address',
    submitLabel: 'Save',
    submitDisabled: true,
  },
  render: (args) => (
    <ModalDemo {...args} triggerLabel="Update email" triggerVariant="secondary">
      <FormField
        label="New email"
        helperText="Enter a new address to enable Save."
      >
        <Input type="email" placeholder="you@example.com" />
      </FormField>
    </ModalDemo>
  ),
}

/** Loading: primary action shows a spinner while the request is in flight. */
export const SubmitLoading: Story = {
  args: {
    title: 'Submitting quote',
    submitLabel: 'Send quote',
    submitLoading: true,
  },
  render: (args) => (
    <ModalDemo {...args} triggerLabel="Send quote">
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        Hang tight while we send your quote to the customer.
      </Text>
    </ModalDemo>
  ),
}

/** Error: the field surfaces a validation error tied via aria-describedby. */
export const FieldError: Story = {
  args: {
    title: 'Change email address',
    submitLabel: 'Save',
  },
  render: (args) => (
    <ModalDemo {...args} triggerLabel="Update email" triggerVariant="secondary">
      <FormField
        label="New email"
        errorText="That does not look like a valid email address."
      >
        <Input type="email" defaultValue="not-an-email" />
      </FormField>
    </ModalDemo>
  ),
}

/** Back-style secondary action (multi-step flows). */
export const WithBackAction: Story = {
  args: {
    title: 'Confirm details',
    submitLabel: 'Confirm',
    backLabel: 'Back',
  },
  render: (args) => (
    <ModalDemo {...args} triggerLabel="Continue">
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        Step 2 of 2. Review your details before confirming.
      </Text>
    </ModalDemo>
  ),
}

/** No footer: caller renders its own actions inside the body. */
export const NoFooter: Story = {
  args: {
    title: 'Quick note',
    hideFooter: true,
  },
  render: (args) => (
    <ModalDemo {...args} triggerLabel="Open note">
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        This dialog hides the default footer; close it with the X, ESC, or by
        clicking the scrim.
      </Text>
    </ModalDemo>
  ),
}

/** AllVariants: every size rendered side-by-side as independent triggers. */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack direction={{ base: 'column', md: 'row' }} gap={2} p={4} wrap="wrap">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <ModalDemo
          key={size}
          title={`Size: ${size}`}
          size={size}
          submitLabel="Confirm"
          triggerLabel={`Open ${size}`}
          triggerVariant="secondary"
        >
          <Text fontSize="sm" color="text.muted" lineHeight="tall">
            The {size} preset constrains the dialog max-width. Body copy uses
            text.muted; the surface, border, and footer divider all reference
            SDL semantic roles.
          </Text>
        </ModalDemo>
      ))}
    </Stack>
  ),
}
