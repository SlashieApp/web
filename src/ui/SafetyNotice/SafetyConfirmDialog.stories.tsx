import { HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '../Button/Button'
import {
  SafetyConfirmDialog,
  type SafetyConfirmDialogProps,
} from './SafetyConfirmDialog'

const meta = {
  title: 'UI/SafetyNotice/SafetyConfirmDialog',
  component: SafetyConfirmDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { open: true, onOpenChange: fn(), onConfirm: fn() },
} satisfies Meta<typeof SafetyConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

/** The open dialog. It renders in a portal on `document.body`, not the canvas. */
async function findDialog(canvasElement: HTMLElement, name: string) {
  return within(
    await within(canvasElement.ownerDocument.body).findByRole('dialog', {
      name,
    }),
  )
}

/** A trigger button next to a dialog that opens and closes itself. */
function TriggeredConfirm({
  startOpen,
  onConfirm,
  ...args
}: SafetyConfirmDialogProps & { startOpen: boolean }) {
  const [open, setOpen] = useState(startOpen)
  return (
    <Stack gap={4} maxW="480px" align="flex-start">
      <Button type="button" onClick={() => setOpen(true)}>
        Accept quote
      </Button>
      <SafetyConfirmDialog
        {...args}
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => {
          onConfirm()
          setOpen(false)
        }}
      />
    </Stack>
  )
}

/** Two sample time slots, as a host screen passes in to pick before confirming. */
function SlotChoices({ selected }: { selected?: string }) {
  const slots = ['Sat 17 Oct, 9:00 am', 'Sun 18 Oct, 2:00 pm']
  return (
    <Stack gap={2}>
      <Text fontSize="sm" fontWeight={600} color="text.default">
        Choose a time
      </Text>
      <HStack gap={2} flexWrap="wrap">
        {slots.map((slot) => (
          <Button
            key={slot}
            type="button"
            size="sm"
            variant={slot === selected ? 'primary' : 'secondary'}
          >
            {slot}
          </Button>
        ))}
      </HStack>
    </Stack>
  )
}

/** Open: the accept-quote confirm with the safety line and the booking hint. */
export const Open: Story = {}

/** Closed: only the trigger button is on screen, the dialog is not mounted. */
export const Closed: Story = {
  render: (args) => <TriggeredConfirm {...args} startOpen={false} />,
}

/** Opening: clicking the trigger button opens the confirm dialog. */
export const OpensFromTrigger: Story = {
  render: (args) => <TriggeredConfirm {...args} startOpen={false} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Accept quote' }),
    )
    const dialog = await findDialog(canvasElement, 'Accept this quote?')
    await waitFor(
      () =>
        expect(
          dialog.getByRole('button', { name: 'Accept quote' }),
        ).toBeVisible(),
      { timeout: 3000 },
    )
  },
}

/** Confirming: the confirm button fires `onConfirm` and the dialog closes. */
export const ConfirmCloses: Story = {
  render: (args) => <TriggeredConfirm {...args} startOpen />,
  play: async ({ args, canvasElement }) => {
    const dialog = await findDialog(canvasElement, 'Accept this quote?')
    await userEvent.click(dialog.getByRole('button', { name: 'Accept quote' }))
    await expect(args.onConfirm).toHaveBeenCalledTimes(1)
    await waitFor(
      () =>
        expect(
          within(canvasElement.ownerDocument.body).queryByRole('dialog'),
        ).toBeNull(),
      { timeout: 3000 },
    )
  },
}

/** Loading: the confirm button shows its spinner while the mutation runs. */
export const Loading: Story = {
  args: { confirmLoading: true },
}

/** Extra content, incomplete: the confirm stays disabled until a time is picked. */
export const ConfirmDisabled: Story = {
  args: {
    confirmDisabled: true,
    children: <SlotChoices />,
  },
}

/** Extra content, complete: a time is chosen, so confirm is enabled. */
export const WithExtraContent: Story = {
  args: {
    children: <SlotChoices selected="Sat 17 Oct, 9:00 am" />,
  },
}

/** Custom copy: the host overrides the title and the confirm button label. */
export const CustomTitleAndLabel: Story = {
  args: {
    title: 'Book this worker?',
    confirmLabel: 'Book now',
  },
}

/** Phone: the dialog fills the narrow viewport width. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
