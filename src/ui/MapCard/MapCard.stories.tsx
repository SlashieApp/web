import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MapCard } from './MapCard'

const meta = {
  title: 'ui/MapCard',
  component: MapCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    // Stories run without a Mapbox token, so the graceful fallback shows.
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    lat: 51.5074,
    lng: -0.1278,
    height: '200px',
  },
} satisfies Meta<typeof MapCard>

export default meta
type Story = StoryObj<typeof meta>

export const Exact: Story = { args: { variant: 'exact' } }
export const Approximate: Story = { args: { variant: 'approximate' } }
