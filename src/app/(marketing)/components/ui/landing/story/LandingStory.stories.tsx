import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import {
  MarketingFrame,
  SectionRule,
} from '@/app/(marketing)/components/layout/MarketingFrame'
import messages from '@/app/(marketing)/i11n.json'
import { formatMessage } from '@/i18n/loadPageI11n'

import { HeroSection } from '../hero/HeroSection'
import { MapShowcase } from '../showcase/MapShowcase'
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

/**
 * Story-only: the map panel between its two section rules, as `home/page.tsx`
 * passes it to the story.
 */
const mapPanel = (
  <>
    <SectionRule />
    <MapShowcase copy={phone} />
    <SectionRule />
  </>
)

/** Whether `a` comes before `b` in the document. */
function isBefore(a: Element, b: Element): boolean {
  return Boolean(
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING,
  )
}

/** Desktop with the map panel: the hero, then the panel between rules, then the first step of the story. */
export const DesktopWithMapPanel: Story = {
  args: { showcase: mapPanel },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector('[data-map-showcase]')
    if (!panel) throw new Error('The map panel is missing')
    await expect(isBefore(getStep(canvasElement, 'hero'), panel)).toBe(true)
    await expect(isBefore(panel, getStep(canvasElement, 'post'))).toBe(true)
    // A rule on each side of the panel.
    await expect(panel.previousElementSibling).toHaveAttribute(
      'data-section-rule',
    )
    await expect(panel.nextElementSibling).toHaveAttribute('data-section-rule')
  },
}

/** Below lg with the map panel: the hero, the panel, then the inline phone and the steps. */
export const PhoneWithMapPanel: Story = {
  args: { showcase: mapPanel },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector('[data-map-showcase]')
    if (!panel) throw new Error('The map panel is missing')
    const [firstPhone] = within(canvasElement).getAllByRole('figure', {
      name: phone.demoLabel,
    })
    await expect(isBefore(panel, firstPhone)).toBe(true)
    await expect(isBefore(firstPhone, getStep(canvasElement, 'post'))).toBe(
      true,
    )
  },
}
