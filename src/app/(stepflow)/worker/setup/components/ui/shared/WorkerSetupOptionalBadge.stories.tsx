import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  WorkerSetupOptionalBadge,
  WorkerSetupOptionalLabel,
} from './WorkerSetupOptionalBadge'

const meta: Meta<typeof WorkerSetupOptionalBadge> = {
  title: 'Worker setup/WorkerSetupOptionalBadge',
  component: WorkerSetupOptionalBadge,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** The badge on its own. */
export const Default: Story = {}

/** As used in a field label: the label text followed by the badge. */
export const InLabel: Story = {
  render: () => (
    <WorkerSetupOptionalLabel>Travel radius (miles)</WorkerSetupOptionalLabel>
  ),
}
