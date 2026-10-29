import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { desktop1280 } from '@/app/(stepflow)/stepFlowSpacing.testing'

import {
  expectPanelPadding,
  openPopover,
} from '../Dropdown/menuSpacing.testing'
import {
  ReportControl,
  type ReportControlProps,
  type ReportControlVariant,
} from './ReportControl'

const VARIANTS: ReportControlVariant[] = ['button', 'menu', 'icon', 'overflow']

/** Fictional task photo as a data URI, so stories never fetch remote images. */
const TASK_PHOTO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#d8efe3"/><rect x="22" y="38" width="76" height="46" rx="5" fill="#1f6f4a"/><rect x="30" y="45" width="60" height="32" rx="2" fill="#0f3d2a"/><rect x="48" y="88" width="24" height="6" rx="2" fill="#1f6f4a"/></svg>',
)}`

const meta = {
  title: 'UI/ReportDialog/ReportControl',
  component: ReportControl,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    kind: {
      control: 'select',
      options: ['task', 'worker', 'user', 'review', 'message'],
    },
    variant: { control: 'inline-radio', options: VARIANTS },
    onSubmit: { control: false },
  },
  args: {
    kind: 'task',
    targetId: 'task-42',
    targetTitle: 'Mount a 55-inch TV',
    targetMeta: 'Southwark · Tech setup',
    targetImageSrc: TASK_PHOTO,
    variant: 'button',
    onSubmit: async () => true,
    onOpened: fn(),
  },
} satisfies Meta<typeof ReportControl>

export default meta
type Story = StoryObj<typeof meta>

/** The report dialog. It renders in a portal on `document.body`, not the canvas. */
async function findDialog(canvasElement: HTMLElement, name: string) {
  return within(
    await within(canvasElement.ownerDocument.body).findByRole('dialog', {
      name,
    }),
  )
}

/** Controlled by local state so the open dialog can also be closed again. */
function ControlledReport(args: ReportControlProps) {
  const [open, setOpen] = useState(true)
  return <ReportControl {...args} open={open} onOpenChange={setOpen} />
}

/** Right-aligned slot with room below, like the task-detail header actions. */
function EndSlot({ children }: { children: React.ReactNode }) {
  return (
    <Box
      display="flex"
      justifyContent="flex-end"
      alignItems="flex-start"
      minH="160px"
    >
      {children}
    </Box>
  )
}

/** Button (default): small ghost button with a flag icon and the report label. */
export const Button: Story = { args: { variant: 'button' } }

/** Menu: full-width ghost row for use inside an existing menu or drawer. */
export const Menu: Story = {
  args: { variant: 'menu' },
  render: (args) => (
    <Box maxW="260px">
      <ReportControl {...args} />
    </Box>
  ),
}

/** Icon: icon-only button, labelled for screen readers (profile headers). */
export const Icon: Story = {
  args: {
    variant: 'icon',
    kind: 'worker',
    targetId: 'worker-9',
    targetTitle: 'Jordan Lee',
    targetMeta: 'Peckham',
    targetImageSrc: undefined,
  },
}

/** Overflow: kebab button that opens a one-item menu holding the report action. */
export const Overflow: Story = {
  args: { variant: 'overflow' },
  render: (args) => (
    <EndSlot>
      <ReportControl {...args} />
    </EndSlot>
  ),
}

/** Overflow, menu open: the popover shows the report action under the kebab. */
export const OverflowMenuOpen: Story = {
  args: { variant: 'overflow' },
  render: (args) => (
    <EndSlot>
      <ReportControl {...args} />
    </EndSlot>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'More actions' }),
    )
    await waitFor(
      () =>
        expect(
          within(canvasElement).getByRole('button', { name: 'Report task' }),
        ).toBeVisible(),
      { timeout: 3000 },
    )
  },
}

/** Overflow, menu open: the one row sits 8 inside the panel on every side (FE-481 menus), a panel sized to its row. */
export const OverflowMenuSpacing: Story = {
  ...desktop1280,
  args: { variant: 'overflow' },
  render: (args) => (
    <EndSlot>
      <ReportControl {...args} />
    </EndSlot>
  ),
  play: async ({ canvasElement }) => {
    const panel = await openPopover(
      within(canvasElement).getByRole('button', { name: 'More actions' }),
    )
    await expectPanelPadding(panel)
  },
}

/** Overflow on a phone: the same menu opens as a bottom sheet instead of a popover. */
export const OverflowMenuOpenOnPhone: Story = {
  args: { variant: 'overflow' },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: (args) => (
    <EndSlot>
      <ReportControl {...args} />
    </EndSlot>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'More actions' }),
    )
    const sheet = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'More actions' },
    )
    await waitFor(
      () =>
        expect(
          within(sheet).getByRole('button', { name: 'Report task' }),
        ).toBeVisible(),
      { timeout: 3000 },
    )
  },
}

/** Worker kind: the label and accessible name switch to "Report worker". */
export const ReportWorker: Story = {
  args: {
    kind: 'worker',
    targetId: 'worker-9',
    targetTitle: 'Jordan Lee',
    targetMeta: 'Peckham',
    targetImageSrc: undefined,
  },
}

/** User kind: the label and accessible name switch to "Report profile". */
export const ReportUser: Story = {
  args: {
    kind: 'user',
    targetId: 'user-3',
    targetTitle: 'Alex Morgan',
    targetMeta: 'Member since 2024',
    targetImageSrc: undefined,
  },
}

/** Review kind: the label and accessible name switch to "Report this review". */
export const ReportReview: Story = {
  args: {
    kind: 'review',
    targetId: 'review-7',
    targetTitle: 'Did not match what we agreed.',
    targetMeta: '2 stars, 3 days ago',
    targetImageSrc: undefined,
  },
}

/** Message kind: the label and accessible name switch to "Report message". */
export const ReportMessage: Story = {
  args: {
    kind: 'message',
    targetId: 'message-11',
    targetTitle: 'Is there parking near the building?',
    targetMeta: 'Sent today at 9:20 am',
    targetImageSrc: undefined,
  },
}

/** Dialog open: the controlled `open` prop shows the report dialog from the start. */
export const DialogOpen: Story = {
  render: (args) => <ControlledReport {...args} />,
}

/** Click: the button opens the report dialog and reports `onOpened`. */
export const OpensDialogOnClick: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Report task' }),
    )
    const dialog = await findDialog(canvasElement, 'Report this task')
    await waitFor(() => expect(dialog.getByRole('combobox')).toBeVisible(), {
      timeout: 3000,
    })
    await expect(args.onOpened).toHaveBeenCalledTimes(1)
  },
}

/** Blocked: when `onRequestOpen` returns false (signed out) the dialog never opens. */
export const BlockedWhenSignedOut: Story = {
  args: { onRequestOpen: fn(() => false) },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Report task' }),
    )
    await expect(args.onRequestOpen).toHaveBeenCalledTimes(1)
    await expect(args.onOpened).not.toHaveBeenCalled()
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).toBeNull()
  },
}

/** Every variant, each under its name. */
export const AllVariants: Story = {
  render: (args) => (
    <Stack gap={5} maxW="320px">
      {VARIANTS.map((variant) => (
        <Stack key={variant} gap={1} align="flex-start">
          <Text fontSize="xs" color="text.muted">
            {variant}
          </Text>
          <ReportControl {...args} variant={variant} />
        </Stack>
      ))}
    </Stack>
  ),
}
