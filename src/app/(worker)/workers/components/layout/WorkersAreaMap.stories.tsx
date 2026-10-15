import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withWorkersStory } from '../workersStoryDecorator'
import { WorkersAreaMap } from './WorkersAreaMap'

/**
 * Banner map for the worker directory: frames the searched area and shades the
 * search radius. It needs `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` and loads live
 * Mapbox tiles; without a token it shows a "Map preview unavailable" band.
 */
const meta = {
  title: 'Workers/WorkersAreaMap',
  component: WorkersAreaMap,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof WorkersAreaMap>

export default meta
type Story = StoryObj<typeof meta>

/** London at the default 10 mile radius. */
export const Default: Story = {
  decorators: [withWorkersStory()],
}

/** A small, 2 mile radius around Camden: the camera zooms in on the disc. */
export const SmallRadius: Story = {
  decorators: [
    withWorkersStory({
      area: { label: 'Camden', lat: 51.539, lng: -0.1426 },
      radiusMiles: 2,
    }),
  ],
}

/** A wide, 40 mile radius: the camera pulls back to fit the disc. */
export const WideRadius: Story = {
  decorators: [withWorkersStory({ radiusMiles: 40 })],
}

/** Dark theme: the map switches to the dark Mapbox style. */
export const Dark: Story = {
  globals: { theme: 'dark' },
  decorators: [withWorkersStory()],
}

/** Phone: the banner is shorter (200px). */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withWorkersStory()],
}
