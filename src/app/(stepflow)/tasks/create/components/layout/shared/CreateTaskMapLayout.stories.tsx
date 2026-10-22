import { Box } from '@chakra-ui/react'
import { TaskContactMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { getContactOptions } from '@/app/(dashboard)/profile/profileEligibility'
import { townOnly } from '@/utils/taskLocationDisplay'
import { Button, StepFlowHeader, StepFlowProgress } from '@ui'
import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import { createTaskProgress } from '../../../helpers/createTaskSteps'
import type { LocationPanelState } from '../../../helpers/locationPanel'
import bag from '../../../i11n.json'
import {
  CREATE_TASK_PHONE_VIEWPORTS,
  withPopularCategories,
} from '../../createTaskStoryFixtures'
import { CreateTaskBasicsSection } from '../../ui/sections/CreateTaskBasicsSection'
import { CreateTaskConsentSection } from '../../ui/sections/CreateTaskConsentSection'
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
  /** Phones and tablets: how the location panel starts. */
  panel?: LocationPanelState
  /** The exact address typed so far. */
  streetAddress?: string
  /** A plain box in place of Mapbox, whose button moves "the map". */
  stubMap?: boolean
}

/** Stands in for Mapbox: its button calls what a map drag calls. */
function StoryMap({ onUserMove }: { onUserMove: () => void }) {
  return (
    <Box h="full" bg="bg.subtle" display="flex" justifyContent="center" pt={2}>
      <Button size="sm" variant="secondary" onClick={onUserMove}>
        Move the map
      </Button>
    </Box>
  )
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
  panel = 'compact',
  streetAddress = '',
  stubMap = false,
}: CreateTaskMapDemoProps) {
  const [mapExpanded, setMapExpanded] = useState(expanded)
  const [panelState, setPanelState] = useState(panel)
  const [location, setLocation] = useState(place)
  const [locationLat, setLocationLat] = useState(lat)
  const [locationLng, setLocationLng] = useState(lng)
  const { register, watch } = useForm<CreateTaskFormFieldValues>({
    defaultValues: { streetAddress },
  })
  const step = publishing ? 'review' : mapExpanded ? 'location' : 'details'
  const copy = bag.en.steps[step]
  const progress = createTaskProgress(step)
  const collapsePanel = () => setPanelState('compact')
  const locationProps = {
    publicArea: townOnly(location) ?? '',
    register,
    locateUnavailable,
    streetAddress: watch('streetAddress'),
    onAddAddress: () => setPanelState('expanded'),
  }

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
                ? (['location', 'details', 'timing', 'budget'] as const)
                : mapExpanded
                  ? []
                  : (['location'] as const),
            )
          }
          onSelect={(id) => setMapExpanded(id === 'location')}
        />
      }
      map={
        stubMap ? (
          <StoryMap onUserMove={collapsePanel} />
        ) : (
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
            onUserMove={collapsePanel}
          />
        )
      }
      mapExpanded={mapExpanded}
      panel={{
        state: panelState,
        onStateChange: setPanelState,
        compact: <CreateTaskLocationSection compact {...locationProps} />,
      }}
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
        <CreateTaskLocationSection {...locationProps} />
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

/** Drags the panel handle `dy` px (negative is up) in even moves `stepMs` apart. */
async function dragHandle(
  handle: HTMLElement,
  dy: number,
  { moves = 10, stepMs = 60 } = {},
) {
  const box = handle.getBoundingClientRect()
  const clientX = box.left + box.width / 2
  const startY = box.top + box.height / 2
  const fire = (type: string, clientY: number) =>
    handle.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: 'touch',
        isPrimary: true,
        button: type === 'pointermove' ? -1 : 0,
        clientX,
        clientY,
      }),
    )
  // Short gaps are busy-waited: a loaded machine would stretch a timer and
  // turn a flick into a slow pull.
  const pause = async () => {
    if (stepMs >= 20) {
      await new Promise((resolve) => setTimeout(resolve, stepMs))
      return
    }
    const until = performance.now() + stepMs
    while (performance.now() < until) {
      // Busy wait.
    }
  }
  fire('pointerdown', startY)
  for (let i = 1; i <= moves; i++) {
    await pause()
    fire('pointermove', startY + (dy * i) / moves)
  }
  fire('pointerup', startY + dy)
}

