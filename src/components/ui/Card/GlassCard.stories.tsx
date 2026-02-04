import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { GlassCard } from './GlassCard'

const meta: Meta<typeof GlassCard> = {
  title: 'UI/Atoms/GlassCard',
  component: GlassCard,
  args: {
    p: 6,
  },
}

export default meta

type Story = StoryObj<typeof GlassCard>

export const Default: Story = {
  render: (args) => (
    <GlassCard {...args}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Glass Card</div>
      <div style={{ opacity: 0.8 }}>
        Warm, translucent panel with rounded corners.
      </div>
    </GlassCard>
  ),
}
