import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { OrderStatus } from '@codegen/schema'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  storyTaskDetail,
  storyTaskOrder,
} from '../../helpers/taskDetailStoryFixtures'

import { MainSectionPrimaryMeta } from './MainSectionPrimaryMeta'

const meta = {
  title: 'task/tasks/mainSection/MainSectionPrimaryMeta',
  component: MainSectionPrimaryMeta,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [withTaskDetailStory({ viewer: 'owner' }, { maxWidth: '640px' })],
} satisfies Meta<typeof MainSectionPrimaryMeta>

export default meta

type Story = StoryObj<typeof meta>

export const PublicLocation: Story = {}

export const ExactLocationWithOrder: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        order: storyTaskOrder({ status: OrderStatus.Active }),
      },
      { maxWidth: '640px' },
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
      { maxWidth: '640px' },
    ),
  ],
}
