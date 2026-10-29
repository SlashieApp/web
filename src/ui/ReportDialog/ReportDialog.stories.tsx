import { HStack, Stack } from '@chakra-ui/react'
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
import { gapBelow, heightOf } from '../FormField/formGap.testing'
import {
  controlOf,
  expectField,
  scrollToEnd,
} from '../Modal/taskDialogSpacing.testing'
import { ReportControl } from './ReportControl'
import { ReportDialog, type ReportDialogProps } from './ReportDialog'

/** Fictional illustrations as data URIs, so stories never fetch remote images. */
const svgImage = (body: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${body}</svg>`,
  )}`

const TASK_PHOTO = svgImage(
  '<rect width="120" height="120" fill="#d8efe3"/><rect x="22" y="38" width="76" height="46" rx="5" fill="#1f6f4a"/><rect x="30" y="45" width="60" height="32" rx="2" fill="#0f3d2a"/><rect x="48" y="88" width="24" height="6" rx="2" fill="#1f6f4a"/>',
)

const PROFILE_PHOTO = svgImage(
  '<rect width="120" height="120" fill="#e6e9f5"/><circle cx="60" cy="46" r="20" fill="#5b6bb5"/><path d="M20 112c4-26 22-36 40-36s36 10 40 36z" fill="#5b6bb5"/>',
)

const meta = {
  title: 'UI/ReportDialog',
  component: ReportDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    open: true,
    onOpenChange: () => {},
    kind: 'task',
    targetTitle: 'Mount a 55-inch TV',
    targetMeta: 'Southwark · Tech setup',
    targetImageSrc: TASK_PHOTO,
    onSubmit: async () => true,
  },
} satisfies Meta<typeof ReportDialog>

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
function TriggeredDialog({
  startOpen,
  ...args
}: ReportDialogProps & { startOpen: boolean }) {
  const [open, setOpen] = useState(startOpen)
  return (
    <Stack gap={4} align="flex-start">
      <Button type="button" onClick={() => setOpen(true)}>
        Report task
      </Button>
      <ReportDialog {...args} open={open} onOpenChange={setOpen} />
    </Stack>
  )
}

/** Task: reporting a listing, with its photo, title and location in the summary card. */
export const Default: Story = {
  render: (args) => <TriggeredDialog {...args} startOpen />,
}

/** Closed: only the trigger button is on screen, the dialog is not mounted. */
export const Closed: Story = {
  render: (args) => <TriggeredDialog {...args} startOpen={false} />,
}

/** Opening: clicking the trigger button opens the report dialog. */
export const OpensFromTrigger: Story = {
  render: (args) => <TriggeredDialog {...args} startOpen={false} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Report task' }),
    )
    const dialog = await findDialog(canvasElement, 'Report this task')
    await waitFor(() => expect(dialog.getByRole('combobox')).toBeVisible(), {
      timeout: 3000,
    })
  },
}

/** Worker: reporting a profile, with the round avatar in the summary card. */
export const Worker: Story = {
  args: {
    kind: 'worker',
    targetTitle: 'Jordan Lee',
    targetMeta: 'Peckham',
    targetImageSrc: PROFILE_PHOTO,
  },
  render: function Render(args) {
    return <ReportDialog {...args} open onOpenChange={() => undefined} />
  },
}

/** Worker without a photo: the avatar falls back to the person's initials. */
export const WorkerWithoutPhoto: Story = {
  args: {
    kind: 'worker',
    targetTitle: 'Jordan Lee',
    targetMeta: 'Peckham',
    targetImageSrc: undefined,
  },
}

/** User: reporting a customer profile (square photo slot, not the round avatar). */
export const User: Story = {
  args: {
    kind: 'user',
    targetTitle: 'Alex Morgan',
    targetMeta: 'Member since 2024',
    targetImageSrc: PROFILE_PHOTO,
  },
}

/** Review: reporting a review, so the summary card shows text only (no image). */
export const Review: Story = {
  args: {
    kind: 'review',
    targetTitle: 'Did not match what we agreed.',
    targetMeta: '2 stars, 3 days ago',
    targetImageSrc: undefined,
  },
}

/** Message: reporting a chat message, so the summary card shows text only (no image). */
export const Message: Story = {
  args: {
    kind: 'message',
    targetTitle: 'Is there parking near the building?',
    targetMeta: 'Sent today at 9:20 am',
    targetImageSrc: undefined,
  },
}

/** Task without a photo: the thumbnail shows the neutral image placeholder. */
export const TaskWithoutPhoto: Story = {
  args: { targetImageSrc: undefined },
}

/** No target: without a title the summary card is left out entirely. */
export const WithoutTarget: Story = {
  args: {
    targetTitle: undefined,
    targetMeta: undefined,
    targetImageSrc: undefined,
  },
}

/** Long target: a long title and location clamp to two lines in the summary card. */
export const LongTarget: Story = {
  args: {
    targetTitle:
      'Assemble and wall-mount three flat-pack wardrobes, two chests of drawers and a very long set of shelving units in the spare room',
    targetMeta:
      'Southwark, South East London, near the old brewery building and the canal towpath · Furniture assembly and general handyman help',
  },
}

/** Validation: sending without choosing a reason shows the reason error. */
export const ValidationError: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await findDialog(canvasElement, 'Report this task')
    await userEvent.click(dialog.getByRole('button', { name: 'Send report' }))
    await waitFor(
      () => expect(dialog.getByText('Choose a reason.')).toBeVisible(),
      { timeout: 3000 },
    )
  },
}

/** Submitting: the send button shows its spinner and is disabled. */
export const Submitting: Story = {
  args: { submitting: true },
}

