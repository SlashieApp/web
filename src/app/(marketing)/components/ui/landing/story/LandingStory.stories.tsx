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
import { PHONE_CROP_H } from '../phone/PhoneFrame'
import { MapShowcase } from '../showcase/MapShowcase'
import { LandingStory } from './LandingStory'
import { StoryTracker } from './StoryTracker'
import { setStoryStage } from './storyState'
import { CUSTOMER_STAGES, WORKER_STAGES } from './storySteps'

const { hero, story, phone } = messages.en.landing
const { ctas } = messages.en.common

/** Story-only: any demo phone, whatever step it is named by. */
const anyDemoPhone = new RegExp(`^${phone.demoLabel}`)

/** Story-only: the name of the demo phone showing `step`. */
function demoPhoneName(step: keyof typeof story.index): string {
  return formatMessage(phone.demoStepLabel, { step: story.index[step] })
}

/**
 * Story-only: the page around the story, as `home/page.tsx` builds it but
 * without the WebGL scene: the fixed white page behind, the story above it in
 * the marketing frame (rails from `lg`), a screen of space for the sections
 * under it (so its last steps can come to rest where a link lands them), and
 * the tracker that publishes the active step.
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
        <Box h="100vh" aria-hidden />
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
      within(canvasElement).getAllByRole('figure', { name: anyDemoPhone }),
    ).toHaveLength(1)
    // Every ordered list here (the index and the two acts' steps) has
    // `list-style: none`, which drops the list in Safari with VoiceOver, so each
    // states its role.
    const lists = [...canvasElement.querySelectorAll('ol')]
    await expect(lists).toHaveLength(3)
    for (const list of lists) await expect(list).toHaveAttribute('role', 'list')
  },
}

/**
 * Desktop: the steps are hairline rows, 240px tall with 72px under their
 * text. The number is Geist Mono 12 in `text.subtle` (never green), the title
 * 18/500 and the body 14 in `text.muted`.
 */
export const DesktopHairlineRows: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const row = getStep(canvasElement, 'quotes')
    await expect(row.tagName).toBe('LI')
    const rowStyle = getComputedStyle(row)
    await expect(Math.round(row.getBoundingClientRect().height)).toBe(240)
    await expect(rowStyle.paddingBottom).toBe('72px')
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

/**
 * Desktop, scrolled to the chat step (the one after Hire): the pinned phone
 * has moved on to the thread, which opens on the accepted quote, it is named
 * by the step, and the index has moved with it.
 */
