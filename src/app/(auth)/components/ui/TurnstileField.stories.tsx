import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, waitFor } from 'storybook/test'

import { withAuthWidgets } from '../../helpers/authStoryDecorator'
import { isTurnstileConfigured } from '../../helpers/turnstileConfig'
import { TurnstileField } from './TurnstileField'

const meta = {
  title: 'Auth/TurnstileField',
  component: TurnstileField,
  parameters: { layout: 'padded' },
  args: { onTokenChange: fn() },
} satisfies Meta<typeof TurnstileField>

export default meta
type Story = StoryObj<typeof meta>

/** Challenge not solved yet: the "Security check" label above the widget (a placeholder here, never Cloudflare). */
export const Default: Story = {
  decorators: [withAuthWidgets()],
}

/** Challenge solved: the field hands the token to the form. */
export const Solved: Story = {
  decorators: [withAuthWidgets({ captchaSolved: true })],
  play: async ({ args }) => {
    // Without a site key the field renders nothing, so there is no token.
    if (!isTurnstileConfigured()) return
    await waitFor(() =>
      expect(args.onTokenChange).toHaveBeenCalledWith('story-turnstile-token'),
    )
  },
}

/** A caller supplies its own label. */
export const CustomLabel: Story = {
  args: { label: 'Confirm you are human' },
  decorators: [withAuthWidgets()],
}
