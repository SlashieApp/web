import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import {
  MarketingFrame,
  SectionRule,
} from '@/app/(marketing)/components/layout/MarketingFrame'
import messages from '@/app/(marketing)/i11n.json'
import { formatMessage } from '@/i18n/loadPageI11n'

import { BentoSection } from '../bento/BentoSection'
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

/**
 * Story-only: the block that marks one step of the story in the page. A step's
 * row (an `li`) wins over its act's head, which carries the first step's stage.
 */
function getStep(canvasElement: HTMLElement, stage: string): HTMLElement {
  const step =
    canvasElement.querySelector<HTMLElement>(
      `li[data-story-stage="${stage}"]`,
    ) ??
    canvasElement.querySelector<HTMLElement>(`[data-story-stage="${stage}"]`)
  if (!step) throw new Error(`Story step "${stage}" not found`)
  return step
}

/**
 * Story-only: the colour a semantic token resolves to, read off a probe
 * element, so the stories compare with the tokens and not with hex values.
 */
function tokenColor(host: HTMLElement, token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(--chakra-colors-${token.replace('.', '-')})`
  host.appendChild(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

/** Story-only: the section index, whose active link follows the tracker. */
function getIndex(canvasElement: HTMLElement): HTMLElement {
  return within(canvasElement).getByRole('navigation', {
    name: story.index.label,
  })
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

/**
 * Desktop (lg and up): the section index on the left, the steps as hairline
 * rows beside it and one pinned phone on the right that follows them.
 */
export const Desktop: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const index = getIndex(canvasElement)
    const firstStep = getStep(canvasElement, 'post')
    const phoneColumn = canvasElement.querySelector<HTMLElement>(
      '[data-phone-column]',
    )
    if (!phoneColumn) throw new Error('The phone column is missing')
    // Index, steps, phone: left to right.
    const indexRect = index.getBoundingClientRect()
    const stepRect = firstStep.getBoundingClientRect()
    const phoneRect = phoneColumn.getBoundingClientRect()
    await expect(indexRect.right).toBeLessThanOrEqual(stepRect.left)
    await expect(stepRect.right).toBeLessThanOrEqual(phoneRect.left)
    // The index and the phone both stick (plain CSS, no scroll script).
    await expect(getComputedStyle(index).position).toBe('sticky')
    const pinned = phoneColumn.firstElementChild as HTMLElement
    await expect(getComputedStyle(pinned).position).toBe('sticky')
    // The page has the one pinned phone; the inline ones are hidden.
    await expect(
      within(canvasElement).getAllByRole('figure', { name: phone.demoLabel }),
    ).toHaveLength(1)
  },
}

/**
 * Desktop: the steps are hairline rows. The number is Geist Mono 12 in
 * `text.subtle` (never green), the title 18/500 and the body 14 in
 * `text.muted`.
 */
export const DesktopHairlineRows: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const row = getStep(canvasElement, 'quotes')
    await expect(row.tagName).toBe('LI')
    const rowStyle = getComputedStyle(row)
    await expect(rowStyle.borderTopWidth).toBe('1px')
    await expect(rowStyle.borderTopColor).toBe(
      tokenColor(canvasElement, 'border.default'),
    )
    const title = within(row).getByRole('heading', {
      level: 3,
      name: story.customer.steps.quotes.title,
    })
    await expect(getComputedStyle(title).fontSize).toBe('18px')
    await expect(getComputedStyle(title).fontWeight).toBe('500')
    const body = within(row).getByText(story.customer.steps.quotes.body)
    await expect(getComputedStyle(body).fontSize).toBe('14px')
    await expect(getComputedStyle(body).color).toBe(
      tokenColor(canvasElement, 'text.muted'),
    )
    const number = within(row).getByText('02')
    const numberStyle = getComputedStyle(number)
    await expect(numberStyle.fontSize).toBe('12px')
    await expect(numberStyle.fontFamily).toContain('Geist Mono')
    await expect(numberStyle.color).toBe(
      tokenColor(canvasElement, 'text.subtle'),
    )
    // The act heads: eyebrow, then the heading, and the worker's below.
    await expect(
      within(canvasElement).getByRole('heading', {
        level: 2,
        name: story.worker.heading,
      }),
    ).toBeInTheDocument()
    await expect(
      within(canvasElement).getByText(story.customer.eyebrow),
    ).toBeInTheDocument()
  },
}

/** Desktop, scrolled to the chat step: the pinned phone has moved on to the thread, and so has the index. */
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
    // The index is driven by the same tracker: the chat step is the current one.
    const chat = within(getIndex(canvasElement)).getByRole('link', {
      name: story.index.chat,
    })
    await waitFor(() => expect(chat).toHaveAttribute('aria-current'), {
      timeout: 5000,
    })
    await expect(
      getIndex(canvasElement).querySelectorAll('[aria-current]'),
    ).toHaveLength(1)
    await expect(getComputedStyle(chat).color).toBe(
      tokenColor(canvasElement, 'text.default'),
    )
  },
}

/** Desktop, scrolled into the worker act: its first step is current and the phone shows the worker map. */
export const DesktopWorkerAct: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    getStep(canvasElement, 'workerQuote').scrollIntoView({ block: 'center' })
    const link = within(getIndex(canvasElement)).getByRole('link', {
      name: story.index.workerQuote,
    })
    await waitFor(() => expect(link).toHaveAttribute('aria-current'), {
      timeout: 5000,
    })
    const pinnedPhone = within(canvasElement).getByRole('figure', {
      name: phone.demoLabel,
    })
    await waitFor(
      () =>
        expect(
          within(pinnedPhone).getByText(phone.worker.header),
        ).toBeInTheDocument(),
      { timeout: 5000 },
    )
  },
}

/**
 * Below lg (phone width): no pinned phone, each step carries its own inline
 * phone, and the section index is a row that sticks under the header.
 */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const index = getIndex(canvasElement)
    await expect(getComputedStyle(index).position).toBe('sticky')
    // One inline phone per step, each inside its step's row.
    const phones = within(canvasElement).getAllByRole('figure', {
      name: phone.demoLabel,
    })
    await expect(phones).toHaveLength(8)
    for (const figure of phones) {
      await expect(figure.closest('li[data-story-stage]')).not.toBeNull()
    }
    // The index comes before the steps.
    const [firstPhone] = phones
    await expect(
      index.compareDocumentPosition(firstPhone as HTMLElement) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  },
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
 * Story-only: the map panel and the bento, each between section rules, as
 * `home/page.tsx` passes them to the story.
 */
const showcase = (
  <>
    <SectionRule />
    <MapShowcase copy={phone} />
    <SectionRule />
    <BentoSection steps={story.customer.steps} phone={phone} />
    <SectionRule />
  </>
)

/** Whether `a` comes before `b` in the document. */
function isBefore(a: Element, b: Element): boolean {
  return Boolean(
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING,
  )
}

/** Story-only: the map panel and the bento, which every showcase story needs. */
function getShowcase(canvasElement: HTMLElement): {
  panel: Element
  bento: Element
} {
  const panel = canvasElement.querySelector('[data-map-showcase]')
  const bento = canvasElement.querySelector('[data-bento]')
  if (!panel) throw new Error('The map panel is missing')
  if (!bento) throw new Error('The bento is missing')
  return { panel, bento }
}

/**
 * Desktop with the showcase: the hero, the map panel between rules, the bento
 * between rules, then the first step of the story.
 */
export const DesktopWithShowcase: Story = {
  args: { showcase },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { panel, bento } = getShowcase(canvasElement)
    await expect(isBefore(getStep(canvasElement, 'hero'), panel)).toBe(true)
    await expect(isBefore(panel, bento)).toBe(true)
    await expect(isBefore(bento, getStep(canvasElement, 'post'))).toBe(true)
    // A rule on each side of each: the map panel, then the bento, share the one between them.
    await expect(panel.previousElementSibling).toHaveAttribute(
      'data-section-rule',
    )
    await expect(panel.nextElementSibling).toHaveAttribute('data-section-rule')
    await expect(bento.previousElementSibling).toBe(panel.nextElementSibling)
    await expect(bento.nextElementSibling).toHaveAttribute('data-section-rule')
  },
}

/**
 * Below lg with the showcase: the hero, the panel, the bento, then how it
 * works: the index row, then the steps, each with its own inline phone.
 */
export const PhoneWithShowcase: Story = {
  args: { showcase },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { panel, bento } = getShowcase(canvasElement)
    const [firstPhone] = within(canvasElement).getAllByRole('figure', {
      name: phone.demoLabel,
    })
    await expect(isBefore(panel, bento)).toBe(true)
    await expect(isBefore(bento, getIndex(canvasElement))).toBe(true)
    await expect(
      isBefore(getIndex(canvasElement), getStep(canvasElement, 'post')),
    ).toBe(true)
    // The first inline phone is the first step's: nothing sits between the bento and the steps.
    await expect(getStep(canvasElement, 'post')).toContainElement(
      firstPhone as HTMLElement,
    )
  },
}
