import { Box, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useEffect } from 'react'
import { expect, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'
import { formatMessage } from '@/i18n/loadPageI11n'

import {
  STORY_STAGES,
  type StoryStage,
  setStoryStage,
} from '../story/storyState'
import { PhoneScreen, StepPhone, StickyPhone, phoneLabel } from './PhoneDemo'
import { PHONE_CROP_H, PhoneFrame } from './PhoneFrame'

const copy = messages.en.landing.phone
const { index } = messages.en.landing.story

function DemoPhone({ stage, width }: { stage: StoryStage; width: number }) {
  return (
    <Box p={8} bg="bg.surface" display="inline-block">
      <PhoneFrame label={copy.demoLabel} nominalWidth={width} w={`${width}px`}>
        <PhoneScreen stage={stage} copy={copy} active intro={false} />
      </PhoneFrame>
    </Box>
  )
}

/** Story-only: the desktop pinned phone, driven by the story stage store. */
function PinnedPhone({ stage }: { stage: StoryStage }) {
  useEffect(() => {
    setStoryStage(stage)
  }, [stage])
  // Leave the store as the page starts, so other stories begin at the hero.
  useEffect(() => () => setStoryStage('hero'), [])
  return (
    <Box p={8} bg="bg.surface" display="inline-block">
      <StickyPhone copy={copy} index={index} />
    </Box>
  )
}

/** Story-only: accessible name of the worker map's tappable pin. */
const workerPinLabel = formatMessage(copy.search.selectPin, {
  price: copy.tasks.wardrobe.price,
})

const meta = {
  title: 'Marketing/Landing/PhoneDemo',
  component: DemoPhone,
  args: { stage: 'hero', width: 300 },
  argTypes: {
    stage: { control: 'select', options: STORY_STAGES.slice(0, 9) },
  },
} satisfies Meta<typeof DemoPhone>

export default meta
type Story = StoryObj<typeof meta>

/** Map search with price pins; the second pin is the tap beat. */
export const Search: Story = {}

/** Create task: the title types itself, a pin drops, then "Post task" posts it. */
export const PostTask: Story = { args: { stage: 'post' } }

/** Task detail, Quotes tab: three quotes arrive and the first opens on a tap. */
export const Quotes: Story = { args: { stage: 'quotes' } }

/** Hire sheet over the task: accepting the quote confirms the booking. */
export const Hire: Story = { args: { stage: 'hire' } }

/** Task thread: it opens on "Quote accepted", then a short chat; sending adds a message and a reply. */
export const Chat: Story = { args: { stage: 'chat' } }

/** Review prompt: rating the stars types the review and thanks the customer. */
export const Review: Story = { args: { stage: 'review' } }

/** Worker map search: the same map, with "Send quote" on the task card. */
export const WorkerSearch: Story = { args: { stage: 'workerFind' } }

/** Worker quote form: a price, a short message and "Send quote". */
export const WorkerQuote: Story = { args: { stage: 'workerQuote' } }

/** Worker profile: rating, jobs, skills and reviews; "See all reviews" lists them. */
export const Profile: Story = { args: { stage: 'workerProfile' } }

/** Desktop pinned phone on the hero stage: it shows the customer map search, under the demo's plain name (the hero is no step). */
export const StickyPhoneHero: Story = {
  argTypes: { width: { table: { disable: true } } },
  render: ({ stage }) => <PinnedPhone stage={stage} />,
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('figure', {
        name: copy.demoLabel,
      }),
    ).toBeInTheDocument()
  },
}

/** Desktop pinned phone in the worker act: it has crossfaded to the quote form, and is named by that step. */
export const StickyPhoneWorkerAct: Story = {
  args: { stage: 'workerQuote' },
  argTypes: { width: { table: { disable: true } } },
  render: ({ stage }) => <PinnedPhone stage={stage} />,
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('figure', {
        name: `${copy.demoLabel}: ${index.workerQuote}`,
      }),
    ).toBeInTheDocument()
  },
}

/** Desktop pinned phone as the story moves on: the old screen slides out, the next in. */
export const StickyPhoneStageChange: Story = {
  parameters: { controls: { disable: true } },
  render: () => <PinnedPhone stage="hero" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText(copy.search.placeholder),
    ).toBeInTheDocument()
    setStoryStage('post')
    // Both screens show during the crossfade; the old one leaves afterwards.
    await waitFor(
      () => expect(canvas.queryByText(copy.search.placeholder)).toBeNull(),
      { timeout: 5000 },
    )
    await expect(await canvas.findByText(copy.post.header)).toBeInTheDocument()
  },
}

/**
 * Inline phone below `lg`, on screen: the top of a phone in a 340px well,
 * named by its step, playing right away.
 */
export const StepPhoneInView: Story = {
  args: { stage: 'post' },
  argTypes: { width: { table: { disable: true } } },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: ({ stage }) => (
    <Box p={4} bg="bg.surface">
      <StepPhone
        stage={stage}
        copy={copy}
        label={phoneLabel(copy, index, stage)}
      />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const well = await within(canvasElement).findByRole('figure', {
      name: `${copy.demoLabel}: ${index.post}`,
    })
    await expect(Math.round(well.getBoundingClientRect().height)).toBe(
      PHONE_CROP_H,
    )
  },
}

/** Inline phone below `lg`, off screen: it rests until it is a third in view. */
export const StepPhoneBelowTheFold: Story = {
  parameters: { controls: { disable: true } },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: () => (
    <Box bg="bg.surface">
      <Box h="120vh" p={4}>
        <Text color="text.muted" fontSize="sm">
          Scroll down: the phone plays once a third of it is on screen.
        </Text>
      </Box>
      <Box p={4}>
        <StepPhone
          stage="workerFind"
          copy={copy}
          label={phoneLabel(copy, index, 'workerFind')}
        />
      </Box>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    // Reduced motion skips the entrance, so there is nothing to wait for.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = within(canvasElement)
    // The pin's wrapper carries the entrance opacity: hidden while resting.
    const pin = await canvas.findByRole('button', { name: workerPinLabel })
    const entrance = pin.parentElement as HTMLElement
    await expect(entrance.style.opacity).toBe('0')
    pin.scrollIntoView({ block: 'center' })
    await waitFor(() => expect(entrance.style.opacity).toBe('1'), {
      timeout: 3000,
    })
  },
}
