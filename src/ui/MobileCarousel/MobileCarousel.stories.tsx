import { Box, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Card } from '../Card'
import { MobileCarousel } from './MobileCarousel'

const ITEMS = Array.from({ length: 5 }, (_, i) => ({
  id: `item-${i + 1}`,
  title: `Card ${i + 1}`,
}))

function DemoCarousel() {
  const [selectedId, setSelectedId] = useState<string | null>(ITEMS[0].id)
  const [lastOpened, setLastOpened] = useState<string | null>(null)

  return (
    <Box maxW="420px">
      <MobileCarousel
        items={ITEMS}
        selectedId={selectedId}
        onSnapSelect={setSelectedId}
        onActivateCentered={setLastOpened}
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
              <Text fontWeight={700}>{item.title}</Text>
              <Text fontSize="sm" color="text.muted">
                {state.isCentered ? 'Centered — tap to open' : 'Tap to snap'}
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
  title: 'ui/MobileCarousel',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const SwipeAndSnap: Story = {
  render: () => <DemoCarousel />,
}
