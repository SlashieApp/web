import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import {
  barButton,
  openDialog,
} from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { withStoryApollo } from '@/app/(worker)/workers/components/storyApollo'
import type { AskableTaskChoice } from '@/content/quoteInvitations/types'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { viewportAt } from '@/ui/PageContainer/pageLines.testing'

import { PublicProfileScreen } from './PublicProfileScreen'
import {
  STORY_NOW,
  sampleAskableViewer,
  sampleWorker,
} from './ui/publicProfileStoryFixture'

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
    title: 'Mount a 55-inch TV',
    quoteCount: 0,
    alreadyAsked: true,
    canAsk: false,
  },
]

/**
 * `worker.askable` (FE-507): a signed-in visitor the API says can ask this
 * worker to quote. Ask opens the chooser; with no open task it is the link to
 * Post a task carrying the worker.
 */
const meta = {
  title: 'Public profile/Ask to quote',
  component: PublicProfileScreen,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [withStoryApollo],
  args: {
    view: 'worker.askable',
    model: sampleWorker({
      id: WORKER_ID,
      viewer: sampleAskableViewer(TASKS),
    }),
    onSave: fn(),
    onRetry: fn(),
    onBack: fn(),
    now: STORY_NOW,
    ask: { onSubmit: fn(async () => true), submitting: false, error: null },
  },
} satisfies Meta<typeof PublicProfileScreen>

export default meta
type Story = StoryObj<typeof meta>

/** The helper line is in the sidebar card and the phone bar; one shows. */
async function expectOneVisible(canvasElement: HTMLElement, text: string) {
  const matches = await within(canvasElement).findAllByText(text)
  await expect(
    matches.filter((element) => element.checkVisibility()),
  ).toHaveLength(1)
}

/** The main button, whichever of the sidebar card and the phone bar shows. */
async function visibleMain(canvasElement: HTMLElement, name: string) {
  const canvas = within(canvasElement)
  await waitFor(() =>
    expect(
      [
        ...canvas.queryAllByRole('button', { name }),
        ...canvas.queryAllByRole('link', { name }),
      ].length,
    ).toBeGreaterThan(0),
  )
  const shown = [
    ...canvas.queryAllByRole('button', { name }),
    ...canvas.queryAllByRole('link', { name }),
  ].filter((element) => element.checkVisibility())
  await expect(shown).toHaveLength(1)
  return shown[0]
}

/** With open tasks: Ask {name} to quote and its helper replace Post a task. */
export const WithOpenTasks: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const main = await visibleMain(canvasElement, 'Ask Alex to quote')
    await expect(main.tagName).toBe('BUTTON')
    await expectOneVisible(
      canvasElement,
      'Alex gets a notification and decides whether to send a quote.',
    )
    await expect(canvas.queryByRole('link', { name: 'Post a task' })).toBeNull()
  },
}

/** Tap Ask: the chooser opens with the open tasks; picking one and sending asks once. */
export const OpensTheChooser: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(await visibleMain(canvasElement, 'Ask Alex to quote'))
    const { dialog } = await openDialog(canvasElement, 'Ask Alex to quote')
    const d = within(dialog)
    await expect(d.getAllByRole('radio')).toHaveLength(2)
    await expect(barButton(dialog, 'Ask Alex to quote')).toBeDisabled()
    await userEvent.click(d.getAllByRole('radio')[0])
    await userEvent.click(barButton(dialog, 'Ask Alex to quote'))
    await waitFor(() => expect(args.ask?.onSubmit).toHaveBeenCalledTimes(1))
    await expect(args.ask?.onSubmit).toHaveBeenCalledWith(TASKS[0], 'Alex')
  },
}

