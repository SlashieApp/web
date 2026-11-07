import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import {
  barButton,
  expectNoHorizontalOverflow,
  openDialog,
  phone390,
} from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { Button } from '@/ui/Button/Button'
import { viewportAt } from '@/ui/PageContainer/pageLines.testing'

import { AskAfterPostPrompt } from './AskAfterPostPrompt'
import {
  AskToQuoteDialog,
  type AskToQuoteDialogProps,
} from './AskToQuoteDialog'
import type { AskableTaskChoice } from './types'

const WORKER_ID = '64b7f0c2a1d3e4f5a6b7c8d9'

const TASKS: AskableTaskChoice[] = [
  {
    id: 't3',
    title: 'Fix a leaking kitchen tap',
    quoteCount: 2,
    alreadyAsked: false,
    canAsk: true,
  },
  {
    id: 't2',
    title: 'Mount a 55-inch TV and hide the cables',
    quoteCount: 1,
    alreadyAsked: false,
    canAsk: true,
  },
  {
    id: 't1',
    title: 'Paint the hallway',
    quoteCount: 0,
    alreadyAsked: true,
    canAsk: false,
  },
  {
    id: 't0',
    title: 'Assemble a wardrobe',
    quoteCount: 4,
    alreadyAsked: false,
    canAsk: false,
  },
]

const meta = {
  title: 'Quote invitations/AskToQuoteDialog',
  component: AskToQuoteDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    open: true,
    onOpenChange: () => {},
    workerName: 'Alex',
    workerUserId: WORKER_ID,
    tasks: TASKS,
    onSubmit: fn(async () => true),
  },
} satisfies Meta<typeof AskToQuoteDialog>

export default meta
type Story = StoryObj<typeof meta>

/** A trigger next to a dialog that opens and closes itself, as the profile does. */
function Triggered(props: AskToQuoteDialogProps) {
  const [open, setOpen] = useState(props.open)
  return (
    <Stack gap={4} align="flex-start">
      <Button type="button" onClick={() => setOpen(true)}>
        Ask Alex to quote
      </Button>
      <AskToQuoteDialog {...props} open={open} onOpenChange={setOpen} />
    </Stack>
  )
}

const render: Story['render'] = (args) => <Triggered {...args} />

/**
 * The chooser: title, description, the open tasks newest first with their live
 * quote counts, the Post a new task link, Cancel and the main button off until
 * a task is picked.
 */
export const Default: Story = {
  render,
  play: async ({ canvasElement }) => {
    const { dialog, description } = await openDialog(
      canvasElement,
      'Ask Alex to quote',
    )
    const d = within(dialog)
    await expect(description).toHaveTextContent(
      'Choose one of your open tasks. Alex gets a notification and decides whether to send a quote.',
    )
    const rows = d.getAllByRole('radio')
    await expect(rows).toHaveLength(4)
    await expect(rows[0]).toHaveTextContent('Fix a leaking kitchen tap')
    await expect(rows[0]).toHaveTextContent('2 quotes')
    await expect(rows[1]).toHaveTextContent('1 quote')
    await expect(rows[2]).toHaveTextContent('No quotes yet')
    await expect(
      d.getByRole('link', { name: 'Post a new task' }),
    ).toHaveAttribute('href', `/tasks/create?askWorker=${WORKER_ID}`)
    await expect(barButton(dialog, 'Cancel')).toBeEnabled()
    await expect(barButton(dialog, 'Ask Alex to quote')).toBeDisabled()
  },
}

/** A task already asked says Asked, any other it can't take says Not available; neither can be picked. */
export const RowsThatCannotBePicked: Story = {
  render,
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement, 'Ask Alex to quote')
    const d = within(dialog)
    const [, , asked, unavailable] = d.getAllByRole('radio')
    await expect(asked).toHaveTextContent('Asked')
    await expect(asked).toBeDisabled()
    await expect(unavailable).toHaveTextContent('Not available')
    await expect(unavailable).toBeDisabled()
    // The count stays on a row that can't be picked, beside the reason.
    await expect(asked).toHaveTextContent('No quotes yet')
    await expect(unavailable).toHaveTextContent('4 quotes')
    await userEvent.click(asked)
    await expect(d.queryAllByRole('radio', { checked: true })).toHaveLength(0)
    await expect(barButton(dialog, 'Ask Alex to quote')).toBeDisabled()
  },
}