export const DesktopChatStep: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    // As the index's link lands it: the row's top just above mid-screen.
    getStep(canvasElement, 'chat').scrollIntoView()
    // Only the pinned phone is exposed on desktop; the inline ones are hidden.
    const pinnedPhone = within(canvasElement).getByRole('figure', {
      name: anyDemoPhone,
    })
    await waitFor(
      () => {
        expect(
          within(pinnedPhone).getByText(phone.chat.acceptedBody),
        ).toBeInTheDocument()
        expect(
          within(pinnedPhone).queryByText(phone.search.placeholder),
        ).toBeNull()
      },
      { timeout: 5000 },
    )
    await expect(pinnedPhone).toHaveAccessibleName(demoPhoneName('chat'))
    // The step says people message once a quote is accepted, and follows Hire.
    const chatRow = getStep(canvasElement, 'chat')
    await expect(
      within(chatRow).getByRole('heading', {
        level: 3,
        name: story.customer.steps.chat.title,
      }),
    ).toBeInTheDocument()
    await expect(chatRow.previousElementSibling).toBe(
      getStep(canvasElement, 'hire'),
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

/** Desktop, scrolled into the worker act: its quote step is current and the phone shows the quote form. */
export const DesktopWorkerAct: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    // As the index's link lands it: the row's top just above mid-screen.
    getStep(canvasElement, 'workerQuote').scrollIntoView()
    const link = within(getIndex(canvasElement)).getByRole('link', {
      name: story.index.workerQuote,
    })
    await waitFor(() => expect(link).toHaveAttribute('aria-current'), {
      timeout: 5000,
    })
    const pinnedPhone = within(canvasElement).getByRole('figure', {
      name: anyDemoPhone,
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
 * Desktop, scrolled to the last step: the story runs on under its last row, so
 * the phone is still pinned mid-screen, not pushed up by the end of its column.
 */
export const DesktopLastStep: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    // As the index's link lands it: the row's top just above mid-screen.
    getStep(canvasElement, 'workerProfile').scrollIntoView()
    const pinnedPhone = within(canvasElement).getByRole('figure', {
      name: anyDemoPhone,
    })
    await waitFor(
      () =>
        expect(pinnedPhone).toHaveAccessibleName(
          demoPhoneName('workerProfile'),
        ),
      { timeout: 5000 },
    )
    // Centred: as much of the screen above the phone as below it.
    const { top, bottom } = pinnedPhone.getBoundingClientRect()
    await expect(
      Math.abs(top - (window.innerHeight - bottom)),
    ).toBeLessThanOrEqual(1)
  },
}

/**
 * Below lg (phone width): no pinned phone, each step carries its own inline
 * phone (the top of a phone in a 340px well, named by its step), and the
 * section index is a row that sticks under the header.
 */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const index = getIndex(canvasElement)
    await expect(getComputedStyle(index).position).toBe('sticky')
    // One inline phone per step, each inside its step's row.
    const phones = within(canvasElement).getAllByRole('figure', {
      name: anyDemoPhone,
    })
    await expect(phones).toHaveLength(8)
    for (const figure of phones) {
      await expect(figure.closest('li[data-story-stage]')).not.toBeNull()
      await expect(Math.round(figure.getBoundingClientRect().height)).toBe(
        PHONE_CROP_H,
      )
    }
    // Each is named by its step, in the story's order: chat follows hire.
    await expect(
      phones.map((figure) => figure.getAttribute('aria-label')),
    ).toEqual([...CUSTOMER_STAGES, ...WORKER_STAGES].map(demoPhoneName))
    await expect(CUSTOMER_STAGES.indexOf('chat')).toBe(
      CUSTOMER_STAGES.indexOf('hire') + 1,
    )
    // The index comes before the steps.
    const [firstPhone] = phones
    await expect(
      index.compareDocumentPosition(firstPhone as HTMLElement) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  },
}

/**
 * Below lg the index is a row right above the first act's head: the head keeps
 * 32px under the row's closing hairline, like every other head has room, rather
 * than touching it.
 */
async function expectRoomUnderTheIndex(canvasElement: HTMLElement) {
  const index = getIndex(canvasElement).getBoundingClientRect()
  const eyebrow = within(canvasElement).getByText(story.customer.eyebrow)
  const gap = eyebrow.getBoundingClientRect().top - index.bottom
  await expect(gap).toBeGreaterThanOrEqual(32)
}

/** Phone width: the first act's head has room under the index row. */
export const PhoneRoomUnderTheIndex: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: ({ canvasElement }) => expectRoomUnderTheIndex(canvasElement),
}

/** Tablet width (below lg): the same room, where the row used to sit 9px above the head. */
export const TabletRoomUnderTheIndex: Story = {
  globals: { viewport: { value: 'tablet', isRotated: false } },
  play: ({ canvasElement }) => expectRoomUnderTheIndex(canvasElement),
}

/** Below lg, scrolled to the quotes step: its inline phone is in view and plays. */
export const PhoneQuotesStep: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    // Reduced motion skips the entrance, so there is nothing to wait for.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const inlinePhone = within(getStep(canvasElement, 'quotes')).getByRole(
      'figure',
      { name: demoPhoneName('quotes') },
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
      name: anyDemoPhone,
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