/** No open task: the button is the link to Post a task, carrying the worker. */
export const NoOpenTask: Story = {
  args: {
    model: sampleWorker({ id: WORKER_ID, viewer: sampleAskableViewer([]) }),
  },
  play: async ({ canvasElement }) => {
    const main = await visibleMain(canvasElement, 'Ask Alex to quote')
    await expect(main).toHaveAttribute(
      'href',
      `/tasks/create?askWorker=${WORKER_ID}`,
    )
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).toBeNull()
  },
}

/** Open tasks, none of which can be asked: the chooser still opens and shows why. */
export const NoTaskCanBeAsked: Story = {
  args: {
    model: sampleWorker({
      id: WORKER_ID,
      viewer: sampleAskableViewer([{ ...TASKS[1] }]),
    }),
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(await visibleMain(canvasElement, 'Ask Alex to quote'))
    const { dialog } = await openDialog(canvasElement, 'Ask Alex to quote')
    await expect(within(dialog).getByRole('radio')).toBeDisabled()
    await expect(barButton(dialog, 'Ask Alex to quote')).toBeDisabled()
  },
}

/** The API refused: the line shows in the open chooser. */
export const Refused: Story = {
  args: {
    ask: {
      onSubmit: fn(async () => false),
      submitting: false,
      error: 'Alex can’t be asked to quote right now.',
    },
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(await visibleMain(canvasElement, 'Ask Alex to quote'))
    const { dialog } = await openDialog(canvasElement, 'Ask Alex to quote')
    await expect(within(dialog).getByRole('alert')).toBeVisible()
  },
}

/** Not allowed to ask (a block, an opt-out): the visitor view keeps Post a task. */
export const CannotAsk: Story = {
  args: { view: 'worker.visitor', model: sampleWorker() },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', { name: 'Post a task' }),
    ).toHaveAttribute('href', '/tasks/create')
    await expect(
      within(canvasElement).queryByRole('button', { name: /Ask .* to quote/ }),
    ).toBeNull()
  },
}

/** Phone: Ask and its helper sit in the bar above the bottom nav. */
export const Phone: Story = {
  ...viewportAt(390),
  play: async ({ canvasElement }) => {
    const main = await visibleMain(canvasElement, 'Ask Alex to quote')
    const box = main.getBoundingClientRect()
    await expect(box.left).toBeGreaterThanOrEqual(16)
    await expect(window.innerWidth - box.right).toBeGreaterThanOrEqual(16)
    await expectOneVisible(
      canvasElement,
      'Alex gets a notification and decides whether to send a quote.',
    )
  },
}

/** Tablet (820): below the sidebar breakpoint, so the bar is used too. */
export const Tablet820: Story = {
  ...viewportAt(820),
  play: async ({ canvasElement }) => {
    const main = await visibleMain(canvasElement, 'Ask Alex to quote')
    await expect(main).toBeVisible()
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth,
    )
  },
}

/** 1024: the sidebar card carries the action. */
export const Desktop1024: Story = {
  ...viewportAt(1024),
  play: async ({ canvasElement }) => {
    const main = await visibleMain(canvasElement, 'Ask Alex to quote')
    await expect(main.closest('[data-scope="card"], section, div')).toBeTruthy()
    await expect(main.getBoundingClientRect().right).toBeLessThanOrEqual(1024)
  },
}

export const Desktop1366: Story = {
  ...viewportAt(1366),
  play: async ({ canvasElement }) => {
    const main = await visibleMain(canvasElement, 'Ask Alex to quote')
    const box = main.getBoundingClientRect()
    // The sidebar column is at most 340 wide, and the button fills it.
    await expect(box.width).toBeLessThanOrEqual(340)
    await expect(box.height).toBeGreaterThanOrEqual(44)
  },
}

/** zh-HK. */
export const ZhHk: Story = {
  parameters: {
    nextjs: { navigation: { pathname: `/zh-hk/profile/${WORKER_ID}` } },
  },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await visibleMain(canvasElement, '請 Alex 報價')
    await expectOneVisible(
      canvasElement,
      'Alex 會收到通知，並自行決定是否報價。',
    )
  },
}
