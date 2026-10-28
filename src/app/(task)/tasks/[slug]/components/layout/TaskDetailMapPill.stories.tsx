import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskOrder } from '../../helpers/taskDetailStoryFixtures'
import { TaskDetailMapPill } from './TaskDetailMapPill'

const PILL = 'Approximate area. Exact address after booking.'

/**
 * Below lg: the pill sits just above the content's top (the story's box top),
 * centred, for everyone who does not have the exact address. From lg it is in
 * the map's layer, so this one is hidden there. The map itself is not in a
 * story.
 */
const meta = {
  title: 'Task detail/Layout/TaskDetailMapPill',
  component: TaskDetailMapPill,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      // The content wrapper: the pill is anchored to its top edge.
      <Box position="relative" mt="120px" h="200px" bg="bg.canvas">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof TaskDetailMapPill>

export default meta
type Story = StoryObj<typeof meta>

const phone = { globals: { viewport: { value: 'mobile1' } } } as const

/** Signed out: the pill, 8px above the content's top and centred. */
export const Visitor: Story = {
  ...phone,
  decorators: [
    withTaskDetailStory({ viewer: 'visitor' }, { maxWidth: '100%' }),
  ],
  play: async ({ canvasElement }) => {
    const text = await within(canvasElement).findByText(PILL)
    const pill = text.closest('div') as HTMLElement
    const wrapper = pill.parentElement as HTMLElement
    const content = wrapper.parentElement as HTMLElement
    const gap =
      content.getBoundingClientRect().top - pill.getBoundingClientRect().bottom
    await expect(Math.abs(gap - 8)).toBeLessThan(1)
    const frame = (wrapper.offsetParent as HTMLElement).getBoundingClientRect()
    const centre =
      pill.getBoundingClientRect().left + pill.getBoundingClientRect().width / 2
    await expect(
      Math.abs(centre - (frame.left + frame.width / 2)),
    ).toBeLessThan(1)
    // Over the title wash, and it never blocks the map.
    await expect(getComputedStyle(wrapper).zIndex).toBe('2')
    await expect(getComputedStyle(pill).pointerEvents).toBe('none')
  },
}

/** A worker whose quote is pending is not the booked worker: the pill. */
export const WorkerPendingQuote: Story = {
  ...phone,
  decorators: [withTaskDetailStory({ viewer: 'worker' }, { maxWidth: '100%' })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(PILL)
  },
}

/** The owner's preview ("view as others see it") shows what others see. */
export const OwnerPreviewAsGuest: Story = {
  ...phone,
  decorators: [
    withTaskDetailStory(
      { viewer: 'owner', viewAs: 'guest' },
      { maxWidth: '100%' },
    ),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(PILL)
  },
}

/** Narrow phone: it wraps to two lines and stays inside the margin. */
export const NarrowPhone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [
    withTaskDetailStory({ viewer: 'visitor' }, { maxWidth: '100%' }),
    (Story) => (
      <Box w="320px" position="relative">
        <Story />
      </Box>
    ),
  ],
  play: async ({ canvasElement }) => {
    const text = await within(canvasElement).findByText(PILL)
    const pill = text.closest('div') as HTMLElement
    const frame = (
      pill.parentElement?.offsetParent as HTMLElement
    ).getBoundingClientRect()
    await expect(pill.getBoundingClientRect().height).toBeGreaterThan(40)
    await expect(
      pill.getBoundingClientRect().left - frame.left,
    ).toBeGreaterThanOrEqual(16)
    await expect(
      frame.right - pill.getBoundingClientRect().right,
    ).toBeGreaterThanOrEqual(16)
  },
}

/** The owner has the exact address: no pill. */
export const OwnerExact: Story = {
  ...phone,
  decorators: [withTaskDetailStory({ viewer: 'owner' }, { maxWidth: '100%' })],
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    await expect(within(canvasElement).queryByText(PILL)).toBeNull()
  },
}

/** The booked worker has the exact address: no pill. */
export const BookedWorkerExact: Story = {
  ...phone,
  decorators: [
    withTaskDetailStory(
      { viewer: 'worker', order: storyTaskOrder() },
      { maxWidth: '100%' },
    ),
  ],
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    await expect(within(canvasElement).queryByText(PILL)).toBeNull()
  },
}
