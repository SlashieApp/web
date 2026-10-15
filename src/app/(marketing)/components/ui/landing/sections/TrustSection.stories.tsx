import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import messages from '@/app/(marketing)/i11n.json'

import { TrustSection } from './TrustSection'

const { points } = messages.en.landing.trust

const meta = {
  title: 'Marketing/Landing/TrustSection',
  component: TrustSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    points,
  },
} satisfies Meta<typeof TrustSection>

export default meta
type Story = StoryObj<typeof meta>

/** The four real reassurance points in one row on wide screens. */
export const Default: Story = {}

/** Two points: the grid keeps its column width and leaves the rest empty. */
export const TwoPoints: Story = {
  args: { points: points.slice(0, 2) },
}

/** Long points wrap to several lines while the check icons stay top-aligned. */
export const LongText: Story = {
  args: {
    points: [
      'No platform cut from the job, ever, whatever size the task is or who does it',
      'Payment stays between customer and worker, in whatever way they both prefer',
      'Profiles, reviews, and proof of past work so you can choose with confidence',
      'Local tasks, local workers, and clear quotes before anyone commits to anything',
    ],
  },
}

/** Phone width: points stack into a single column. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Tablet width: points flow into two columns. */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet', isRotated: false } },
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: { points: messages.zh_hk.landing.trust.points },
}