/** Error: the host reports a failed send and the message appears above the buttons. */
export const SubmitError: Story = {
  args: {
    submitError: 'We could not send your report. Please try again.',
  },
}

/** Success: a reason is chosen, the report is sent and the dialog closes itself. */
export const SubmitClosesDialog: Story = {
  args: { onSubmit: fn(async () => true as const) },
  render: (args) => <TriggeredDialog {...args} startOpen />,
  play: async ({ args, canvasElement }) => {
    const dialog = await findDialog(canvasElement, 'Report this task')
    await userEvent.selectOptions(dialog.getByRole('combobox'), 'SCAM')
    await userEvent.click(dialog.getByRole('button', { name: 'Send report' }))
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    })
    await expect(args.onSubmit).toHaveBeenCalledWith({
      reason: 'SCAM',
      details: '',
    })
    await waitFor(
      () =>
        expect(
          within(canvasElement.ownerDocument.body).queryByRole('dialog'),
        ).toBeNull(),
      { timeout: 3000 },
    )
  },
}

/** Phone: the dialog fills the narrow viewport width. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Triggers: the report control variants that open this dialog. */
export const Triggers: Story = {
  render: () => (
    <HStack gap={3} flexWrap="wrap">
      <ReportControl
        kind="task"
        targetId="task-42"
        targetTitle="Garden tidy"
        targetMeta="Peckham · Cleaning"
        targetImageSrc={TASK_PHOTO}
        variant="button"
        onSubmit={async () => true}
      />
      <ReportControl
        kind="worker"
        targetId="worker-9"
        targetTitle="Jordan"
        variant="icon"
        onSubmit={async () => true}
      />
      <ReportControl
        kind="task"
        targetId="task-42"
        targetTitle="Garden tidy"
        targetMeta="Peckham · Cleaning"
        targetImageSrc={TASK_PHOTO}
        variant="overflow"
        onSubmit={async () => true}
      />
    </HStack>
  ),
}

/**
 * Form spacing (FE-481, wiki Foundations-Form-Spacing), read between visible
 * edges: the intro is the Modal description (8 under the title), the first block
 * 24 under it, the target card, the reason and the details 20 apart, and the
 * last field 20 above the buttons. A field is 48 tall with its label 8 above.
 */
async function expectReportSpacing(canvasElement: HTMLElement) {
  const { dialog, title, description, body } = await openDialog(
    canvasElement,
    'Report this task',
  )
  const column = bodyColumn(body)
  const [card, reason, details] = [...column.children] as HTMLElement[]

  await expect(dialog).toHaveAccessibleDescription(/Tell us what’s wrong/)
  await expect(gapBelow(title, description as HTMLElement)).toBe(
    formSpace.titleToSubtitle,
  )
  await expect(gapBelow(description as HTMLElement, card)).toBe(
    formSpace.headerToBody,
  )
  await expect(gapsBetweenChildren(column)).toEqual([
    formSpace.fieldGap,
    formSpace.fieldGap,
  ])
  await expectField(reason)
  await expectField(details, null)
  await expect(heightOf(controlOf(details))).toBeGreaterThanOrEqual(120)
  await scrollToEnd(body)
  await expect(gapBelow(details, barButton(dialog, 'Send report'))).toBeCloseTo(
    formSpace.bodyToAction,
    0,
  )
  expectNoHorizontalOverflow(body)
}

/** Desktop: the gaps above. */
export const Spacing: Story = {
  play: ({ canvasElement }) => expectReportSpacing(canvasElement),
}

/** The same gaps at phone width. */
export const SpacingPhone: Story = {
  ...phone390,
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectReportSpacing(canvasElement)
  },
}

/** No target (no card): the reason is the first field, 24 under the description. */
export const SpacingWithoutTarget: Story = {
  args: { targetTitle: undefined, targetMeta: undefined },
  play: async ({ canvasElement }) => {
    const { description, body, dialog } = await openDialog(
      canvasElement,
      'Report this task',
    )
    const column = bodyColumn(body)
    const [reason, details] = [...column.children] as HTMLElement[]

    await expect(gapBelow(description as HTMLElement, reason)).toBe(
      formSpace.headerToBody,
    )
    await expect(gapsBetweenChildren(column)).toEqual([formSpace.fieldGap])
    await expect(gapBelow(details, barButton(dialog, 'Send report'))).toBe(
      formSpace.bodyToAction,
    )
  },
}

/** The reason's error sits 4 under the select, and nothing else moves. */
export const SpacingReasonError: Story = {
  play: async ({ canvasElement }) => {
    const { dialog, body } = await openDialog(canvasElement, 'Report this task')
    const reason = [...bodyColumn(body).children][1] as HTMLElement
    await userEvent.click(barButton(dialog, 'Send report'))
    const error = await within(reason).findByText('Choose a reason.')

    await expect(gapBelow(controlOf(reason), error)).toBe(
      formSpace.controlToHelper,
    )
  },
}

/** A failed send is one more block: 20 under the details, 20 above the buttons. */
export const SpacingSubmitError: Story = {
  args: { submitError: 'We could not send your report. Please try again.' },
  play: async ({ canvasElement }) => {
    const { dialog, body } = await openDialog(canvasElement, 'Report this task')
    const column = bodyColumn(body)
    const details = column.children[2] as HTMLElement
    const error = within(column).getByText(
      'We could not send your report. Please try again.',
    )

    await expect(gapBelow(details, error)).toBe(formSpace.fieldGap)
    await expect(gapBelow(error, barButton(dialog, 'Send report'))).toBe(
      formSpace.bodyToAction,
    )
  },
}
