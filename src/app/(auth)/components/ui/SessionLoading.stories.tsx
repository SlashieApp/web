import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { SessionLoading } from './SessionLoading'

const meta = {
  title: 'Auth/SessionLoading',
  component: SessionLoading,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SessionLoading>

export default meta
type Story = StoryObj<typeof meta>

/** The wait before a signed-in page: wordmark and a progress bar with the session copy. */
export const Default: Story = {}

/** A caller overrides the caption and the progress track name. */
export const CustomLabel: Story = {
  args: { label: 'Signing you back in…', trackLabel: 'Signing in' },
}
