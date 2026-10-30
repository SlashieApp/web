import { QuoteStatus } from '@codegen/schema'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import {
  expectPhoneWidth,
  expectSentenceConfirm,
  openDialog,
  phone390,
} from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { formSpace } from '@/theme/styles'
import { gapBelow } from '@/ui/FormField/formGap.testing'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  storyTaskDetail,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { CancelTaskDialog, WithdrawQuoteDialog } from './TaskConfirmDialogs'

/**
 * Cancel task and Withdraw quote ask before they act, in the same dialog as
 * Cancel booking: a title, one line of body, Keep and a red confirm button.
 * Opened from the task's options, the Messages thread menu and the quote page.
 * Nothing here is confirmed: the story client never answers a mutation.
 */
const meta = {
  title: 'Task detail/Overview/TaskConfirmDialogs',
  component: CancelTaskDialog,
  parameters: { layout: 'padded' },
  args: { open: true, onOpenChange: fn() },
} satisfies Meta<typeof CancelTaskDialog>

export default meta
type Story = StoryObj<typeof meta>

/** The dialogs portal to the page, outside the story canvas. */
const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

const owner = withTaskDetailStory({ viewer: 'owner' })

const worker = withTaskDetailStory({
  viewer: 'worker',
  task: storyTaskDetail({
    quotes: [storyTaskQuote({ status: QuoteStatus.Pending })],
  }),
})

const phone = { globals: { viewport: { value: 'mobile1' } } } as const

/** Story `parameters` for a zh-HK URL; pair with {@link withZhHk}. */
const zhHk = {
  nextjs: { navigation: { pathname: '/zh-hk/tasks/task-detail-story-1' } },
}

/** Reads the locale from the story URL (see {@link zhHk}). */
const withZhHk: Decorator = (Story) => (
  <LocaleProvider>
    <Story />
  </LocaleProvider>
)

/** The owner is asked before the task is cancelled; Keep leaves it open. */
export const CancelTask: Story = {
  decorators: [owner],
  play: async ({ canvasElement }) => {
    const dialog = within(
      await page(canvasElement).findByRole('dialog', { name: 'Cancel task' }),
    )
    await dialog.findByText(
      'Cancel this task? Workers will no longer be able to send quotes.',
    )
    await expect(dialog.getByRole('button', { name: 'Keep' })).toBeEnabled()
    await expect(
      dialog.getByRole('button', { name: 'Cancel task' }),
    ).toBeEnabled()
  },
}

/** Confirming shows the red button busy while the call runs, and keeps the dialog. */
export const CancelTaskBusy: Story = {
  decorators: [owner],
  play: async ({ canvasElement }) => {
    const dialog = within(
      await page(canvasElement).findByRole('dialog', { name: 'Cancel task' }),
    )
    const confirm = dialog.getByRole('button', { name: 'Cancel task' })
    await userEvent.click(confirm)
    await waitFor(() => expect(confirm).toBeDisabled())
    await expect(confirm).toHaveAttribute('data-loading')
    await waitFor(() =>
      expect(
        page(canvasElement).getByRole('dialog', { name: 'Cancel task' }),
      ).toBeVisible(),
    )
  },
}

/** Phone: the same dialog, 16px from the edges. */
export const CancelTaskPhone: Story = {
  ...phone,
  decorators: [owner],
  play: async ({ canvasElement }) => {
    await page(canvasElement).findByRole('dialog', { name: 'Cancel task' })
  },
}

/** Cancel task in zh-HK: the app's title, body, 保留 and the red button. */
export const CancelTaskZhHk: Story = {
  parameters: zhHk,
  decorators: [owner, withZhHk],
  play: async ({ canvasElement }) => {
    const dialog = within(
      await page(canvasElement).findByRole('dialog', { name: '取消任務' }),
    )
    await dialog.findByText('取消此任務？工作者將無法再傳送報價。')
    await expect(dialog.getByRole('button', { name: '保留' })).toBeEnabled()
    await expect(dialog.getByRole('button', { name: '取消任務' })).toBeEnabled()
  },
}

