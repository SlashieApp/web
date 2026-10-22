import { TaskContactMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { getContactOptions } from '@/app/(dashboard)/profile/profileEligibility'
import { townOnly } from '@/utils/taskLocationDisplay'
import { Button, StepFlowHeader, StepFlowProgress } from '@ui'
import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import { createTaskProgress } from '../../../helpers/createTaskSteps'
import bag from '../../../i11n.json'
import { type CreateTaskStepId, createTaskStep } from '../../../views'
import {
  CREATE_TASK_PHONE_VIEWPORTS,
  storyStepCard,
  storyVisibleMapHeight,
  withPopularCategories,
} from '../../createTaskStoryFixtures'
import { CreateTaskAddressSection } from '../../ui/sections/CreateTaskAddressSection'
import { CreateTaskBasicsSection } from '../../ui/sections/CreateTaskBasicsSection'
import { CreateTaskConsentSection } from '../../ui/sections/CreateTaskConsentSection'
import { CreateTaskContactSection } from '../../ui/sections/CreateTaskContactSection'
import { CreateTaskLocationSection } from '../../ui/sections/CreateTaskLocationSection'
import { CreateTaskLocationMap } from '../map/CreateTaskLocationMap'
import { CreateTaskMapLayout } from './CreateTaskMapLayout'
import { CreateTaskStepper } from './CreateTaskStepper'

/** The demo's steps: one per map mode, and the review for Post. */
const DEMO_STEPS = ['location', 'address', 'details', 'review'] as const
type DemoStep = (typeof DEMO_STEPS)[number]

const ORDER: CreateTaskStepId[] = [
  'location',
  'address',
  'details',
  'timing',
  'photos',
  'budget',
  'review',
]

type CreateTaskMapDemoProps = {
  accessToken?: string
  /** Where the demo opens; Continue and Back walk the demo's steps. */
  start: DemoStep
  place?: string
  lat?: string
  lng?: string
  locateUnavailable?: boolean
  /** Save/submit error shown above the step content. */
  errorText?: string
  /** The review step's Post task, loading. */
  publishing?: boolean
}

/**
 * Location (full-screen map) to the address (band) to details (the whole
 * screen on phones, the band on desktop) to the review.
 */
function CreateTaskMapDemo({
  accessToken,
  start,
  place = '',
  lat = '',
  lng = '',
  locateUnavailable = false,
  errorText,
  publishing = false,
}: CreateTaskMapDemoProps) {
  const [step, setStep] = useState<DemoStep>(start)
  const [location, setLocation] = useState(place)
  const [locationLat, setLocationLat] = useState(lat)
  const [locationLng, setLocationLng] = useState(lng)
  const [categories, setCategories] = useState<string[]>([])
  const { register } = useForm<CreateTaskFormFieldValues>()
  const copy = bag.en.steps[step]
  const progress = createTaskProgress(step)
  const view = createTaskStep(step)
  const move = (by: 1 | -1) =>
    setStep((now) => DEMO_STEPS[DEMO_STEPS.indexOf(now) + by] ?? now)

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
          done={new Set(ORDER.slice(0, ORDER.indexOf(step)))}
          onSelect={(id) => {
            if ((DEMO_STEPS as readonly string[]).includes(id)) {
              setStep(id as DemoStep)
            }
          }}
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
          collapsed={view.map !== 'full'}
        />
      }
      mapMode={view.map}
      bandOverlay={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          borderRadius="full"
          aria-label="Change the task location"
          onClick={() => setStep('location')}
        >
          {`Near ${townOnly(location) ?? 'Watford'} · Change`}
        </Button>
      }
      title={copy.title}
      description={copy.description}
      errorText={errorText}
      actions={{
        showBack: step !== 'location',
        onBack: () => move(-1),
        onContinue: () => move(1),
        ...(step === 'review'
          ? {
              continueLabel: 'Post task',
              continueLoading: publishing,
              isFinal: true,
            }
          : {}),
      }}
    >
      {step === 'location' ? (
        <CreateTaskLocationSection
          publicArea={townOnly(location) ?? ''}
          locateUnavailable={locateUnavailable}
        />
      ) : step === 'address' ? (
        <CreateTaskAddressSection
          register={register}
          pinAddress={location}
          onUsePinAddress={() => {}}
        />
      ) : step === 'details' ? (
        <CreateTaskBasicsSection
          bare
          register={register}
          categories={categories}
          onCategoriesChange={setCategories}
        />
      ) : (
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
    start: 'location',
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
export const Collapsed: Story = { args: { start: 'address' } }

/** Desktop, details onward: the band stays above the form, with its area chip. */
export const DesktopBandForm: Story = {
  args: { start: 'details' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'What needs doing?' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Change the task location' }),
    ).toBeVisible()
    await expect(await storyVisibleMapHeight(canvasElement)).toBeGreaterThan(90)
  },
}

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
    start: 'address',
    errorText: 'Some details are missing - check earlier steps.',
  },
}

