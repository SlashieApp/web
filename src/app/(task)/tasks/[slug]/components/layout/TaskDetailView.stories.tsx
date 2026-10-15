import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { withTaskDetailPending } from '../../helpers/taskDetailStoryExtras'
import { TaskDetailView } from './TaskDetailView'

/**
 * One CSS-responsive tree: below `lg` a map hero with sticky chrome and a
 * pinned main button, from `lg` a page column over the map. The map itself
 * is published to the layout's host, so a story shows a plain surface.
 */
const meta = {
  title: 'Task detail/Layout/TaskDetailView',
  component: TaskDetailView,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TaskDetailView>

export default meta
type Story = StoryObj<typeof meta>

/** Wait for the task title, the sign that the page has its data. */
async function expectTitle(canvasElement: HTMLElement) {
  await within(canvasElement).findByRole(
    'heading',
    { level: 1, name: 'Mount bookshelf on living room wall' },
    { timeout: 4000 },
  )
}

/** Desktop: back chip over the map band, title, tabs, cards and the rail. */
export const Desktop: Story = {
  globals: { viewport: { value: 'desktop' } },
  decorators: [withTaskDetailStory({ viewer: 'owner' }, { maxWidth: '100%' })],
  play: async ({ canvasElement }) => expectTitle(canvasElement),
}

/** Tablet: the compact layout with the map band; no rail. */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet' } },
  decorators: [withTaskDetailStory({ viewer: 'owner' }, { maxWidth: '100%' })],
  play: async ({ canvasElement }) => expectTitle(canvasElement),
}

/** Phone: map band, sticky title with the options menu, pinned main button. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withTaskDetailStory({ viewer: 'worker' }, { maxWidth: '100%' })],
  play: async ({ canvasElement }) => expectTitle(canvasElement),
}

/** Desktop while the task loads: skeleton title and summary. */
export const Loading: Story = {
  globals: { viewport: { value: 'desktop' } },
  decorators: [withTaskDetailPending('loading')],
}

/** Phone while the task loads. */
export const PhoneLoading: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withTaskDetailPending('loading')],
}