/** A worker is asked before their pending quote is withdrawn. */
export const WithdrawQuote: Story = {
  decorators: [worker],
  render: (args) => <WithdrawQuoteDialog {...args} />,
  play: async ({ canvasElement }) => {
    const dialog = within(
      await page(canvasElement).findByRole('dialog', {
        name: 'Withdraw quote',
      }),
    )
    await dialog.findByText(
      'Withdraw your quote? The customer will no longer see it.',
    )
    await expect(dialog.getByRole('button', { name: 'Keep' })).toBeEnabled()
    await expect(
      dialog.getByRole('button', { name: 'Withdraw quote' }),
    ).toBeEnabled()
  },
}

/** Confirming shows the red button busy while the call runs, and keeps the dialog. */
export const WithdrawQuoteBusy: Story = {
  decorators: [worker],
  render: (args) => <WithdrawQuoteDialog {...args} />,
  play: async ({ canvasElement }) => {
    const dialog = within(
      await page(canvasElement).findByRole('dialog', {
        name: 'Withdraw quote',
      }),
    )
    const confirm = dialog.getByRole('button', { name: 'Withdraw quote' })
    await userEvent.click(confirm)
    await waitFor(() => expect(confirm).toBeDisabled())
    await expect(confirm).toHaveAttribute('data-loading')
    await waitFor(() =>
      expect(
        page(canvasElement).getByRole('dialog', { name: 'Withdraw quote' }),
      ).toBeVisible(),
    )
  },
}

/** Withdraw quote in zh-HK: the app's title, body, 保留 and the red button. */
export const WithdrawQuoteZhHk: Story = {
  parameters: zhHk,
  decorators: [worker, withZhHk],
  render: (args) => <WithdrawQuoteDialog {...args} />,
  play: async ({ canvasElement }) => {
    const dialog = within(
      await page(canvasElement).findByRole('dialog', { name: '撤回報價' }),
    )
    await dialog.findByText('撤回你的報價？顧客將不會再看到此報價。')
    await expect(dialog.getByRole('button', { name: '保留' })).toBeEnabled()
    await expect(dialog.getByRole('button', { name: '撤回報價' })).toBeEnabled()
  },
}

/** Closed: nothing is on screen. */
export const Closed: Story = {
  decorators: [owner],
  args: { open: false },
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    await expect(page(canvasElement).queryByRole('dialog')).toBeNull()
  },
}

/**
 * Form spacing (FE-481, wiki Foundations-Form-Spacing), read between visible
 * edges. A confirm has no field: its one sentence is the dialog's description,
 * 8 under the title and what the dialog is described by (round 4), with no
 * body, and the buttons 24 under it.
 */
async function expectConfirmSpacing(
  canvasElement: HTMLElement,
  name: string,
  sentenceText: string,
  confirm: string,
) {
  await expectSentenceConfirm(
    await openDialog(canvasElement, name),
    sentenceText,
    confirm,
  )
}

const CANCEL_TASK_SENTENCE =
  'Cancel this task? Workers will no longer be able to send quotes.'

/** Cancel task, desktop. */
export const CancelTaskSpacing: Story = {
  decorators: [owner],
  play: ({ canvasElement }) =>
    expectConfirmSpacing(
      canvasElement,
      'Cancel task',
      CANCEL_TASK_SENTENCE,
      'Cancel task',
    ),
}

/** Cancel task, phone. */
export const CancelTaskSpacingPhone: Story = {
  ...phone390,
  decorators: [owner],
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectConfirmSpacing(
      canvasElement,
      'Cancel task',
      CANCEL_TASK_SENTENCE,
      'Cancel task',
    )
  },
}

/** Withdraw quote, desktop. */
export const WithdrawQuoteSpacing: Story = {
  decorators: [worker],
  render: (args) => <WithdrawQuoteDialog {...args} />,
  play: ({ canvasElement }) =>
    expectConfirmSpacing(
      canvasElement,
      'Withdraw quote',
      'Withdraw your quote? The customer will no longer see it.',
      'Withdraw quote',
    ),
}
