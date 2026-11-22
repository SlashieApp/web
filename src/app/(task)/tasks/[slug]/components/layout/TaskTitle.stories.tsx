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
 * The task title, the page's one h1 (24px, `heading-lg`, a step under the other
 * page headers' 34): under the map, with a line under it. It scrolls with the
 * page and collapses into the page header's bar (see Task detail/Page), where
 * Back and the options menu are. It shows at most 3 lines: a longer title ends
 * with an ellipsis and is a toggle that shows all of it (FE-465). The task's
 * status pill follows the title on its last line (Ryan 22 Nov).
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

/** The title's line: heading-lg is 24/30. */
const LINE = 30

/** What task details puts around the title: the page header, clamping it to 3 lines. */
function TitleInHeader({ children }: { children: ReactNode }) {
  const title = useTaskTitle()
  return (
    <StickyHeader
      overMedia
      background="bg.canvas"
      title={title}
      titleMaxLines={TASK_TITLE_MAX_LINES}
      titleSize="lg"
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
    expect(style.fontSize).toBe('24px')
    expect(style.lineHeight).toBe('30px')
    expect(style.letterSpacing).toBe('-0.48px')
    expect(style.fontWeight).toBe('500')
    // No toggle on a short title.
    expect(within(h1).queryByRole('button')).toBeNull()
    expect(h1.querySelector('[aria-expanded]')).toBeNull()
    // The status pill follows the title on the same line, an inline-block
    // that adds no height; the heading is still named by the title alone.
    const pill = within(h1).getByText('Open')
    const after = h1.querySelector(
      '[data-sticky-header-title-after]',
    ) as HTMLElement
    expect(getComputedStyle(after).display).toBe('inline-flex')
    const text = h1.querySelector(
      '[data-sticky-header-title-text]',
    ) as HTMLElement
    const lastLine = [...text.getClientRects()].at(-1) as DOMRect
    expect(pill.getBoundingClientRect().left).toBeGreaterThan(lastLine.right)
    expect(pill.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      lastLine.top - 1,
    )
    expect(pill.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      lastLine.bottom + 1,
    )
    expect(h1.getBoundingClientRect().height).toBe(LINE)
  },
}

/**
 * A title that fills its line: the pill moves to the next line whole, at the
 * left edge, never split and never off the edge.
 */
export const PillWrapsWhole: Story = {
  decorators: [
    (Story) => (
      <Box maxW="24.5rem">
        <Story />
      </Box>
    ),
    withHeader,
    withTaskDetailStory({ viewer: 'owner' }),
  ],
  play: async ({ canvasElement }) => {
    const h1 = await within(canvasElement).findByRole('heading', {
      level: 1,
      name: TITLE,
    })
    const pill = within(h1).getByText('Open')
    const box = pill.getBoundingClientRect()
    const frame = h1.getBoundingClientRect()
    expect(box.right).toBeLessThanOrEqual(frame.right + 0.5)
    expect(box.left).toBeGreaterThanOrEqual(frame.left - 0.5)
    // Still plain text: a title this long is not clamped.
    expect(within(h1).queryByRole('button')).toBeNull()
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
    // Three lines of title; the pill cannot follow text that is cut off, so
    // it takes the line under them.
    const closed = () =>
      Math.abs(toggle.getBoundingClientRect().height - 3 * LINE)
    expect(closed()).toBeLessThan(1)
    expect(Math.abs(h1.getBoundingClientRect().height - 4 * LINE)).toBeLessThan(
      1,
    )
    const pill = within(h1).getByText('Open')
    expect(pill.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      toggle.getBoundingClientRect().bottom,
    )
    await expect(h1).toHaveTextContent(LONG_TITLE)
    await expect(
      within(canvasElement).getAllByRole('heading', { level: 1 }),
    ).toHaveLength(1)

    // A click opens it, and a second folds it back.
    await userEvent.click(toggle)
    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'true'))
    expect(toggle.getBoundingClientRect().height).toBeGreaterThan(3 * LINE + 1)
    await userEvent.click(toggle)
    await waitFor(() =>
      expect(toggle).toHaveAttribute('aria-expanded', 'false'),
    )
    expect(closed()).toBeLessThan(1)

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
