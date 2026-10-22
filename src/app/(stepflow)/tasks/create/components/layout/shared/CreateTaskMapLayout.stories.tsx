import { TaskContactMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { expect, spyOn, within } from 'storybook/test'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { getContactOptions } from '@/app/(dashboard)/profile/profileEligibility'
import { townOnly } from '@/utils/taskLocationDisplay'
import { StepFlowHeader, StepFlowProgress } from '@ui'
import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import { createTaskProgress } from '../../../helpers/createTaskSteps'
import bag from '../../../i11n.json'
import {
  CREATE_TASK_PHONE_VIEWPORTS,
  withPopularCategories,
} from '../../createTaskStoryFixtures'
import { CreateTaskAddressSection } from '../../ui/sections/CreateTaskAddressSection'
import { CreateTaskConsentSection } from '../../ui/sections/CreateTaskConsentSection'
import { CreateTaskContactSection } from '../../ui/sections/CreateTaskContactSection'
import { CreateTaskLocationSection } from '../../ui/sections/CreateTaskLocationSection'
import { CreateTaskLocationMap } from '../map/CreateTaskLocationMap'
import { CreateTaskMapLayout } from './CreateTaskMapLayout'
import { CreateTaskStepper } from './CreateTaskStepper'

type CreateTaskMapDemoProps = {
  accessToken?: string
  /** Location step (full-screen map) vs the address step (map band). */
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

/** Location step ⇄ Address: Continue collapses the map, Back expands it. */
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
  const step = publishing ? 'review' : mapExpanded ? 'location' : 'address'
  const copy = bag.en.steps[step]
  const progress = createTaskProgress(step)

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
          value={progress.percent}
          label={`Step ${progress.index} of ${progress.total} · ${copy.label}`}
          trackLabel="Task creation progress"
        />
      }
      stepper={
        <CreateTaskStepper
          active={step}
          done={
            new Set(
              publishing
                ? ([
                    'location',
                    'address',
                    'details',
                    'timing',
                    'budget',
                  ] as const)
                : mapExpanded
                  ? []
                  : (['location'] as const),
            )
          }
          onSelect={(id) => setMapExpanded(id === 'location')}
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
              continueLabel: 'Post task',
              continueLoading: true,
              isFinal: true,
            }
          : {}),
      }}
    >
      {publishing ? (
        <>
          <CreateTaskContactSection
            bare
            preferredContactMethod={TaskContactMethod.InApp}
            onPreferredContactMethodChange={() => {}}
            contactOptions={getContactOptions({
              emailVerified: true,
              phoneVerified: true,
            } as MeSnapshot)}
          />
          <CreateTaskConsentSection accepted onChange={() => {}} />
        </>
      ) : mapExpanded ? (
        <CreateTaskLocationSection
          publicArea={townOnly(location) ?? ''}
          locateUnavailable={locateUnavailable}
        />
      ) : (
        <CreateTaskAddressSection
          register={register}
          pinAddress={location}
          onUsePinAddress={() => {}}
        />
      )}
    </CreateTaskMapLayout>
  )
}

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

const meta = {
  title: 'Create task/CreateTaskMapLayout',
  component: CreateTaskMapDemo,
  parameters: {
    layout: 'fullscreen',
    viewport: { options: CREATE_TASK_PHONE_VIEWPORTS },
  },
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

/** Step 1: full-screen map, centre pin, the short card floating on desktop. */
export const FullScreenLocation: Story = {}

/** The address step: the same map collapsed into the task-detail band. */
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

/** Location step with a save error above the area. */
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

/** iPhone SE (1st gen), location step: a short card, no address field. */
export const MobileFullScreen: Story = {
  globals: { viewport: { value: 'iphoneSe1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { name: 'Where is the task?' }),
    ).toBeVisible()
    await expect(canvas.getByText('Workers will see: Watford')).toBeVisible()
    await expect(canvas.getByRole('button', { name: /Continue/ })).toBeVisible()
    await expect(canvas.queryByLabelText(/Exact address/)).toBeNull()
  },
}

/** Phones, the address step: the map band, the progress strip and the form. */
export const MobileCollapsed: Story = {
  args: { expanded: false },
  globals: { viewport: { value: 'mobile1' } },
}

/**
 * Android browsers that shrink the window for the keyboard (Arc, in-app
 * browsers): while the address field has focus, a resize brings it back to
 * the middle of the screen, clear of the sticky Continue bar (FE-352).
 */
export const KeyboardResizeKeepsFieldInView: Story = {
  args: { expanded: false },
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const field = await within(canvasElement).findByLabelText(/exact address/i)
    const calls: unknown[] = []
    const spy = spyOn(field, 'scrollIntoView').mockImplementation((options) => {
      calls.push(options)
    })
    try {
      field.focus()
      window.dispatchEvent(new Event('resize'))
      await expect(calls).toContainEqual({ block: 'center' })
      field.blur()
      calls.length = 0
      window.dispatchEvent(new Event('resize'))
      await expect(calls).toHaveLength(0)
    } finally {
      spy.mockRestore()
    }
  },
}
