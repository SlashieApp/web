import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import {
  createTaskStoryErrors,
  emptyCreateTaskValues,
} from '../../createTaskStoryFixtures'
import {
  CreateTaskMapLocationPanel,
  type CreateTaskMapLocationPanelProps,
} from './CreateTaskMapLocationPanel'

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

type DemoProps = Pick<
  CreateTaskMapLocationPanelProps,
  | 'bare'
  | 'sectionHeading'
  | 'publicArea'
  | 'streetAddressError'
  | 'locationError'
> & {
  mapboxAccessToken?: string
  place?: string
  lat?: string
  lng?: string
}

function CreateTaskMapLocationPanelDemo({
  mapboxAccessToken,
  place = '',
  lat = '',
  lng = '',
  ...props
}: DemoProps) {
  const { register, setValue } = useForm<CreateTaskFormFieldValues>({
    defaultValues: emptyCreateTaskValues,
  })
  const [mapPlaceName, setMapPlaceName] = useState(place)
  const [locationLat, setLocationLat] = useState(lat)
  const [locationLng, setLocationLng] = useState(lng)
  return (
    <CreateTaskMapLocationPanel
      {...props}
      mapboxAccessToken={mapboxAccessToken}
      mapPlaceName={mapPlaceName}
      onLocationChange={setMapPlaceName}
      locationLat={locationLat}
      onLocationLatChange={setLocationLat}
      locationLng={locationLng}
      onLocationLngChange={setLocationLng}
      register={register}
      onCopyMapPlaceToAddress={() => setValue('streetAddress', mapPlaceName)}
    />
  )
}

const meta = {
  title: 'Create task/CreateTaskMapLocationPanel',
  component: CreateTaskMapLocationPanelDemo,
  parameters: { layout: 'padded' },
  args: {
    bare: true,
    mapboxAccessToken: TOKEN,
    place: '12 Clarendon Road, Watford WD17 1JJ, United Kingdom',
    publicArea: 'Watford',
    lat: '51.656500',
    lng: '-0.390300',
  },
} satisfies Meta<typeof CreateTaskMapLocationPanelDemo>

export default meta
type Story = StoryObj<typeof meta>

/** Pin placed: the map, the public area and "Use pin address" enabled. */
export const Default: Story = {}

/** No pin yet: the area pill asks to move the map and the copy button is off. */
export const NoPinYet: Story = {
  args: { place: '', publicArea: '', lat: '', lng: '' },
}

/** Continue pressed without an address or a pin: both messages show. */
export const WithErrors: Story = {
  args: {
    streetAddressError: createTaskStoryErrors().streetAddress,
    locationError: createTaskStoryErrors().mapPlaceName,
  },
}

/** No Mapbox token configured: a message replaces the map. */
export const MissingMapboxToken: Story = {
  args: { mapboxAccessToken: undefined },
}

/** Card mode (edit page): the panel sits in a titled section card. */
export const CardMode: Story = {
  args: { bare: false },
}
