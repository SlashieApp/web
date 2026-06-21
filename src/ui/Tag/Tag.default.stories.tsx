import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Tag } from './Tag'

const meta = {
  title: 'ui/Tag/Default',
  component: Tag,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Tag>

export default meta

type Story = StoryObj<typeof meta>

export const OpenForQuotes: Story = {
  render: () => <Tag color="primary">Open for quotes</Tag>,
}

export const VerifiedPoster: Story = {
  render: () => <Tag color="tertiary">Verified poster</Tag>,
}

export const Cancelled: Story = {
  render: () => <Tag color="danger">Cancelled</Tag>,
}

export const Draft: Story = {
  render: () => <Tag color={null}>Draft</Tag>,
}
