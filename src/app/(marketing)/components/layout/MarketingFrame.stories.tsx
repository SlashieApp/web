import { Box, Container, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuMapPin, LuUsers, LuWallet } from 'react-icons/lu'
import { expect, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import {
  MarketingFrame,
  SECTION_PY,
  SectionHead,
  SectionRule,
} from './MarketingFrame'

const { story, pricingTeaser, finalCta } = messages.en.landing

/** `border.default`, `text.subtle` and `accent.active` (green 600), resolved. */
const BORDER_DEFAULT = 'rgb(228, 228, 231)'
const TEXT_SUBTLE = 'rgb(107, 107, 116)'
const GREEN_600 = 'rgb(2, 165, 103)'
/** `sizes.page`: 80rem. */
const PAGE_PX = 1280

/** Story-only: a section the way a marketing page builds one. */
function Section({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  return (
    <Box
      as="section"
      aria-labelledby={id}
      py={SECTION_PY}
      data-testid="section"
    >
      <Container>{children}</Container>
    </Box>
  )
}

/** Story-only: three sections in a frame, separated by rules. */
function SampleFrame() {
  return (
    <MarketingFrame data-testid="frame">
      <Section id="first">
        <SectionHead
          eyebrow={story.customer.eyebrow}
          icon={LuUsers}
          heading={story.customer.heading}
          headingId="first"
          body={pricingTeaser.body}
        />
      </Section>
      <SectionRule />
      <Section id="second">
        <SectionHead
          eyebrow={story.worker.eyebrow}
          icon={LuWallet}
          heading={story.worker.heading}
          headingId="second"
        />
      </Section>
      <SectionRule />
      <Section id="third">
        <SectionHead
          eyebrow={story.customer.steps.chat.title}
          icon={LuMapPin}
          heading={finalCta.heading}
          headingId="third"
        />
      </Section>
    </MarketingFrame>
  )
}

const meta = {
  title: 'Marketing/Layout/MarketingFrame',
  component: MarketingFrame,
  parameters: { layout: 'fullscreen' },
  render: () => <SampleFrame />,
} satisfies Meta<typeof MarketingFrame>

export default meta
type Story = StoryObj<typeof meta>

/** The frame the sections sit in: its rails and section rules, as `getBy` finds them. */
function parts(canvasElement: HTMLElement) {
  const frame = within(canvasElement).getByTestId('frame')
  const rails = frame.querySelector<HTMLElement>('[data-marketing-rails]')
  const rules = [...frame.querySelectorAll<HTMLElement>('[data-section-rule]')]
  const sections = within(canvasElement).getAllByTestId('section')
  if (!rails) throw new Error('The frame has no rails')
  return { frame, rails, rules, sections }
}

/**
 * Desktop (xl, 1280px): a 1px `border.default` rail down each side of the page
 * column for the frame's full height (and up under the sticky header),
 * full-width 1px rules between the sections, and 128px of section padding.
 */
export const Desktop: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { frame, rails, rules, sections } = parts(canvasElement)
    const frameBox = frame.getBoundingClientRect()

    await expect(getComputedStyle(rails).display).toBe('block')
    await expect(rails).toHaveAttribute('aria-hidden', 'true')
    const column = rails.firstElementChild as HTMLElement
    const edge = getComputedStyle(column)
    for (const side of ['Left', 'Right'] as const) {
      await expect(edge[`border${side}Width`]).toBe('1px')
      await expect(edge[`border${side}Color`]).toBe(BORDER_DEFAULT)
    }
    // Full height, on the page column's outer edges. They start one header
    // height (64px from md) above the frame, under the sticky header, so at the
    // top of the landing they run in from the screen's edge.
    const columnBox = column.getBoundingClientRect()
    await expect(columnBox.top).toBe(frameBox.top - 64)
    await expect(columnBox.bottom).toBe(frameBox.bottom)
    await expect(columnBox.width).toBe(Math.min(frameBox.width, PAGE_PX))
    // Each section's content column is the same column the rails bound.
    for (const section of sections) {
      const content = section.firstElementChild as HTMLElement
      await expect(content.getBoundingClientRect().left).toBe(columnBox.left)
      await expect(content.getBoundingClientRect().right).toBe(columnBox.right)
    }

    // Rules run edge to edge, across the rails.
    await expect(rules).toHaveLength(2)
    for (const rule of rules) {
      const box = rule.getBoundingClientRect()
      await expect(box.width).toBe(frameBox.width)
      await expect(box.height).toBe(1)
      await expect(getComputedStyle(rule).backgroundColor).toBe(BORDER_DEFAULT)
      await expect(rule).toHaveAttribute('aria-hidden', 'true')
    }

    // The rhythm: 128px above and below the content on a wide screen.
    for (const section of sections) {
      const style = getComputedStyle(section)
      await expect(style.paddingTop).toBe('128px')
      await expect(style.paddingBottom).toBe('128px')
    }
  },
}

