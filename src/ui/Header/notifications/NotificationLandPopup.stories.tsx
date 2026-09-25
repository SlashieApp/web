import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { NotificationLandPopup } from './NotificationLandPopup'

const meta = {
  title: 'ui/NotificationLandPopup',
  component: NotificationLandPopup,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    open: true,
    title: 'How did the job go?',
    body: 'Leave a short review for the completed task. You can edit it for 48 hours.',
    primaryLabel: 'Review',
    onPrimary: () => {},
    onDismiss: () => {},
  },
} satisfies Meta<typeof NotificationLandPopup>

export default meta
type Story = StoryObj<typeof meta>

export const ReviewPrompt: Story = {}

export const WithImageAndLink: Story = {
  args: {
    title: 'Founding workers in Watford',
    body: 'A note for people in the Watford and Bushey cohort.',
    imageUrl: '/images/slashie-mark.svg',
    primaryLabel: 'Open',
  },
}
