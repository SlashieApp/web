import { AdminCohortKey } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { gapsBetweenChildren } from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import {
  desktop1280,
  expectGaps,
  expectWidth,
  fieldByLabel,
  phone390,
} from '@/app/(stepflow)/stepFlowSpacing.testing'
import {
  type AdminNotificationDraft,
  adminNotificationDraftKey,
} from '@/content/admin/adminNotificationDraft'
import { formSpace } from '@/theme/styles'
import { gapBelow, gapBeside, heightOf } from '@/ui/FormField/formGap.testing'
import {
  controlOf,
  expectField,
  lineOf,
} from '@/ui/Modal/taskDialogSpacing.testing'

import { AdminNotificationComposer } from './AdminNotificationComposer'

/** What the form below parses to once `fillDraft` has run. */
const draft: AdminNotificationDraft = {
  title: 'New: message workers in the app',
  body: 'You can now message the worker you picked from the task page.',
  imageUrl: '',
  userIds: [],
  cohortKeys: [AdminCohortKey.FoundingWorkers],
}
const matchingKey = adminNotificationDraftKey(draft)

const meta = {
  title: 'Dashboard/Admin/AdminNotificationComposer',
  component: AdminNotificationComposer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    onDryRun: fn(async () => {}),
    onSend: fn(async () => {}),
    dryRunKey: null,
    recipientCount: null,
  },
} satisfies Meta<typeof AdminNotificationComposer>

export default meta
type Story = StoryObj<typeof meta>

/** Pastes into a field: typing a long message key by key is slow in tests. */
async function paste(field: HTMLElement, text: string) {
  await userEvent.click(field)
  await userEvent.paste(text)
}

async function fillTitleAndMessage(canvas: ReturnType<typeof within>) {
  await paste(await canvas.findByLabelText('Title'), draft.title)
  await paste(canvas.getByLabelText('Message'), draft.body)
}

async function fillDraft(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  await fillTitleAndMessage(canvas)
  await userEvent.click(
    canvas.getByRole('checkbox', { name: 'Founding workers' }),
  )
  return canvas
}

/** Empty form: Send is disabled until recipients are checked. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', { name: 'Send' }),
    ).toBeDisabled()
  },
}

/** Checking recipients with an empty form: the title and message are required. */
export const MissingFields: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Check recipients' }),
    )
    await expect(await canvas.findByText('Enter a title.')).toBeVisible()
    await expect(canvas.getByText('Enter a message.')).toBeVisible()
    await expect(args.onDryRun).not.toHaveBeenCalled()
  },
}

/** Title and message but nobody picked: asks for a person or a cohort. */
export const NoAudience: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await fillTitleAndMessage(canvas)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Check recipients' }),
    )
    await expect(
      await canvas.findByText('Choose at least one person or cohort.'),
    ).toBeVisible()
    await expect(args.onDryRun).not.toHaveBeenCalled()
  },
}

/** A complete draft: Check recipients is available. */
export const FilledIn: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = await fillDraft(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Check recipients' }),
    )
    await expect(args.onDryRun).toHaveBeenCalledWith(draft)
  },
}

/** The recipient check is running. */
export const Checking: Story = {
  args: { dryRunning: true },
}

/** Checked: 12 people will receive it, so Send is enabled. */
export const ReadyToSend: Story = {
  args: { dryRunKey: matchingKey, recipientCount: 12 },
  play: async ({ canvasElement }) => {
    const canvas = await fillDraft(canvasElement)
    await expect(
      await canvas.findByText('12 people will receive this.'),
    ).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeEnabled()
  },
}

/** Checked, but nobody matches: Send stays disabled. */
export const NoRecipients: Story = {
  args: { dryRunKey: matchingKey, recipientCount: 0 },
  play: async ({ canvasElement }) => {
    const canvas = await fillDraft(canvasElement)
    await expect(
      await canvas.findByText('No one matches that audience.'),
    ).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeDisabled()
  },
}

/** The draft changed after the check: the count is hidden and Send is disabled again. */
export const EditedAfterCheck: Story = {
  args: { dryRunKey: JSON.stringify({ stale: true }), recipientCount: 12 },
  play: async ({ canvasElement }) => {
    const canvas = await fillDraft(canvasElement)
    await expect(canvas.queryByText(/people will receive this/)).toBeNull()
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeDisabled()
  },
}

/** Sending: the Send button is busy. */
export const Sending: Story = {
  args: { dryRunKey: matchingKey, recipientCount: 12, sending: true },
  play: async ({ canvasElement }) => {
    await fillDraft(canvasElement)
    await expect(
      canvasElement.querySelector('button[data-loading]'),
    ).toBeDisabled()
  },
}

/** Sent: the audit id of the send shows under the count. */
export const Sent: Story = {
  args: {
    dryRunKey: matchingKey,
    recipientCount: 12,
    auditId: 'audit_01J9X7K2M',
  },
  play: async ({ canvasElement }) => {
    const canvas = await fillDraft(canvasElement)
    await expect(
      await canvas.findByText('Audit id audit_01J9X7K2M'),
    ).toBeVisible()
  },
}

