import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import {
  TaskLocationAreaHalo,
  TaskLocationCentrePin,
  TaskLocationMapPicker,
  TaskLocationSearchBar,
} from './TaskLocationMapPicker'
import { taskLocationMapStyle } from './useTaskLocationMap'

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

function TaskLocationMapPickerDemo({
  accessToken,
  onLocateFailed,
}: {
  accessToken?: string
  onLocateFailed?: () => void
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
      onLocateFailed={onLocateFailed}
    />
  )
}

const meta = {
  title: 'Create task/TaskLocationMapPicker',
  component: TaskLocationMapPickerDemo,
  parameters: { layout: 'padded' },
  args: { accessToken: TOKEN, onLocateFailed: fn() },
} satisfies Meta<typeof TaskLocationMapPickerDemo>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The edit page's map, as create's (FE-356): the muted style, centre pin and
 * area halo, the floating search bar with locate-me; two fingers move it on
 * touch.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('textbox', { name: 'Search for your task location' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Use current location' }),
    ).toBeVisible()
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-map-style]')).toHaveAttribute(
        'data-map-style',
        taskLocationMapStyle('light'),
      ),
    )
  },
}

/** Location denied: locate-me says so, for the hint under the map. */
export const LocateDenied: Story = {
  beforeEach: () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (
          _found: PositionCallback,
          failed: PositionErrorCallback,
        ) => failed({ code: 1 } as GeolocationPositionError),
      },
    })
    return () => {
      Reflect.deleteProperty(navigator, 'geolocation')
    }
  },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Use current location',
      }),
    )
    await waitFor(() => expect(args.onLocateFailed).toHaveBeenCalledOnce())
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

/** The floating search bar both maps share: search, and locate-me at the end. */
export const SearchBar: Story = {
  render: () => (
    <Box p={4} bg="bg.subtle" borderRadius="lg">
      <TaskLocationSearchBar
        value="Watford"
        onChange={() => {}}
        onSearch={() => {}}
        onLocate={() => {}}
      />
    </Box>
  ),
}

/** The search bar while locate-me waits for the browser: the button spins. */
export const SearchBarLocating: Story = {
  render: () => (
    <Box p={4} bg="bg.subtle" borderRadius="lg">
      <TaskLocationSearchBar
        value=""
        onChange={() => {}}
        onSearch={() => {}}
        onLocate={() => {}}
        locating
      />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', {
        name: 'Use current location',
      }),
    ).toBeDisabled()
  },
}
