import { ThreadKind } from '@codegen/schema'
import type { ThreadFieldsFragment } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ThreadHeader } from './ThreadHeader'

const thread: ThreadFieldsFragment = {
  id: 'thread-1',
  kind: ThreadKind.Task,
  title: 'Mount bookshelf on living room wall',
  unreadCount: 0,
  canSend: true,
  blockedByMe: false,
  updatedAt: '2026-10-14T09:00:00.000Z',
  task: { id: 'task-1', title: 'Mount bookshelf on living room wall' },
  otherParty: {
    userId: 'other-user',
    name: 'Alex Chen',
    avatarUrl: null,
    deleted: false,
  },
  lastItem: null,
}

/**
 * Thread header (FE-267): the title and name open the task. The options menu
 * (FE-272) appears once the thread's task loads from the API, so it does not
 * render here; its rules are covered by `threadMenuActions` tests.
 */
const meta = {
  title: 'Messages/ThreadHeader',
  component: ThreadHeader,
  args: { thread, onToggleBlock: () => {} },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ThreadHeader>

export default meta
type Story = StoryObj<typeof meta>

export const TaskThread: Story = {}

/** Slashie announcements: no task link, no menu. */
export const SystemThread: Story = {
  args: {
    thread: {
      ...thread,
      kind: ThreadKind.System,
      title: 'Slashie',
      task: null,
      otherParty: null,
      canSend: false,
    },
  },
}
