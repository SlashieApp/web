import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import bag from '../../tasks/[slug]/i11n.json'
import { ApproximateAreaPill } from './ApproximateAreaPill'

/**
 * Over the task map for everyone who does not have the exact address (FE-472):
 * a frosted pill with a lock. Real text for screen readers; it lets every
 * gesture through. The story sits it on stripes so the blur shows.
 */
const meta = {
  title: 'Tasks/ApproximateAreaPill',
  component: ApproximateAreaPill,
  parameters: { layout: 'centered' },
  args: { label: bag.en.details.locationApproxPill },
  decorators: [
    (Story) => (
      <Box
        p={10}
        borderRadius="lg"
        css={{
          background:
            'repeating-linear-gradient(135deg, #DCE6E0 0 14px, #EEF3F0 14px 28px)',
        }}
      >
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof ApproximateAreaPill>

export default meta
type Story = StoryObj<typeof meta>

/** One line, a 14px lock in the muted tone, the text at weight 500. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const text = await within(canvasElement).findByText(
      'Approximate area. Exact address after booking.',
    )
    const pill = text.closest('div') as HTMLElement
    const style = getComputedStyle(pill)
    await expect(style.pointerEvents).toBe('none')
    await expect(style.fontWeight).toBe('500')
    await expect(style.fontSize).toBe('13px')
    // Fully rounded, a 1px border and one line (32px) at this width.
    await expect(Number.parseFloat(style.borderTopLeftRadius)).toBeGreaterThan(
      15,
    )
    await expect(style.borderTopWidth).toBe('1px')
    await expect(Math.round(pill.getBoundingClientRect().height)).toBe(32)
    // The lock is 14px and hidden from a screen reader; the text is not.
    const lock = pill.querySelector('svg') as SVGElement
    await expect(lock.getAttribute('width')).toBe('14')
    await expect(lock.closest('[aria-hidden="true"]')).not.toBeNull()
    await expect(text.closest('[aria-hidden="true"]')).toBeNull()
  },
}

/** Below about 350px it wraps to two lines. */
export const TwoLines: Story = {
  decorators: [
    (Story) => (
      <Box maxW="260px">
        <Story />
      </Box>
    ),
  ],
  play: async ({ canvasElement }) => {
    const text = await within(canvasElement).findByText(
      'Approximate area. Exact address after booking.',
    )
    const pill = text.closest('div') as HTMLElement
    await expect(pill.getBoundingClientRect().height).toBeGreaterThan(40)
  },
}

/** Traditional Chinese. */
export const ZhHk: Story = {
  args: { label: bag.zh_hk.details.locationApproxPill },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('大概位置。預約後會顯示確切地址。')
  },
}

/** Dark: the same tokens on the dark surface. */
export const Dark: Story = {
  globals: { theme: 'dark' },
}
