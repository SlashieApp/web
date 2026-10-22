import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { CreateTaskLocationMap } from './CreateTaskLocationMap'
import { taskLocationMapStyle } from './useTaskLocationMap'

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

function CreateTaskLocationMapDemo({
  collapsed,
  accessToken,
  onLocateFailed,
}: {
  collapsed: boolean
  accessToken?: string
  onLocateFailed?: () => void
}) {
  const [location, setLocation] = useState('Watford, Hertfordshire')
  const [locationLat, setLocationLat] = useState('51.656500')
  const [locationLng, setLocationLng] = useState('-0.390300')

  return (
    <Box h={collapsed ? '300px' : '560px'}>
      <CreateTaskLocationMap
        accessToken={accessToken}
        location={location}
        locationLat={locationLat}
        locationLng={locationLng}
        onLocationChange={setLocation}
        onLocationLatChange={setLocationLat}
        onLocationLngChange={setLocationLng}
        collapsed={collapsed}
        onLocateFailed={onLocateFailed}
      />
    </Box>
  )
}

/** The browser's location answers with `answer`, or never; the real one comes back after. */
function geolocation(answer: 'never' | 'denied') {
  return () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (
          _found: PositionCallback,
          failed: PositionErrorCallback,
        ) => {
          if (answer === 'denied') {
            failed({ code: 1 } as GeolocationPositionError)
          }
        },
      },
    })
    return () => {
      Reflect.deleteProperty(navigator, 'geolocation')
    }
  }
}

const meta = {
  title: 'Create task/CreateTaskLocationMap',
  component: CreateTaskLocationMapDemo,
  parameters: { layout: 'fullscreen' },
  args: { collapsed: false, accessToken: TOKEN, onLocateFailed: fn() },
} satisfies Meta<typeof CreateTaskLocationMapDemo>

export default meta
type Story = StoryObj<typeof meta>

/** Location step: interactive map with the search field and a centre pin. */
export const Default: Story = {}

/** The muted `/search` style, shared with Edit task's map (FE-356). */
export const SharedStyle: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-map-style]')).toHaveAttribute(
        'data-map-style',
        taskLocationMapStyle('light'),
      ),
    )
  },
}

/** Later steps: a non-interactive band that fades into the form. */
export const Collapsed: Story = { args: { collapsed: true } }

/** Locate-me pressed: the button spins until the browser answers. */
export const Locating: Story = {
  beforeEach: geolocation('never'),
  play: async ({ canvasElement }) => {
    const locate = within(canvasElement).getByRole('button', {
      name: 'Use current location',
    })
    await userEvent.click(locate)
    await waitFor(() => expect(locate).toHaveAttribute('data-loading'))
  },
}

/** Location denied: locate-me says so, for the step's hint. */
export const LocateDenied: Story = {
  beforeEach: geolocation('denied'),
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Use current location',
      }),
    )
    await waitFor(() => expect(args.onLocateFailed).toHaveBeenCalledOnce())
  },
}

/** No Mapbox token configured: a message replaces the map. */
export const MissingMapboxToken: Story = {
  args: { accessToken: undefined },
}

/** Phones: the zoom buttons drop below the floating search field. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1' } },
}
