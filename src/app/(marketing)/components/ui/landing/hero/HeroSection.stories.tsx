import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import messages from '@/app/(marketing)/i11n.json'

import { HeroSection } from './HeroSection'

const meta = {
  title: 'Marketing/Landing/HeroSection',
  component: HeroSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    copy: messages.en.landing.hero,
    ctas: { seeHowItWorks: messages.en.common.ctas.seeHowItWorks },
  },
} satisfies Meta<typeof HeroSection>

export default meta
type Story = StoryObj<typeof meta>

/** Desktop: centred heading, body, search bar, trust chips and the how-it-works link. */
export const Default: Story = {}

/** Phone width: smaller heading, tighter spacing, chips wrap under the search bar. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy (zh_hk bag): CJK wrapping in the heading and body. */
export const TraditionalChinese: Story = {
  args: {
    copy: messages.zh_hk.landing.hero,
    ctas: { seeHowItWorks: messages.zh_hk.common.ctas.seeHowItWorks },
  },
}

/** Long copy: a two-line heading, a longer body and six chips that wrap. */
export const LongCopy: Story = {
  args: {
    copy: {
      ...messages.en.landing.hero,
      heading:
        'Help around the corner, whatever the job and whenever you need it.',
      body: 'Trusted local workers send clear quotes for the job you post, and you choose who to hire. No platform cut of the job.',
      trustChips: [
        'No job fee',
        'Local workers',
        'Pay directly',
        'Free to post',
        'Reviews you can read',
        'Clear quotes',
      ],
    },
  },
}
