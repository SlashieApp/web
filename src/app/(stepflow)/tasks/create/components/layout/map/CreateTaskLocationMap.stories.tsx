import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { CreateTaskLocationMap } from './CreateTaskLocationMap'

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

function CreateTaskLocationMapDemo({
  collapsed,
  locating = false,
  accessToken,
}: {
  collapsed: boolean
  locating?: boolean
  accessToken?: string
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
        locating={locating}
        onLocate={() => {}}
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
