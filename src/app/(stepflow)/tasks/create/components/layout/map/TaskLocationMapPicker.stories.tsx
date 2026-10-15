import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import {
  TaskLocationAreaHalo,
  TaskLocationCentrePin,
  TaskLocationMapPicker,
} from './TaskLocationMapPicker'

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

function TaskLocationMapPickerDemo({
  accessToken,
  showCoordinateHelpText = true,
}: {
  accessToken?: string
  showCoordinateHelpText?: boolean
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
      showCoordinateHelpText={showCoordinateHelpText}
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

/** Map with a search field, centre pin and area halo, plus the help text. */
export const Default: Story = {}

/** The parent supplies its own copy, so the help text under the map is off. */
export const WithoutHelpText: Story = {
  args: { showCoordinateHelpText: false },
}

/** No Mapbox token configured: a message replaces the map. */
export const MissingMapboxToken: Story = {
  args: { accessToken: undefined },
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