/** The API refused: the error shows above the buttons. */
export const SendFailed: Story = {
  args: { error: 'Couldn’t send that announcement.' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('alert'),
    ).toHaveTextContent('Couldn’t send that announcement.')
  },
}

/** Phones: the preview card stacks under the form. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  args: { dryRunKey: matchingKey, recipientCount: 12 },
}

/** The 20px box of a cohort's checkbox (the visible control of its row). */
function cohortBox(canvas: ReturnType<typeof within>, name: string) {
  return canvas
    .getByRole('checkbox', { name })
    .closest('label')
    ?.querySelector('[data-part="control"]') as HTMLElement
}

/** The `FormStack` of the form card: the fields, the status lines, the buttons. */
function stackOf(canvasElement: HTMLElement) {
  return fieldByLabel(canvasElement, 'Title').parentElement as HTMLElement
}

/**
 * The form on the spacing system: the card heading 24 above the first field,
 * the fields 20 apart (label 8, a helper 4 under its control), the cohorts a
 * choice group (label 8, rows 8 apart), and the two buttons 48 tall, 8 apart and
 * 20 under the last group.
 */
async function expectComposer(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const stack = stackOf(canvasElement)
  const heading = await canvas.findByRole('heading', {
    name: 'Send an announcement',
  })
  const title = fieldByLabel(canvasElement, 'Title')
  await expect(gapBelow(heading, title)).toBe(formSpace.headerToBody)

  await expectField(title)
  await expectField(fieldByLabel(canvasElement, 'Message'), null)
  const image = fieldByLabel(canvasElement, 'Image URL (optional)')
  await expectField(image)
  await expect(
    gapBelow(
      controlOf(image),
      lineOf(image, 'Shown on the announcement card in Messages.'),
    ),
  ).toBe(formSpace.controlToHelper)
  const users = fieldByLabel(canvasElement, 'User IDs')
  await expectField(users, null)
  await expect(
    gapBelow(
      controlOf(users),
      lineOf(users, 'One per line or comma-separated.'),
    ),
  ).toBe(formSpace.controlToHelper)

  // The cohorts: the label 8 above the first box, the boxes 8 apart.
  const label = canvas.getByText('Cohorts')
  const founding = cohortBox(canvas, 'Founding workers')
  const geo = cohortBox(canvas, 'Watford and Bushey')
  await expect(gapBelow(label, founding)).toBe(formSpace.labelToControl)
  await expect(heightOf(founding)).toBe(20)
  await expect(gapBelow(founding, geo)).toBe(formSpace.alternativesGap)

  const dryRun = canvas.getByRole('button', { name: 'Check recipients' })
  const send = canvas.getByRole('button', { name: 'Send' })
  await expect(heightOf(dryRun)).toBe(formSpace.controlHeight)
  await expect(heightOf(send)).toBe(formSpace.controlHeight)
  await expect(gapBeside(dryRun, send)).toBe(formSpace.alternativesGap)
  await expectGaps([...stack.children], formSpace.fieldGap)
  return { canvas, stack }
}

/** Wide: the composer on the spacing system. */
export const Spacing: Story = {
  ...desktop1280,
  play: async ({ canvasElement }) => {
    expectWidth(canvasElement, 1280)
    await expectComposer(canvasElement)
  },
}

/** At 390: the same gaps, the preview card stacks under the form. */
export const SpacingPhone: Story = {
  ...phone390,
  play: async ({ canvasElement }) => {
    expectWidth(canvasElement, 390)
    await expectComposer(canvasElement)
  },
}

/**
 * A form-level error, the recipient count and the audit id are field groups:
 * each 20 from its neighbours, the last 20 above the buttons.
 */
export const StatusLinesSpacing: Story = {
  ...desktop1280,
  args: {
    dryRunKey: matchingKey,
    recipientCount: 12,
    auditId: 'audit_01J9X7K2M',
    error: 'Couldn’t send that announcement.',
  },
  play: async ({ canvasElement }) => {
    const canvas = await fillDraft(canvasElement)
    const stack = stackOf(canvasElement)
    await expect(
      await canvas.findByText('12 people will receive this.'),
    ).toBeVisible()
    // Fields (4), cohorts, error, count, audit, buttons.
    await expect(stack.children).toHaveLength(9)
    await expectGaps([...stack.children], formSpace.fieldGap)
    await expect(gapsBetweenChildren(stack)).not.toContain(0)
  },
}

/** No audience picked: the cohorts' reason is 4 under the last box, the buttons stay 20 under the group. */
export const CohortErrorSpacing: Story = {
  ...desktop1280,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await fillTitleAndMessage(canvas)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Check recipients' }),
    )
    const reason = await canvas.findByText(
      'Choose at least one person or cohort.',
    )
    await expect(
      gapBelow(cohortBox(canvas, 'Watford and Bushey'), reason),
    ).toBe(formSpace.controlToHelper)
    await expectGaps([...stackOf(canvasElement).children], formSpace.fieldGap)
  },
}