/** Pick one: it is the only one checked, the main button turns on and sends that task once. */
export const PickAndSend: Story = {
  render,
  play: async ({ canvasElement, args }) => {
    const { dialog } = await openDialog(canvasElement, 'Ask Alex to quote')
    const d = within(dialog)
    const [first, second] = d.getAllByRole('radio')
    await userEvent.click(first)
    await userEvent.click(second)
    await expect(d.getAllByRole('radio', { checked: true })).toEqual([second])
    const send = barButton(dialog, 'Ask Alex to quote')
    await expect(send).toBeEnabled()
    await userEvent.click(send)
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1))
    await expect(args.onSubmit).toHaveBeenCalledWith(TASKS[1])
    // Success closes the dialog.
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole('dialog'),
      ).toBeNull(),
    )
  },
}

/** Sending: the main button shows its loading state and Cancel stays. */
export const Sending: Story = {
  render,
  args: { submitting: true },
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement, 'Ask Alex to quote')
    const send = dialog.querySelector('button[type="submit"]') as HTMLElement
    await expect(send).toBeDisabled()
    await expect(send).toHaveAttribute('data-loading')
    await expect(barButton(dialog, 'Cancel')).toBeEnabled()
  },
}

/** A refusal shows in the dialog, which stays open with the pick kept. */
export const RefusedAlreadySent: Story = {
  render,
  args: {
    onSubmit: fn(async () => false),
    error: "You've already asked Alex about this task.",
  },
  play: async ({ canvasElement, args }) => {
    const { dialog } = await openDialog(canvasElement, 'Ask Alex to quote')
    const d = within(dialog)
    await userEvent.click(d.getAllByRole('radio')[0])
    await userEvent.click(barButton(dialog, 'Ask Alex to quote'))
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalled())
    await expect(d.getByRole('alert')).toHaveTextContent(
      "You've already asked Alex about this task.",
    )
    await expect(dialog).toBeVisible()
    await expect(d.getAllByRole('radio', { checked: true })).toHaveLength(1)
    // Body order, the same in both apps: the list, "Post a new task", then the error.
    const list = d.getByRole('radiogroup')
    const link = d.getByRole('link', { name: 'Post a new task' })
    const alert = d.getByRole('alert')
    await expect(
      list.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    await expect(
      link.compareDocumentPosition(alert) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  },
}

/** The daily limit, in the same place. */
export const RefusedDailyLimit: Story = {
  ...RefusedAlreadySent,
  args: {
    onSubmit: fn(async () => false),
    error: "You've asked 10 workers in the last 24 hours. Try again later.",
  },
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement, 'Ask Alex to quote')
    await expect(within(dialog).getByRole('alert')).toHaveTextContent(
      "You've asked 10 workers in the last 24 hours. Try again later.",
    )
  },
}

