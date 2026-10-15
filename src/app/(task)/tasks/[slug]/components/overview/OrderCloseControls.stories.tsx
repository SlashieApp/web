import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { OrderCloseKind } from '@codegen/schema'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskOrder } from '../../helpers/taskDetailStoryFixtures'

import { OrderCloseControls } from './OrderCloseControls'

const meta = {
  title: 'Task detail/Overview/OrderCloseControls',
  component: OrderCloseControls,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    withTaskDetailStory({ viewer: 'worker', order: storyTaskOrder() }),
  ],
} satisfies Meta<typeof OrderCloseControls>

export default meta

type Story = StoryObj<typeof meta>

/** Booked time has started and the viewer has not acted. */
export const Ready: Story = {}

/** After marking Done, the viewer can still switch to Failed. */
export const AfterDone: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      order: storyTaskOrder({
        myCloseAction: {
          kind: OrderCloseKind.Done,
          at: '2026-06-10T17:00:00.000Z',
        },
      }),
    }),
  ],
}