const showDetails = { name: 'Show address details' }
const hideDetails = { name: 'Hide address details' }

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

/** iPhone SE (1st gen), location step: the compact panel over the map. */
export const MobileFullScreen: Story = {
  globals: { viewport: { value: 'iphoneSe1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', showDetails)).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    await expect(
      canvas.getByRole('button', { name: 'Add exact address' }),
    ).toBeVisible()
    await expect(canvas.getByLabelText(/Exact address/)).not.toBeVisible()
  },
}

/** iPhone SE (1st gen), panel open: the full address form, map above. */
export const MobileFullScreenOpen: Story = {
  args: { panel: 'expanded' },
  globals: { viewport: { value: 'iphoneSe1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', hideDetails)).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(canvas.getByLabelText(/Exact address/)).toBeVisible()
  },
}

/** iPhone SE (2nd and 3rd gen), location step: the compact panel. */
export const PhoneCompact: Story = {
  globals: { viewport: { value: 'iphoneSe2' } },
}

/** iPhone SE (2nd and 3rd gen), panel open: privacy note, area, address. */
export const PhoneOpen: Story = {
  args: { panel: 'expanded' },
  globals: { viewport: { value: 'iphoneSe2' } },
}

/** Compact with an address: the row shows it, with a way to edit it. */
export const PhoneCompactWithAddress: Story = {
  args: { streetAddress: '12 QA Test Street' },
  globals: { viewport: { value: 'iphoneSe2' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('button', {
        name: 'Edit exact address: 12 QA Test Street',
      }),
    ).toBeVisible()
  },
}

/** Compact with a save error: it shows under the title. */
export const PhoneCompactWithError: Story = {
  args: { errorText: 'Search or move the map to set your task area.' },
  globals: { viewport: { value: 'iphoneSe2' } },
}

/** Tapping the handle opens and closes the panel, and says so. */
export const PhoneTapHandle: Story = {
  globals: { viewport: { value: 'iphoneSe2' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', showDetails))
    const handle = canvas.getByRole('button', hideDetails)
    await expect(handle).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByLabelText(/Exact address/)).toBeVisible()
    await expect(canvas.getByText('Address details shown.')).toBeInTheDocument()
    await userEvent.click(handle)
    await expect(handle).toHaveAttribute('aria-expanded', 'false')
    await expect(handle).toHaveAccessibleName('Show address details')
    await expect(
      canvas.getByText('Address details hidden.'),
    ).toBeInTheDocument()
  },
}

/** Dragging the handle: it snaps to the nearer state, and a flick carries. */
export const PhoneDragHandle: Story = {
  globals: { viewport: { value: 'iphoneSe2' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const handle = canvas.getByRole('button', showDetails)
    // A short, slow pull settles back.
    await dragHandle(handle, -30, { moves: 6, stepMs: 80 })
    await expect(handle).toHaveAttribute('aria-expanded', 'false')
    // Most of the way up, slowly: open.
    await dragHandle(handle, -260)
    await waitFor(() => expect(handle).toHaveAttribute('aria-expanded', 'true'))
    await expect(canvas.getByLabelText(/Exact address/)).toBeVisible()
    // Most of the way down, slowly: compact.
    await dragHandle(handle, 260)
    await waitFor(() =>
      expect(handle).toHaveAttribute('aria-expanded', 'false'),
    )
    // A quick flick up carries it open from a short pull.
    await dragHandle(handle, -60, { moves: 4, stepMs: 10 })
    await waitFor(() => expect(handle).toHaveAttribute('aria-expanded', 'true'))
  },
}

/** Moving the map while the panel is open lowers it to compact. */
export const PhoneMapMoveCollapses: Story = {
  args: { panel: 'expanded', stubMap: true },
  globals: { viewport: { value: 'iphoneSe2' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const handle = canvas.getByRole('button', hideDetails)
    await userEvent.click(canvas.getByRole('button', { name: 'Move the map' }))
    await expect(handle).toHaveAttribute('aria-expanded', 'false')
    await expect(
      canvas.getByRole('button', { name: 'Add exact address' }),
    ).toBeVisible()
    await expect(
      canvas.getByText('Address details hidden.'),
    ).toBeInTheDocument()
  },
}

/** Phones, later step: the map band, the progress strip and the form. */
export const MobileCollapsed: Story = {
  args: { expanded: false },
  globals: { viewport: { value: 'mobile1' } },
}
