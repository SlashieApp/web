import { AdminCohortKey } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import {
  type AdminNotificationDraft,
  adminNotificationDraftKey,
} from '@/content/admin/adminNotificationDraft'

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
