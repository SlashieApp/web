import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@ui'

import { CreateTaskLocationMap } from './CreateTaskLocationMap'

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

function CreateTaskLocationMapDemo({
  collapsed,
  locating = false,
  accessToken,
  onUserMove,
}: {
  collapsed: boolean
  locating?: boolean
  accessToken?: string
  /** Also shows a button that moves the camera the way a search does. */
  onUserMove?: () => void
}) {
  const [location, setLocation] = useState('Watford, Hertfordshire')
  const [locationLat, setLocationLat] = useState('51.656500')
  const [locationLng, setLocationLng] = useState('-0.390300')

  return (
    <Box h={collapsed ? '300px' : '560px'} position="relative">
      {onUserMove ? (
        // Story-only: a camera move the poster didn't make.
        <Button
          position="absolute"
          bottom={10}
          left={3}
          zIndex={5}
          size="sm"
          variant="secondary"
          onClick={() => {
            setLocationLat('51.539000')
            setLocationLng('-0.142600')
          }}
        >
          Jump to Camden
        </Button>
      ) : null}
      <CreateTaskLocationMap
        accessToken={accessToken}
        location={location}
        locationLat={locationLat}
        locationLng={locationLng}
        onLocationChange={setLocation}
        onLocationLatChange={setLocationLat}
        onLocationLngChange={setLocationLng}
        collapsed={collapsed}
        locating={locating}
        onLocate={() => {}}
        onUserMove={onUserMove}
      />
    </Box>
  )
}

const meta = {
  title: 'Create task/CreateTaskLocationMap',
  component: CreateTaskLocationMapDemo,
  parameters: { layout: 'fullscreen' },
  args: { collapsed: false, accessToken: TOKEN },
} satisfies Meta<typeof CreateTaskLocationMapDemo>

export default meta
type Story = StoryObj<typeof meta>

/** Location step: interactive map with the search field and a centre pin. */
export const Default: Story = {}

/** Later steps: a non-interactive band that fades into the form. */
export const Collapsed: Story = { args: { collapsed: true } }

/** Locate-me pressed: the locate button shows its loading state. */
export const Locating: Story = { args: { locating: true } }

/** No Mapbox token configured: a message replaces the map. */
export const MissingMapboxToken: Story = {
  args: { accessToken: undefined },
}

/** Phones: the zoom buttons drop below the floating search field. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1' } },
}

/** Dragging the map counts as the poster moving it; a jump to new coordinates doesn't. */
export const UserMove: Story = {
  args: { onUserMove: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    // Mapbox loads on demand; a cold start can take a few seconds.
    const map = await waitFor(
      () => {
        const el = canvasElement.querySelector<HTMLElement>('.mapboxgl-canvas')
        if (!el) throw new Error('Map not created yet')
        return el
      },
      { timeout: 10_000 },
    )
    await userEvent.click(
      canvas.getByRole('button', { name: 'Jump to Camden' }),
    )
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await expect(args.onUserMove).not.toHaveBeenCalled()
    const box = map.getBoundingClientRect()
    const at = (dx: number) => ({
      clientX: box.left + box.width / 2 + dx,
      clientY: box.top + box.height / 2 + dx,
    })
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: map, coords: at(0) },
      { coords: at(30) },
      { coords: at(60) },
      { keys: '[/MouseLeft]' },
    ])
    await waitFor(() => expect(args.onUserMove).toHaveBeenCalled())
  },
}
