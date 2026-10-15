import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerProfileSectionSkeleton } from './WorkerProfileSkeletons'

const meta: Meta<typeof WorkerProfileSectionSkeleton> = {
  title: 'Worker profile/WorkerProfileSkeletons',
  component: WorkerProfileSectionSkeleton,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
