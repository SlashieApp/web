import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { DesignDraft } from './DesignDraft'

const meta: Meta<typeof DesignDraft> = {
  title: 'Drafts/HandyBox Landing',
  component: DesignDraft,
}

export default meta

type Story = StoryObj<typeof DesignDraft>

export const Default: Story = {}
