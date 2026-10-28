import { Box, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, waitFor, within } from 'storybook/test'

import { Card } from '../Card'
import { MobileCarousel } from './MobileCarousel'

const ITEMS = Array.from({ length: 5 }, (_, i) => ({
  id: `item-${i + 1}`,
  title: `Card ${i + 1}`,
}))

function DemoCarousel({
  items = ITEMS,
  initialSelectedId = ITEMS[0].id,
  disabled = false,
}: {
  items?: readonly (typeof ITEMS)[number][]
  initialSelectedId?: string | null
  disabled?: boolean
}) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId)
  const [lastOpened, setLastOpened] = useState<string | null>(null)

  return (
    <Box maxW="420px">
      <MobileCarousel
        items={items}
        selectedId={selectedId}
        onSnapSelect={setSelectedId}
        onActivateCentered={setLastOpened}
        disabled={disabled}
      >
        {(item, state) => (
          <Box
            cursor={state.activateCursor}
            onClick={state.activate}
            aria-label={
              state.isPeekAdjacent
                ? `${item.title}. Show ${state.peekDirection} card.`
                : `${item.title}. Open.`
            }
            css={{ touchAction: 'pan-y' }}
          >
            <Card isActive={state.isActive} p={5} minH="120px">
              <Text fontWeight={500}>{item.title}</Text>
              <Text fontSize="sm" color="text.muted">
                {state.isCentered ? 'Centered: tap to open' : 'Tap to snap'}
              </Text>
            </Card>
          </Box>
        )}
      </MobileCarousel>
      <Text fontSize="xs" color="text.muted" px={3} pt={2}>
        Selected: {selectedId ?? 'none'} · Last opened: {lastOpened ?? 'none'}
      </Text>
    </Box>
  )
}

// `component` omitted: MobileCarousel is generic with a required render
// prop, so these are render-only stories.
const meta = {
  title: 'UI/MobileCarousel',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** Swipe and snap: five cards, the first selected; swiping or tapping a neighbour snaps. */
export const SwipeAndSnap: Story = {
  render: () => <DemoCarousel />,
}

/** Preselected: an external selection (a map pin) scrolls the strip to that card. */
export const Preselected: Story = {
  render: () => <DemoCarousel initialSelectedId="item-3" />,
  play: async ({ canvasElement }) => {
    await waitFor(
      () =>
        expect(
          within(canvasElement).getByText(/Selected: item-3/),
        ).toBeVisible(),
      { timeout: 3000 },
    )
  },
}

/** Disabled: the strip ignores touch and clicks while a route shows on the map. */
export const Disabled: Story = {
  render: () => <DemoCarousel disabled />,
  play: async ({ canvasElement }) => {
    const card = await within(canvasElement).findByText('Card 1')
    await expect(getComputedStyle(card).pointerEvents).toBe('none')
  },
}

/** Single card: one slide with nothing to swipe to. */
export const SingleItem: Story = {
  render: () => <DemoCarousel items={ITEMS.slice(0, 1)} />,
}

/** Empty: renders nothing, the caller owns its empty state. */
export const Empty: Story = {
  render: () => <DemoCarousel items={[]} initialSelectedId={null} />,
}

/** Phone: slides fill the width, with no neighbour peek or edge fade. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: () => <DemoCarousel />,
}
