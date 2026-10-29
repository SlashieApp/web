import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import { MarketingFrame } from '@/app/(marketing)/components/layout/MarketingFrame'
import messages from '@/app/(marketing)/i11n.json'
import { formatMessage } from '@/i18n/loadPageI11n'

import { HeroSection } from '../hero/HeroSection'
import { LandingStory } from './LandingStory'
import { StoryTracker } from './StoryTracker'
import { setStoryStage } from './storyState'

const { hero, story, phone } = messages.en.landing
const { ctas } = messages.en.common

/**
 * Story-only: the page around the story, as `home/page.tsx` builds it but
 * without the WebGL scene: the fixed white page behind, the story above it in
 * the marketing frame (rails from `lg`), and the tracker that publishes the
 * active step.
 */
const withLandingPage: Decorator = (Story) => (
  <Box position="relative" isolation="isolate">
    <Box
      position="fixed"
      inset={0}
      zIndex={0}
      pointerEvents="none"
      bg="bg.surface"
      aria-hidden
    />
    <Box position="relative" zIndex={1}>
      <MarketingFrame>
        <Story />
      </MarketingFrame>
    </Box>
    <StoryTracker />
  </Box>
)

/** Story-only: the block that marks one step of the story in the page. */
function getStep(canvasElement: HTMLElement, stage: string): HTMLElement {
  const step = canvasElement.querySelector<HTMLElement>(
    `[data-story-stage="${stage}"]`,
  )
  if (!step) throw new Error(`Story step "${stage}" not found`)
  return step
}

const meta = {
  title: 'Marketing/Landing/LandingStory',
  component: LandingStory,
  parameters: { layout: 'fullscreen' },
  args: {
    hero: (
      <HeroSection copy={hero} ctas={{ seeHowItWorks: ctas.seeHowItWorks }} />
    ),
    story,
    phone,
  },
  decorators: [withLandingPage],
  // Each story starts at the hero, like a fresh page load.
  beforeEach: () => {
    setStoryStage('hero')
    return () => setStoryStage('hero')
  },
} satisfies Meta<typeof LandingStory>

export default meta
type Story = StoryObj<typeof meta>

/** Desktop (lg and up): steps on the left, one pinned phone that follows them. */
export const Desktop: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
}

/** Desktop, scrolled to the chat step: the pinned phone has moved on to the thread. */
export const DesktopChatStep: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    getStep(canvasElement, 'chat').scrollIntoView({ block: 'center' })
    // Only the pinned phone is exposed on desktop; the inline ones are hidden.
    const pinnedPhone = within(canvasElement).getByRole('figure', {
      name: phone.demoLabel,
    })
    await waitFor(
      () => {
        expect(
          within(pinnedPhone).getByText(phone.chat.flashTitle),
        ).toBeInTheDocument()
        expect(
          within(pinnedPhone).queryByText(phone.search.placeholder),
        ).toBeNull()
      },
      { timeout: 5000 },
    )
  },
}

/** Below lg (phone width): no pinned phone, each step carries its own inline phone. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Below lg, scrolled to the quotes step: its inline phone is in view and plays. */
export const PhoneQuotesStep: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    // Reduced motion skips the entrance, so there is nothing to wait for.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const inlinePhone = within(getStep(canvasElement, 'quotes')).getByRole(
      'figure',
      { name: phone.demoLabel },
    )
    // The first quote's wrapper carries the entrance opacity: hidden at rest.
    const firstQuote = within(inlinePhone).getByRole('button', {
      name: formatMessage(phone.quotes.expand, {
        name: phone.quotes.items[0].name,
      }),
    })
    const entrance = firstQuote.parentElement as HTMLElement
    await expect(entrance.style.opacity).toBe('0')
    inlinePhone.scrollIntoView({ block: 'center' })
    await waitFor(() => expect(entrance.style.opacity).toBe('1'), {
      timeout: 3000,
    })
  },
}
