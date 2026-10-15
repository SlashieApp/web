import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { MapCard } from './MapCard'

const meta = {
  title: 'UI/MapCard',
  component: MapCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    // No token on purpose: with one, MapCard requests a Mapbox static image
    // (a network call), so every story shows the "Map preview unavailable" tile.
    accessToken: undefined,
    lat: 51.5074,
    lng: -0.1278,
    height: '200px',
  },
} satisfies Meta<typeof MapCard>

export default meta
type Story = StoryObj<typeof meta>

/** Exact: full address shared, so the "Open in Maps" bar sits under the map. */
export const Exact: Story = {
  args: { variant: 'exact' },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', {
      name: 'Open in Maps',
    })
    await expect(link.getAttribute('href')).toContain('query=51.5074')
  },
}

/** Approximate: area only, so there is no "Open in Maps" bar. */
export const Approximate: Story = {
  args: { variant: 'approximate' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('link')).toBeNull()
  },
}

/** Exact without the bar: `showOpenInMaps={false}` hides the action. */
export const ExactWithoutOpenInMaps: Story = {
  args: { variant: 'exact', showOpenInMaps: false },
}

/** Approximate with the bar: `showOpenInMaps` forces the action on. */
export const ApproximateWithOpenInMaps: Story = {
  args: { variant: 'approximate', showOpenInMaps: true },
}

/** Tall: a 320px map instead of the default 200px. */
export const Tall: Story = {
  args: { variant: 'exact', height: '320px' },
}

/** Invalid coordinates: non-finite lat or lng hides the bar even when exact. */
export const InvalidCoordinates: Story = {
  args: { variant: 'exact', lat: Number.NaN, lng: Number.NaN },
}
