import { TaskContactMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { getContactOptions } from '@/app/(dashboard)/profile/profileEligibility'
import { townOnly } from '@/utils/taskLocationDisplay'
import { StepFlowHeader, StepFlowProgress } from '@ui'
import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import {
  CREATE_TASK_STEP_COPY,
  createTaskProgressPercent,
  createTaskStepCaption,
} from '../../../helpers/createTaskSteps.config'
import { withPopularCategories } from '../../createTaskStoryFixtures'
import { CreateTaskBasicsSection } from '../../ui/sections/CreateTaskBasicsSection'
import { CreateTaskContactSection } from '../../ui/sections/CreateTaskContactSection'
import { CreateTaskLocationSection } from '../../ui/sections/CreateTaskLocationSection'
import { CreateTaskLocationMap } from '../map/CreateTaskLocationMap'
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
  /** Save/submit error shown above the step content. */
  errorText?: string
  /** Final step (contact and publish) with its Publish button loading. */
  publishing?: boolean
}

/** Location step ⇄ Basics: Continue collapses the map, Back expands it. */
function CreateTaskMapDemo({
  accessToken,
  expanded,
  place = '',
  lat = '',
  lng = '',
  locateUnavailable = false,
  errorText,
  publishing = false,
}: CreateTaskMapDemoProps) {
  const [mapExpanded, setMapExpanded] = useState(expanded)
  const [location, setLocation] = useState(place)
  const [locationLat, setLocationLat] = useState(lat)
  const [locationLng, setLocationLng] = useState(lng)
  const { register } = useForm<CreateTaskFormFieldValues>()
  const step = publishing
    ? 'publish.contact'
    : mapExpanded
      ? 'details.location'
      : 'details.basics'
  const copy = CREATE_TASK_STEP_COPY[step]

  return (
    <CreateTaskMapLayout
      header={
        <StepFlowHeader
          title="Post a task"
          exitHref="/search"
          closeLabel="Close task creation"
        />
      }
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
          completedSubSteps={
            new Set(
              publishing
                ? [
                    'details.location',
                    'details.basics',
                    'details.timing',
                    'publish.photos',
                    'publish.budget',
                  ]
                : mapExpanded
                  ? []
                  : ['details.location'],
            )
          }
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
      errorText={errorText}
      actions={{
        showBack: !mapExpanded,
        onBack: () => setMapExpanded(true),
        onContinue: () => setMapExpanded(false),
        ...(publishing
          ? {
              continueLabel: 'Publish task',
              continueLoading: true,
              isFinal: true,
            }
          : {}),
      }}
    >
      {publishing ? (
        <CreateTaskContactSection
          bare
          preferredContactMethod={TaskContactMethod.InApp}
          onPreferredContactMethodChange={() => {}}
          contactOptions={getContactOptions({
            emailVerified: true,
            phoneVerified: true,
          } as MeSnapshot)}
          acceptedProhibitedUse
          onAcceptedProhibitedUseChange={() => {}}
        />
      ) : mapExpanded ? (
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
  title: 'Create task/CreateTaskMapLayout',
  component: CreateTaskMapDemo,
  parameters: { layout: 'fullscreen' },
  decorators: [withPopularCategories()],
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

/** No Mapbox token configured: a message replaces the map behind the card. */
export const MissingMapboxToken: Story = {
  args: { accessToken: undefined },
}

/** Location step with a save error above the fields. */
export const FullScreenWithError: Story = {
  args: { errorText: 'Search or move the map to set your task area.' },
}

/** Later step with a save error above the fields. */
export const CollapsedWithError: Story = {
  args: {
    expanded: false,
    errorText: 'Some details are missing - check earlier steps.',
  },
}

/** Final step while publishing: the Publish button is loading. */
export const Publishing: Story = {
  args: { expanded: false, publishing: true },
}

/** Phones, location step: the card is a bottom sheet over the full-screen map. */
export const MobileFullScreen: Story = {
  globals: { viewport: { value: 'mobile1' } },
}

/** Phones, later step: the map band, the progress strip and the form. */
export const MobileCollapsed: Story = {
  args: { expanded: false },
  globals: { viewport: { value: 'mobile1' } },
}
