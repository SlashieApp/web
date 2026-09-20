import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CookieConsentBanner } from './CookieConsentBanner'

const meta: Meta<typeof CookieConsentBanner> = {
  title: 'app/CookieConsentBanner',
  component: CookieConsentBanner,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
