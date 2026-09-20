import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerSkillsSection } from './WorkerSkillsSection'

const meta: Meta<typeof WorkerSkillsSection> = {
  title: 'worker/workers/ui/sections/WorkerSkillsSection',
  component: WorkerSkillsSection,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
