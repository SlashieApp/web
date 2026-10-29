import { HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import {
  barButton,
  bodyColumn,
  expectNoHorizontalOverflow,
  expectPhoneWidth,
  gapsBetweenChildren,
  openDialog,
  phone390,
} from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { formSpace } from '@/theme/styles'

import { Button } from '../Button/Button'
import { gapBelow } from '../FormField/formGap.testing'
import { scrollToEnd } from '../Modal/taskDialogSpacing.testing'
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

/**
 * Form spacing (FE-481, wiki Foundations-Form-Spacing), read between visible
 * edges: the body is a FormStack, so the choice a host passes in, the safety
 * line and the booking hint sit 20 apart, the first block 24 under the title, and
 * the last 20 above the buttons.
 */
async function expectConfirmSpacing(
  canvasElement: HTMLElement,
  blocks: number,
) {
  const { dialog, title, body } = await openDialog(
    canvasElement,
    'Accept this quote?',
  )
  const column = bodyColumn(body)

  await expect(column.children).toHaveLength(blocks)
  await expect(gapBelow(title, column.firstElementChild as HTMLElement)).toBe(
    formSpace.headerToBody,
  )
  await expect(gapsBetweenChildren(column)).toEqual(
    Array(blocks - 1).fill(formSpace.fieldGap),
  )
  await scrollToEnd(body)
  await expect(gapBelow(column, barButton(dialog, 'Accept quote'))).toBeCloseTo(
    formSpace.bodyToAction,
    0,
  )
  expectNoHorizontalOverflow(body)
}

/** Safety line and hint: 24 under the title, 20 apart, 20 above the buttons. */
export const Spacing: Story = {
  play: ({ canvasElement }) => expectConfirmSpacing(canvasElement, 2),
}

/** The same gaps at phone width. */
export const SpacingPhone: Story = {
  ...phone390,
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectConfirmSpacing(canvasElement, 2)
  },
}

/** With a choice above them: it is the first block, 24 under the title, and the three sit 20 apart. */
export const SpacingWithChoice: Story = {
  args: { children: <SlotChoices selected="Sat 17 Oct, 9:00 am" /> },
  play: ({ canvasElement }) => expectConfirmSpacing(canvasElement, 3),
}