/** Phone width: no rails (the column is the screen), the rules stay, 56px of section padding. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { frame, rails, rules, sections } = parts(canvasElement)
    await expect(getComputedStyle(rails).display).toBe('none')
    await expect(rules).toHaveLength(2)
    for (const rule of rules) {
      await expect(rule.getBoundingClientRect().width).toBe(
        frame.getBoundingClientRect().width,
      )
    }
    for (const section of sections) {
      await expect(getComputedStyle(section).paddingTop).toBe('56px')
    }
    // The phone heading is 34/41.
    const heading = within(canvasElement).getByRole('heading', {
      level: 2,
      name: story.customer.heading,
    })
    await expect(getComputedStyle(heading).fontSize).toBe('34px')
    await expect(getComputedStyle(heading).lineHeight).toBe('41px')
  },
}

/**
 * The section head: left-aligned, a small green 600 icon and the eyebrow (12px,
 * 500, +0.08em, caps, `text.subtle`) over a 500 heading (44/48 from `lg`).
 */
export const SectionHeadDefault: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const heading = canvas.getByRole('heading', {
      level: 2,
      name: story.customer.heading,
    })
    const heading$ = getComputedStyle(heading)
    await expect(heading$.fontWeight).toBe('500')
    await expect(heading$.fontSize).toBe('44px')
    await expect(heading$.lineHeight).toBe('48px')
    await expect(heading$.textAlign).toBe('start')
    // The section is a landmark named by its heading.
    await expect(
      canvas.getByRole('region', { name: story.customer.heading }),
    ).toBeInTheDocument()

    const eyebrow = canvas.getByText(story.customer.eyebrow)
    const eyebrow$ = getComputedStyle(eyebrow)
    await expect(eyebrow$.fontSize).toBe('12px')
    await expect(eyebrow$.fontWeight).toBe('500')
    await expect(eyebrow$.textTransform).toBe('uppercase')
    await expect(eyebrow$.letterSpacing).toBe('0.96px')
    await expect(eyebrow$.color).toBe(TEXT_SUBTLE)

    // The icon is green 600, hidden from assistive technology, and starts
    // where the heading does.
    const icon = eyebrow.previousElementSibling as HTMLElement
    await expect(getComputedStyle(icon).color).toBe(GREEN_600)
    await expect(icon).toHaveAttribute('aria-hidden', 'true')
    await expect(icon.getBoundingClientRect().left).toBe(
      heading.getBoundingClientRect().left,
    )
  },
}

/** The head's other shapes: a body, no eyebrow, and an `h3` inside a section. */
export const SectionHeadVariants: Story = {
  render: () => (
    <Container py={SECTION_PY}>
      <Stack gap={14}>
        <SectionHead
          eyebrow={story.worker.eyebrow}
          icon={LuWallet}
          heading={pricingTeaser.heading}
          body={pricingTeaser.body}
        />
        <SectionHead heading={pricingTeaser.heading} />
        <SectionHead
          level="h3"
          eyebrow={story.customer.eyebrow}
          heading={story.customer.steps.post.title}
          body={story.customer.steps.post.body}
        />
      </Stack>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('heading', { level: 2 })).toHaveLength(2)
    await expect(
      canvas.getByRole('heading', {
        level: 3,
        name: story.customer.steps.post.title,
      }),
    ).toBeInTheDocument()
    // No eyebrow, no eyebrow row: the heading leads its head.
    const [, bare] = canvas.getAllByRole('heading', { level: 2 })
    await expect(bare?.previousElementSibling).toBeNull()
  },
}

/**
 * `size="title"`: a section head under a page title of its own stays at the
 * page title's 34/41 at every width, so it never out-sizes the page's h1; the
 * default is 44/48 from `lg`.
 */
export const SectionHeadTitleSize: Story = {
  render: () => (
    <Container py={SECTION_PY}>
      <Stack gap={14}>
        <SectionHead heading={pricingTeaser.heading} headingId="lead" />
        <SectionHead
          heading={story.customer.heading}
          headingId="under-a-title"
          size="title"
        />
      </Stack>
    </Container>
  ),
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const lead = getComputedStyle(
      canvas.getByRole('heading', { level: 2, name: pricingTeaser.heading }),
    )
    const title = getComputedStyle(
      canvas.getByRole('heading', {
        level: 2,
        name: story.customer.heading,
      }),
    )
    await expect(lead.fontSize).toBe('44px')
    await expect(title.fontSize).toBe('34px')
    await expect(title.lineHeight).toBe('41px')
    await expect(title.fontWeight).toBe('500')
  },
}

/**
 * `railsZIndex`: by default the rails sit under anything positioned over the
 * page (1); a page whose sticky page header paints an opaque bar (the pricing
 * page) raises them above it so they run unbroken from the site header. They
 * stay out of the way of clicks either way.
 */
export const RailsAboveABar: Story = {
  render: () => (
    <>
      <MarketingFrame data-testid="default-frame">
        <Box h="80px" />
      </MarketingFrame>
      <MarketingFrame data-testid="raised-frame" railsZIndex={11}>
        <Box h="80px" />
      </MarketingFrame>
    </>
  ),
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const railsOf = (id: string) =>
      canvas
        .getByTestId(id)
        .querySelector<HTMLElement>('[data-marketing-rails]') as HTMLElement
    await expect(getComputedStyle(railsOf('default-frame')).zIndex).toBe('1')
    await expect(getComputedStyle(railsOf('raised-frame')).zIndex).toBe('11')
    await expect(getComputedStyle(railsOf('raised-frame')).pointerEvents).toBe(
      'none',
    )
  },
}
