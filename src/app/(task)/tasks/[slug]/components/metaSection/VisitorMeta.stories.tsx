import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { OrderStatus } from '@codegen/schema'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  storyTaskDetail,
  storyTaskOrder,
} from '../../helpers/taskDetailStoryFixtures'

import { VisitorMeta } from './VisitorMeta'

const meta = {
  title: 'taskDetail/MetaSection/VisitorMeta',
  component: VisitorMeta,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [withTaskDetailStory({ viewer: 'owner' }, { maxWidth: '360px' })],
} satisfies Meta<typeof VisitorMeta>

export default meta

type Story = StoryObj<typeof meta>

export const OwnerOpenTask: Story = {}

export const OwnerBookedExactLocation: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        order: storyTaskOrder({ status: OrderStatus.Active }),
      },
      { maxWidth: '360px' },
    ),
  ],
}

export const VisitorApproximate: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'visitor',
        task: storyTaskDetail({
          location: {
            lat: 51.5074,
            lng: -0.1278,
            name: 'Westminster, London',
            address: null,
          },
        }),
      },
      { maxWidth: '360px' },
    ),
  ],
}
