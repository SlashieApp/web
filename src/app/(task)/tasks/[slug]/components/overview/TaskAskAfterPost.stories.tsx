import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import type { StoryResponse } from '@/app/(auth)/helpers/authStoryDecorator'
import {
  barButton,
  openDialog,
} from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { AppToastHost } from '@/utils/appToast'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  type TaskDetailStoryConfig,
  storyTaskDetail,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskAskAfterPost } from './TaskAskAfterPost'

const WORKER_ID = '64b7f0c2a1d3e4f5a6b7c8d9'
const TASK = storyTaskDetail()

/**
 * The prompt on the new task's page after Post a task carried a worker
 * (FE-507). The story API answers only what each story sets: no story sends a
 * real invitation, and the prompt never sends one on its own.
 */
const meta = {
  title: 'Task detail/Overview/TaskAskAfterPost',
  component: TaskAskAfterPost,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TaskAskAfterPost>

export default meta
type Story = StoryObj<typeof meta>

/** The address the page was opened at, with `?askWorker=` on it. */
const openedWith =
  (value: string | null): Decorator =>
  (Story) => {
    const url = new URL(window.location.href)
    if (value === null) url.searchParams.delete('askWorker')
    else url.searchParams.set('askWorker', value)
    window.history.replaceState(window.history.state, '', url)
    return <Story />
  }

const toasts: Decorator = (Story) => (
  <>
    <Story />
    <AppToastHost />
  </>
)

const workerAnswer = (canAskToQuote: boolean): StoryResponse => ({
  kind: 'data',
  data: {
    publicProfile: {
      __typename: 'PublicProfile',
      id: WORKER_ID,
      profile: { __typename: 'Profile', name: 'Priya Shah' },
      worker: {
        __typename: 'Worker',
        id: 'worker-profile-priya',
        viewer: { __typename: 'WorkerProfileViewer', canAskToQuote },
      },
    },
  },
})

const sentAnswer: StoryResponse = {
  kind: 'data',
  data: {
    askWorkerToQuote: {
      __typename: 'AskWorkerToQuotePayload',
      taskId: TASK.id,
      workerUserId: WORKER_ID,
      createdAt: '2026-11-07T10:00:00.000Z',
    },
  },
}

function story(
  param: string | null,
  config: Partial<TaskDetailStoryConfig> & {
    canAskToQuote?: boolean
    ask?: StoryResponse
  } = {},
): Pick<Story, 'decorators'> {
  const { canAskToQuote = true, ask = sentAnswer, ...rest } = config
  return {
    decorators: [
      withTaskDetailStory({
        viewer: 'owner',
        task: TASK,
        responses: {
          QuoteInviteWorker: workerAnswer(canAskToQuote),
          AskWorkerToQuote: ask,
        },
        ...rest,
      }),
      toasts,
      openedWith(param),
    ],
  }
}

const promptName = 'Ask Priya to quote on this task?'

/** The prompt: title, description, Not now and Ask {name}. The param leaves the address at once. */
export const Prompt: Story = {
  ...story(WORKER_ID),
  play: async ({ canvasElement }) => {
    const { dialog, description } = await openDialog(canvasElement, promptName)
    await expect(description).toHaveTextContent(
      'Priya gets a notification and decides whether to send a quote.',
    )
    await expect(barButton(dialog, 'Not now')).toBeEnabled()
    await expect(barButton(dialog, 'Ask Priya')).toBeEnabled()
    // A reload would not prompt again.
    await expect(window.location.search).not.toContain('askWorker')
  },
}

/** Not now: closes without sending. */
export const NotNow: Story = {
  ...story(WORKER_ID),
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement, promptName)
    await userEvent.click(barButton(dialog, 'Not now'))
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole('dialog'),
      ).toBeNull(),
    )
  },
}

/** Ask {name}: one tap sends it, the dialog closes and the toast names the worker and the task. */
export const AskSends: Story = {
  ...story(WORKER_ID),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body)
    const { dialog } = await openDialog(canvasElement, promptName)
    await userEvent.click(barButton(dialog, 'Ask Priya'))
    await body.findByText(
      'Priya has been asked to quote on Mount bookshelf on living room wall.',
    )
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
  },
}

/** The API refuses: its line shows in the prompt, which stays open. */
export const RefusedNotAvailable: Story = {
  ...story(WORKER_ID, {
    ask: {
      kind: 'graphqlError',
      code: 'QUOTE_INVITE_NOT_AVAILABLE',
    },
  }),
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement, promptName)
    await userEvent.click(barButton(dialog, 'Ask Priya'))
    await expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      "Priya can't be asked to quote right now.",
    )
    await expect(dialog).toBeVisible()
  },
}

export const RefusedDailyLimit: Story = {
  ...story(WORKER_ID, {
    ask: { kind: 'graphqlError', code: 'QUOTE_INVITE_DAILY_LIMIT' },
  }),
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement, promptName)
    await userEvent.click(barButton(dialog, 'Ask Priya'))
    await expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      "You've asked 10 workers in the last 24 hours. Try again later.",
    )
  },
}

/** Any other failure reads as the app's usual generic error. */
export const RefusedOther: Story = {
  ...story(WORKER_ID, {
    ask: { kind: 'networkError', message: 'Network request failed' },
  }),
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement, promptName)
    await userEvent.click(barButton(dialog, 'Ask Priya'))
    await expect(await within(dialog).findByRole('alert')).toBeVisible()
  },
}

/** The same sentence for a task that closed in the meantime. */
export const RefusedTaskClosed: Story = {
  ...story(WORKER_ID, {
    ask: { kind: 'graphqlError', code: 'TASK_NOT_OPEN' },
  }),
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement, promptName)
    await userEvent.click(barButton(dialog, 'Ask Priya'))
    await expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      "This task isn't open for quotes any more.",
    )
  },
}

async function expectNoPrompt(canvasElement: HTMLElement) {
  const body = within(canvasElement.ownerDocument.body)
  // Give the profile answer time to arrive; still nothing.
  await new Promise((resolve) => setTimeout(resolve, 600))
  await expect(body.queryByRole('dialog')).toBeNull()
  await expect(window.location.search).not.toContain('askWorker')
}

/** The worker's profile says this viewer can't ask them (an opt-out, a block): no prompt. */
export const NoPromptWhenCannotAsk: Story = {
  ...story(WORKER_ID, { canAskToQuote: false }),
  play: ({ canvasElement }) => expectNoPrompt(canvasElement),
}

/** A value that is not a 24-hex id is ignored. */
export const NoPromptForBadParam: Story = {
  ...story('not-an-id'),
  play: ({ canvasElement }) => expectNoPrompt(canvasElement),
}

/** Nothing carried: no prompt. */
export const NoPromptWithoutParam: Story = {
  ...story(null),
  play: ({ canvasElement }) => expectNoPrompt(canvasElement),
}

/** Someone who does not own the task is never prompted, with the param or not. */
export const NoPromptForNonOwner: Story = {
  ...story(WORKER_ID, { viewer: 'worker' }),
  play: ({ canvasElement }) => expectNoPrompt(canvasElement),
}
