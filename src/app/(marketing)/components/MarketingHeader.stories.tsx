import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { FeedbackDialogProvider } from '@/ui/FeedbackDialog/FeedbackDialogProvider'
import { MarketingHeader } from './MarketingHeader'

const meta = {
  title: 'marketing/Header',
  component: MarketingHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <FeedbackDialogProvider onSubmit={async () => true}>
        <Story />
      </FeedbackDialogProvider>
    ),
  ],
} satisfies Meta<typeof MarketingHeader>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
