import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import {
  TaskMap,
  type TaskMapStack,
  type TaskMapTask,
} from '../../../components/ui/TaskMap'
import { TaskStackList } from './TaskStackList'

/** Deterministic scatter so the story looks the same on every load. */
function scatter(
  prefix: string,
  count: number,
  centre: { lat: number; lng: number },
  spread: number,
  area: string,
): TaskMapTask[] {
  let seed = count * 7919
  const next = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647 - 0.5
  }
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i}`,
    title: `${area} task ${i + 1}`,
    location: area,
    locationLat: centre.lat + next() * spread,
    locationLng: centre.lng + next() * spread * 1.6,
    priceLabel: `£${40 + ((i * 15) % 160)}`,
  }))
}

const SAME_SPOT = { lat: 51.6448, lng: -0.36 }

const tasks: TaskMapTask[] = [
  ...scatter('watford', 24, { lat: 51.6565, lng: -0.3903 }, 0.04, 'Watford'),
  ...scatter('bushey', 14, { lat: 51.6431, lng: -0.3676 }, 0.02, 'Bushey'),
  ...scatter('london', 60, { lat: 51.5072, lng: -0.1276 }, 0.08, 'London'),
  // Approximate public coords: three tasks on exactly the same point.
  ...['Assemble a wardrobe', 'Mount a TV', 'Clear guttering'].map(
    (title, i) => ({
      id: `stack-${i}`,
      title,
      location: 'Bushey',
      locationLat: SAME_SPOT.lat,
      locationLng: SAME_SPOT.lng,
      priceLabel: `£${60 + i * 25}`,
    }),
  ),
]

function ClusterMap({ isDesktop }: { isDesktop: boolean }) {
  const [stack, setStack] = useState<TaskMapStack | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <Box position="relative" w="100vw" h="100vh">
      <TaskMap
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        centerLat={51.58}
        centerLng={-0.26}
        radiusMiles={50}
        tasks={tasks}
        selectedTaskId={selected}
        onSelectTask={setSelected}
        onOpenTaskStack={setStack}
        showReferenceMarker={false}
        navRouteEnabled={false}
      />
      <TaskStackList
        stack={stack}
        tasks={tasks}
        isDesktop={isDesktop}
        onSelect={setSelected}
        onClose={() => setStack(null)}
      />
    </Box>
  )
}

const meta = {
  title: 'search/map/Clusters',
  component: ClusterMap,
  parameters: { layout: 'fullscreen' },
  args: { isDesktop: true },
} satisfies Meta<typeof ClusterMap>

export default meta
type Story = StoryObj<typeof meta>

/** Watford–Bushey and London zoomed out; three Bushey tasks share one point. */
export const WatfordAndLondon: Story = {}
