import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { LocationMap } from './LocationMap'

const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
const coords = { lat: 51.5074, lng: -0.1278 }

const meta = {
  title: 'task/MetaSection/LocationMap',
  component: LocationMap,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box maxW="400px" w="full">
      <LocationMap {...args} />
    </Box>
  ),
} satisfies Meta<typeof LocationMap>

export default meta

type Story = StoryObj<typeof meta>

export const ApproximateArea: Story = {
  args: {
    accessToken: token,
    ...coords,
    height: '160px',
    variant: 'approximate',
  },
}

export const ExactWithOpenInMaps: Story = {
  args: {
    accessToken: token,
    ...coords,
    height: '160px',
    variant: 'exact',
  },
}

export const Unavailable: Story = {
  args: {
    accessToken: undefined,
    ...coords,
    height: '160px',
    variant: 'approximate',
  },
}