/** Final step while publishing: the Publish button is loading. */
export const Publishing: Story = {
  args: { start: 'review', publishing: true },
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
  args: { start: 'address' },
  globals: { viewport: { value: 'mobile1' } },
}

/**
 * Phones, details onward (FE-355): one clean screen. The header and the
 * progress strip, then the step heading right under them, the fields and the
 * sticky Back and Continue; no band and no area chip.
 */
export const MobileFullScreenForm: Story = {
  args: { start: 'details' },
  globals: { viewport: { value: 'iphoneSe2' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'What needs doing?' }),
    ).toBeVisible()
    await expect(await storyVisibleMapHeight(canvasElement)).toBe(0)
    await expect(
      canvas.queryByRole('button', { name: 'Change the task location' }),
    ).toBeNull()
    await expect(canvas.getByRole('button', { name: 'Back' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: /Continue/ })).toBeVisible()
  },
}

/**
 * Phones: Continue on the address step slides the form up over the band
 * until it fills the screen; between full-screen steps only the content
 * changes; Back to the address step slides it down and the band opens again.
 */
export const MobileFormSlidesOverTheBand: Story = {
  args: { start: 'address' },
  globals: { viewport: { value: 'iphoneSe2' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: "What's the exact address?" })
    await expect(await storyVisibleMapHeight(canvasElement)).toBe(160)

    await userEvent.click(canvas.getByRole('button', { name: /Continue/ }))
    await canvas.findByRole('heading', { name: 'What needs doing?' })
    await expect(
      getComputedStyle(storyStepCard(canvasElement)).animationName,
    ).toBe('slide-from-bottom-full')
    await expect(await storyVisibleMapHeight(canvasElement)).toBe(0)
    await expect(
      canvas.queryByRole('button', { name: 'Change the task location' }),
    ).toBeNull()

    // Between full-screen steps only the content changes: no slide.
    await userEvent.click(canvas.getByRole('button', { name: /Continue/ }))
    await canvas.findByRole('heading', { name: 'Check and post' })
    await expect(
      storyStepCard(canvasElement, /Post task/).getAnimations(),
    ).toHaveLength(0)
    await userEvent.click(canvas.getByRole('button', { name: 'Back' }))
    await canvas.findByRole('heading', { name: 'What needs doing?' })
    await expect(storyStepCard(canvasElement).getAnimations()).toHaveLength(0)

    await userEvent.click(canvas.getByRole('button', { name: 'Back' }))
    await canvas.findByRole('heading', { name: "What's the exact address?" })
    await expect(await storyVisibleMapHeight(canvasElement)).toBe(160)
    await expect(
      canvas.getByRole('button', { name: 'Change the task location' }),
    ).toBeVisible()
  },
}

/**
 * Android browsers that shrink the window for the keyboard (Arc, in-app
 * browsers): while the address field has focus, a resize brings it back to
 * the middle of the screen, clear of the sticky Continue bar (FE-352).
 */
export const KeyboardResizeKeepsFieldInView: Story = {
  args: { start: 'address' },
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

/** The full-screen form keeps it: a focused title field comes back into view on resize. */
export const FullScreenFormKeepsFieldInView: Story = {
  args: { start: 'details' },
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const field = await within(canvasElement).findByLabelText(/Task title/)
    await waitFor(() =>
      expect(getComputedStyle(field).scrollMarginBottom).toBe('112px'),
    )
    const calls: unknown[] = []
    const spy = spyOn(field, 'scrollIntoView').mockImplementation((options) => {
      calls.push(options)
    })
    try {
      field.focus()
      window.visualViewport?.dispatchEvent(new Event('resize'))
      window.dispatchEvent(new Event('resize'))
      await expect(calls).toContainEqual({ block: 'center' })
    } finally {
      field.blur()
      spy.mockRestore()
    }
  },
}
