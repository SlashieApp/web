import { Box } from '@chakra-ui/react'
import { TaskStatus } from '@codegen/schema'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ReactNode } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { StickyHeader } from '@ui'

import { TASK_TITLE_MAX_LINES } from '../../helpers/taskDetailLayout'
import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { withTaskDetailPending } from '../../helpers/taskDetailStoryExtras'
import { storyTaskDetail } from '../../helpers/taskDetailStoryFixtures'
import { TaskTitle, useTaskTitle } from './TaskTitle'

/**
 * The task title, the page's one h1 (34px): under the map with the chips under
 * it. It scrolls with the page and collapses into the page header's bar (see
 * Task detail/Page), where Back and the options menu are. It shows at most 3
 * lines: a longer title ends with an ellipsis and is a toggle that shows all of
 * it (FE-465). The status badge lives on the Task summary.
 */
const meta = {
  title: 'Task detail/Layout/TaskTitle',
  component: TaskTitle,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TaskTitle>

export default meta
type Story = StoryObj<typeof meta>

const TITLE = 'Mount bookshelf on living room wall'
const LONG_TITLE =
  'Mount a floating bookshelf, three picture rails and a TV bracket across the living room and hallway before the weekend'

/** The title's line: 34px at 1.2. */
const LINE = 34 * 1.2

/** What task details puts around the title: the page header, clamping it to 3 lines. */
function TitleInHeader({ children }: { children: ReactNode }) {
  const title = useTaskTitle()
  return (
    <StickyHeader
      overMedia
      background="bg.canvas"
      title={title}
      titleMaxLines={TASK_TITLE_MAX_LINES}
    >
      {children}
    </StickyHeader>
  )
}

const withHeader: Decorator = (Story) => (
  <TitleInHeader>
    <Story />
  </TitleInHeader>
)

/** A phone-width column, where a long title needs more than 3 lines. */
const withPhoneColumn: Decorator = (Story) => (
  <Box maxW="22rem">
    <Story />
  </Box>
)

/** Owner of an open task: a title that fits is plain text. */
export const Default: Story = {
  decorators: [withHeader, withTaskDetailStory({ viewer: 'owner' })],
  play: async ({ canvasElement }) => {
    const h1 = await within(canvasElement).findByRole('heading', {
      level: 1,
      name: TITLE,
    })
    const style = getComputedStyle(h1)
    expect(style.fontSize).toBe('34px')
    expect(style.fontWeight).toBe('700')
    // No toggle on a short title.
    expect(within(h1).queryByRole('button')).toBeNull()
    expect(h1.querySelector('[aria-expanded]')).toBeNull()
  },
}

/**
 * A long title shows 3 lines and ends with an ellipsis. The heading still
 * holds the whole title, and it is a toggle: a tap, Enter or Space shows all of
 * it, and the same folds it back.
 */
export const LongTitle: Story = {
  decorators: [
    withPhoneColumn,
    withHeader,
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({ title: LONG_TITLE }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const h1 = await within(canvasElement).findByRole('heading', {
      level: 1,
      name: LONG_TITLE,
    })
    const toggle = await within(h1).findByRole('button')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(Math.abs(h1.getBoundingClientRect().height - 3 * LINE)).toBeLessThan(
      1,
    )
    await expect(h1).toHaveTextContent(LONG_TITLE)
    await expect(
      within(canvasElement).getAllByRole('heading', { level: 1 }),
    ).toHaveLength(1)

    // A click opens it, and a second folds it back.
    await userEvent.click(toggle)
    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'true'))
    expect(h1.getBoundingClientRect().height).toBeGreaterThan(3 * LINE + 1)
    await userEvent.click(toggle)
    await waitFor(() =>
      expect(toggle).toHaveAttribute('aria-expanded', 'false'),
    )
    expect(Math.abs(h1.getBoundingClientRect().height - 3 * LINE)).toBeLessThan(
      1,
    )

    // The keyboard too: Enter opens, Space folds.
    toggle.focus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'true'))
    await userEvent.keyboard(' ')
    await waitFor(() =>
      expect(toggle).toHaveAttribute('aria-expanded', 'false'),
    )
  },
}

/** Phone: the title wraps in the one column, 3 lines of it. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [
    withPhoneColumn,
    withHeader,
    withTaskDetailStory({
      viewer: 'visitor',
      task: storyTaskDetail({ status: TaskStatus.Open, title: LONG_TITLE }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const h1 = await within(canvasElement).findByRole('heading', {
      level: 1,
      name: LONG_TITLE,
    })
    const toggle = await within(h1).findByRole('button')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  },
}

/** Direct load: a skeleton bar stands in for the title. */
export const Loading: Story = {
  decorators: [withTaskDetailPending('loading')],
}

/** Opened from a search card: the card's title shows while the rest loads. */
export const LoadingFromSearchCard: Story = {
  decorators: [withTaskDetailPending('listingSeed')],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', { level: 1, name: TITLE })
    expect(canvasElement).toBeVisible()
  },
}
