import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, waitFor, within } from 'storybook/test'

import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

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

/**
 * The label is the form label: the FormField label's 14 on a 20 line, medium
 * (it was 14 on 21), 8 above the widget and inset 4 as the labels of the fields
 * around it are, so a field above and below it sits on the 20 rhythm.
 */
export const LabelIsTheFormLabel: Story = {
  decorators: [withAuthWidgets()],
  play: async ({ canvasElement }) => {
    // Without a site key the field renders nothing: there is no label.
    if (!isTurnstileConfigured()) return
    const canvas = within(canvasElement)
    const label = await canvas.findByText('Security check')
    const widget = await canvas.findByText('Security check placeholder')
    const style = getComputedStyle(label)
    await expect(style.fontSize).toBe('14px')
    await expect(style.lineHeight).toBe('20px')
    await expect(style.fontWeight).toBe('500')
    await expect(heightOf(label)).toBe(20)
    await expect(style.paddingLeft).toBe('4px')
    await expect(
      gapBelow(label, widget.closest('[aria-labelledby]') as HTMLElement),
    ).toBe(formSpace.labelToControl)
  },
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
