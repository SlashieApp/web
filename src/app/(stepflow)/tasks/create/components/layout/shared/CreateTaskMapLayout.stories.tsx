import { townOnly } from '@/utils/taskLocationDisplay'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { StepFlowProgress } from '@ui'
import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import {
  CREATE_TASK_STEP_COPY,
  createTaskProgressPercent,
  createTaskStepCaption,
} from '../../../helpers/createTaskSteps.config'
import { CreateTaskBasicsSection } from '../../ui/sections/CreateTaskBasicsSection'
import { CreateTaskLocationSection } from '../../ui/sections/CreateTaskLocationSection'
import { CreateTaskLocationMap } from '../map/CreateTaskLocationMap'
import { CreateTaskHeader } from './CreateTaskHeader'
import { CreateTaskMapLayout } from './CreateTaskMapLayout'
import { CreateTaskStepper } from './CreateTaskStepper'

type CreateTaskMapDemoProps = {
  accessToken?: string
  /** Location step (full-screen map) vs a later step (map band). */
  expanded: boolean
  place?: string
  lat?: string
  lng?: string
  locateUnavailable?: boolean
}

/** Location step ⇄ Basics: Continue collapses the map, Back expands it. */
function CreateTaskMapDemo({
  accessToken,
  expanded,
  place = '',
  lat = '',
  lng = '',
  locateUnavailable = false,
}: CreateTaskMapDemoProps) {
  const [mapExpanded, setMapExpanded] = useState(expanded)
  const [location, setLocation] = useState(place)
  const [locationLat, setLocationLat] = useState(lat)
  const [locationLng, setLocationLng] = useState(lng)
  const { register } = useForm<CreateTaskFormFieldValues>()
  const step = mapExpanded ? 'details.location' : 'details.basics'
  const copy = CREATE_TASK_STEP_COPY[step]

  return (
    <CreateTaskMapLayout
      header={<CreateTaskHeader />}
      progress={
        <StepFlowProgress
          value={createTaskProgressPercent(step)}
          label={createTaskStepCaption(step)}
          trackLabel="Task creation progress"
        />
      }
      stepper={
        <CreateTaskStepper
          activeSubStep={step}
          completedSubSteps={new Set(mapExpanded ? [] : ['details.location'])}
          onSelectSubStep={(id) => setMapExpanded(id === 'details.location')}
        />
      }
      map={
        <CreateTaskLocationMap
          accessToken={accessToken}
          location={location}
          locationLat={locationLat}
          locationLng={locationLng}
          onLocationChange={setLocation}
          onLocationLatChange={setLocationLat}
          onLocationLngChange={setLocationLng}
          collapsed={!mapExpanded}
          onLocate={() => {}}
        />
      }
      mapExpanded={mapExpanded}
      title={copy.title}
      description={copy.description}
      actions={{
        showBack: !mapExpanded,
        onBack: () => setMapExpanded(true),
        onContinue: () => setMapExpanded(false),
      }}
    >
      {mapExpanded ? (
        <CreateTaskLocationSection
          publicArea={townOnly(location) ?? ''}
          register={register}
          locateUnavailable={locateUnavailable}
        />
      ) : (
        <CreateTaskBasicsSection
          bare
          register={register}
          categories={['Plumbing']}
          onCategoriesChange={() => {}}
        />
      )}
    </CreateTaskMapLayout>
  )
}

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

const meta = {
  title: 'stepflow/tasks/create/layout/shared/CreateTaskMapLayout',
  component: CreateTaskMapDemo,
  parameters: { layout: 'fullscreen' },
  args: {
    accessToken: TOKEN,
    expanded: true,
    place: 'Watford, Hertfordshire, England, United Kingdom',
    lat: '51.656500',
    lng: '-0.390300',
  },
} satisfies Meta<typeof CreateTaskMapDemo>

export default meta
type Story = StoryObj<typeof meta>

/** Step 1: full-screen map, centre pin, bottom card. */
export const FullScreenLocation: Story = {}

/** Later step: the same map collapsed into the task-detail band. */
export const Collapsed: Story = { args: { expanded: false } }

/** Opened from `/search`: starts on the search map centre with its label. */
export const SearchStart: Story = {
  args: {
    place: 'Camden Town, London, England, United Kingdom',
    lat: '51.539000',
    lng: '-0.142600',
  },
}

/** No `/search` centre or location yet: London camera, no chosen pin. */
export const LondonFallback: Story = {
  args: { place: '', lat: '', lng: '' },
}

/** Location denied or unavailable: London, plus a search/drag hint. */
export const GeolocationDenied: Story = {
  args: { place: '', lat: '', lng: '', locateUnavailable: true },
}

export const MissingMapboxToken: Story = {
  args: { accessToken: undefined },
}
