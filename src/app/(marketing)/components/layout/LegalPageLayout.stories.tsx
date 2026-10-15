import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import cookiesBag from '@/app/(marketing)/cookies/i11n.json'
import safetyBag from '@/app/(marketing)/help/safety/i11n.json'
import privacyBag from '@/app/(marketing)/privacy/i11n.json'
import termsBag from '@/app/(marketing)/terms/i11n.json'

import { LegalPageLayout } from './LegalPageLayout'

const meta = {
  title: 'Marketing/Layout/LegalPageLayout',
  component: LegalPageLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    document: cookiesBag.en,
  },
} satisfies Meta<typeof LegalPageLayout>

export default meta
type Story = StoryObj<typeof meta>

/** Short policy (Cookie Policy): title, updated line, intro, and four sections. */
export const Default: Story = {}

/** Longest document (Terms of Service): many numbered sections in one column. */
export const TermsOfService: Story = {
  args: { document: termsBag.en },
}

/** Privacy Policy: sections with several paragraphs each. */
export const PrivacyPolicy: Story = {
  args: { document: privacyBag.en },
}

/** Safety help page: two intro paragraphs and a section with an anchor id. */
export const SafetyGuidance: Story = {
  args: { document: safetyBag.en },
}

/** Traditional Chinese copy, with its own "last updated" label. */
export const TraditionalChinese: Story = {
  args: { document: cookiesBag.zh_hk },
}

/** No `intro`: the first section follows the title block directly. */
export const WithoutIntro: Story = {
  args: {
    document: {
      title: 'Community guidelines',
      description: 'How we expect members to behave.',
      lastUpdated: '1 October 2026',
      lastUpdatedLabel: 'Last updated',
      sections: [
        {
          heading: '1. Be respectful',
          body: ['Treat other members the way you would like to be treated.'],
        },
        {
          heading: '2. Keep it honest',
          body: [
            'Describe tasks and skills accurately so people can choose well.',
          ],
        },
      ],
    },
  },
}

/** `lastUpdatedLabel` omitted: the layout falls back to "Last updated". */
export const DefaultUpdatedLabel: Story = {
  args: {
    document: {
      title: 'Acceptable use',
      description: 'What you can and cannot do on the service.',
      lastUpdated: '1 October 2026',
      intro: ['These rules apply to everything you post.'],
      sections: [
        {
          heading: '1. Prohibited content',
          body: ['Do not post anything unlawful, misleading, or abusive.'],
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('Last updated: 1 October 2026'),
    ).toBeVisible()
  },
}

/** Email addresses in the intro and body become mailto links. */
export const EmailLinks: Story = {
  args: {
    document: {
      title: 'Contact us',
      description: 'Where to send questions.',
      lastUpdated: '1 October 2026',
      lastUpdatedLabel: 'Last updated',
      intro: ['Questions about this page? Write to hello@example.com.'],
      sections: [
        {
          heading: '1. Who to write to',
          body: [
            'Billing: billing@example.com. Safety concerns: safety@example.com, any time.',
          ],
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('link', { name: 'hello@example.com' }),
    ).toHaveAttribute('href', 'mailto:hello@example.com')
    await expect(canvas.getAllByRole('link')).toHaveLength(3)
  },
}

/** Phone width: the page padding tightens and the column fills the screen. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { document: safetyBag.en },
}
