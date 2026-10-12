import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { CreateTaskLocationMap } from './CreateTaskLocationMap'

function CreateTaskLocationMapDemo({ collapsed }: { collapsed: boolean }) {
  const [location, setLocation] = useState('Watford, Hertfordshire')
  const [locationLat, setLocationLat] = useState('51.656500')
  const [locationLng, setLocationLng] = useState('-0.390300')

  return (
    <Box h={collapsed ? '300px' : '560px'}>
      <CreateTaskLocationMap
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        location={location}
        locationLat={locationLat}
        locationLng={locationLng}
        onLocationChange={setLocation}
        onLocationLatChange={setLocationLat}
        onLocationLngChange={setLocationLng}
        collapsed={collapsed}
        onLocate={() => {}}
      />
    </Box>
  )
}

const meta = {
  title: 'stepflow/tasks/create/layout/map/CreateTaskLocationMap',
  component: CreateTaskLocationMapDemo,
  parameters: { layout: 'fullscreen' },
  args: { collapsed: false },
} satisfies Meta<typeof CreateTaskLocationMapDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Collapsed: Story = { args: { collapsed: true } }