/** A long title wraps to two lines and never pushes the quote count or the dialog out. */
export const LongTitle: Story = {
  render,
  args: {
    tasks: [
      {
        id: 'long',
        title:
          'Replace the old fitted wardrobes in both bedrooms, remove the rubbish and repaint the walls behind them afterwards',
        quoteCount: 12,
        alreadyAsked: false,
        canAsk: true,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const { dialog, body } = await openDialog(
      canvasElement,
      'Ask Alex to quote',
    )
    expectNoHorizontalOverflow(body)
    await expect(within(dialog).getByRole('radio')).toHaveTextContent(
      '12 quotes',
    )
  },
}

/** zh-HK. */
export const ZhHk: Story = {
  render,
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/profile/x' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement, '請 Alex 報價')
    const d = within(dialog)
    const rows = d.getAllByRole('radio')
    await expect(rows[0]).toHaveTextContent('2 個報價')
    await expect(rows[2]).toHaveTextContent('已邀請')
    await expect(d.getByRole('link', { name: '發布新任務' })).toHaveAttribute(
      'href',
      `/zh-hk/tasks/create?askWorker=${WORKER_ID}`,
    )
  },
}

/** Phone (390): the dialog fits the window with its gutters and nothing scrolls sideways. */
export const Phone: Story = {
  render,
  ...phone390,
  play: async ({ canvasElement }) => {
    const { dialog, body } = await openDialog(
      canvasElement,
      'Ask Alex to quote',
    )
    const box = dialog.getBoundingClientRect()
    await expect(box.left).toBeGreaterThanOrEqual(16)
    await expect(window.innerWidth - box.right).toBeGreaterThanOrEqual(16)
    expectNoHorizontalOverflow(body)
  },
}

/** The dialog at each width: inside the window, 16 from each edge, and no wider than its size. */
async function expectFits(canvasElement: HTMLElement, width: number) {
  const { dialog, body } = await openDialog(canvasElement, 'Ask Alex to quote')
  const box = dialog.getBoundingClientRect()
  await expect(box.left).toBeGreaterThanOrEqual(16 - 0.5)
  await expect(box.right).toBeLessThanOrEqual(width - 16 + 0.5)
  await expect(box.width).toBeLessThanOrEqual(480)
  expectNoHorizontalOverflow(body)
}

export const Fits390: Story = {
  render,
  ...viewportAt(390),
  play: ({ canvasElement }) => expectFits(canvasElement, 390),
}
export const Fits820: Story = {
  render,
  ...viewportAt(820),
  play: ({ canvasElement }) => expectFits(canvasElement, 820),
}
export const Fits1024: Story = {
  render,
  ...viewportAt(1024),
  play: ({ canvasElement }) => expectFits(canvasElement, 1024),
}
export const Fits1366: Story = {
  render,
  ...viewportAt(1366),
  play: ({ canvasElement }) => expectFits(canvasElement, 1366),
}

/* ---- The prompt after Post a task ---- */

type PromptStory = StoryObj<typeof AskAfterPostPrompt>

const promptMeta = {
  args: {
    open: true,
    workerName: 'Alex',
    onSkip: fn(),
    onAsk: fn(async () => true),
  },
}

/** After posting with a worker carried: ask, or Not now. Nothing is sent before the tap. */
export const PromptAfterPost: PromptStory = {
  ...promptMeta,
  render: (args) => <AskAfterPostPrompt {...args} />,
  play: async ({ canvasElement, args }) => {
    const { dialog, description } = await openDialog(
      canvasElement,
      'Ask Alex to quote on this task?',
    )
    await expect(description).toHaveTextContent(
      'Alex gets a notification and decides whether to send a quote.',
    )
    await expect(args.onAsk).not.toHaveBeenCalled()
    await userEvent.click(barButton(dialog, 'Ask Alex'))
    await expect(args.onAsk).toHaveBeenCalledTimes(1)
    await expect(args.onSkip).not.toHaveBeenCalled()
  },
}

export const PromptNotNow: PromptStory = {
  ...promptMeta,
  render: (args) => <AskAfterPostPrompt {...args} />,
  play: async ({ canvasElement, args }) => {
    const { dialog } = await openDialog(
      canvasElement,
      'Ask Alex to quote on this task?',
    )
    await userEvent.click(barButton(dialog, 'Not now'))
    await expect(args.onSkip).toHaveBeenCalledTimes(1)
    await expect(args.onAsk).not.toHaveBeenCalled()
  },
}

export const PromptRefused: PromptStory = {
  ...promptMeta,
  args: {
    ...promptMeta.args,
    error: "Alex can't be asked to quote right now.",
  },
  render: (args) => <AskAfterPostPrompt {...args} />,
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(
      canvasElement,
      'Ask Alex to quote on this task?',
    )
    await expect(within(dialog).getByRole('alert')).toHaveTextContent(
      "Alex can't be asked to quote right now.",
    )
  },
}
