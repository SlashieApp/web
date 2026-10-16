import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, within } from 'storybook/test'

import {
  TaskLocationAreaHalo,
  TaskLocationCentrePin,
  TaskLocationMapPicker,
} from './TaskLocationMapPicker'

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

function TaskLocationMapPickerDemo({
  accessToken,
}: {
  accessToken?: string
}) {
  const [location, setLocation] = useState('Watford, Hertfordshire')
  const [locationLat, setLocationLat] = useState('51.656500')
  const [locationLng, setLocationLng] = useState('-0.390300')

  return (
    <TaskLocationMapPicker
      accessToken={accessToken}
      location={location}
      locationLat={locationLat}
      locationLng={locationLng}
      onLocationChange={setLocation}
      onLocationLatChange={setLocationLat}
      onLocationLngChange={setLocationLng}
    />
  )
}

const meta = {
  title: 'Create task/TaskLocationMapPicker',
  component: TaskLocationMapPickerDemo,
  parameters: { layout: 'padded' },
  args: { accessToken: TOKEN },
} satisfies Meta<typeof TaskLocationMapPickerDemo>

export default meta
type Story = StoryObj<typeof meta>

/** The edit page's map: search, centre pin and area halo; two fingers move it on touch. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('textbox', {
        name: 'Search for your task location',
      }),
    ).toBeVisible()
  },
}

/** No Mapbox token configured: plain copy replaces the map. */
export const MissingMapboxToken: Story = {
  args: { accessToken: undefined },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText(
        "The map isn't available right now. Type the address instead.",
      ),
    ).toBeVisible()
  },
}

/** Map overlay: the dashed circle that stands for the approximate area. */
export const AreaHalo: Story = {
  render: () => (
    <Box position="relative" h="200px" bg="bg.subtle" borderRadius="lg">
      <TaskLocationAreaHalo />
    </Box>
  ),
}

/** Map overlay: the fixed centre pin, whose tip marks the map centre. */
export const CentrePin: Story = {
  render: () => (
    <Box position="relative" h="200px" bg="bg.subtle" borderRadius="lg">
      <TaskLocationCentrePin />
    </Box>
  ),
}
