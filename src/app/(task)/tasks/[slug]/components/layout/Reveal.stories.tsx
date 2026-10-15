import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'

import { Card } from '@ui'

import { Reveal, staggerChildrenCss } from './Reveal'

const meta = {
  title: 'Task detail/Layout/Reveal',
  component: Reveal,
  parameters: { layout: 'padded' },
  args: {
    children: (
      <Card layout="section" framed eyebrow="Summary" heading="Worker booked">
        The whole block fades up from the bottom when it first renders.
      </Card>
    ),
  },
} satisfies Meta<typeof Reveal>

export default meta
type Story = StoryObj<typeof meta>

/** One section (card or skeleton) rises into place on first paint. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Worker booked')
  },
}

/** A stack of cards using `staggerChildrenCss`: each follows 40ms after the last. */
export const StaggeredCards: Story = {
  render: () => (
    <Stack gap={5} css={staggerChildrenCss}>
      {['Summary', 'Analytics', 'Activity', 'Quotes'].map((title) => (
        <Card key={title} layout="section" framed eyebrow={title}>
          Appears in sequence with its neighbours.
        </Card>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Quotes')
  },
}
