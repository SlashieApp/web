import { Box, Stack, Text } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import { REVEAL_MS, REVEAL_RISE_PX, Reveal } from './Reveal'

/** Story-only content: a surface card, the kind of block Reveal wraps. */
function SampleCard({ title }: { title: string }) {
  return (
    <Box
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      p={5}
      maxW="sm"
    >
      <Text fontWeight={500}>{title}</Text>
      <Text fontSize="sm" color="text.muted">
        Fades in and rises 8px as it scrolls into view.
      </Text>
    </Box>
  )
}

/** Story-only decorator: empty space that pushes the story below the fold. */
const withScrollSpacer: Decorator = (Story) => (
  <>
    <Box h="150vh" color="text.muted" fontSize="sm">
      Scroll down.
    </Box>
    <Story />
  </>
)

/** Story-only: sets what `(prefers-reduced-motion: reduce)` reports until cleanup. */
function emulateReducedMotion(matches: boolean) {
  const original = window.matchMedia
  window.matchMedia = (query: string) => {
    const list = original.call(window, query)
    if (!/prefers-reduced-motion:\s*reduce/.test(query)) return list
    return new Proxy(list, {
      get(target, prop) {
        if (prop === 'matches') return matches
        const value = Reflect.get(target, prop)
        return typeof value === 'function' ? value.bind(target) : value
      },
    })
  }
  return () => {
    window.matchMedia = original
  }
}

const meta = {
  title: 'Marketing/Landing/Reveal',
  component: Reveal,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    delayMs: { control: { type: 'number', min: 0, step: 30 } },
  },
  args: { delayMs: 0 },
  render: (args) => (
    <Reveal {...args} data-testid="reveal">
      <SampleCard title="Posting is free" />
    </Reveal>
  ),
} satisfies Meta<typeof Reveal>

export default meta
type Story = StoryObj<typeof meta>

/** In view at load: skipped, so the content shows at once with no hide-and-reveal flash. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const reveal = within(canvasElement).getByTestId('reveal')
    await expect(reveal.style.opacity).toBe('')
  },
}

/**
 * Below the fold: hidden after hydration, 8px low, then fades in and rises into
 * place over 400ms on the decelerate curve as it enters the viewport. It plays
 * once: scrolling away and back leaves it in place.
 */
export const BelowTheFold: Story = {
  decorators: [withScrollSpacer],
  beforeEach: () => emulateReducedMotion(false),
  play: async ({ canvasElement }) => {
    const reveal = within(canvasElement).getByTestId('reveal')
    await expect(reveal.style.opacity).toBe('0')
    await expect(reveal.style.transform).toBe(`translateY(${REVEAL_RISE_PX}px)`)
    await expect(REVEAL_RISE_PX).toBe(8)
    await expect(REVEAL_MS).toBe(400)
    await expect(reveal.style.transition).toContain(`opacity ${REVEAL_MS}ms`)
    await expect(reveal.style.transition).toContain(
      `transform ${REVEAL_MS}ms cubic-bezier(0, 0, 0, 1)`,
    )
    reveal.scrollIntoView({ block: 'center' })
    await waitFor(() => expect(reveal.style.opacity).toBe('1'), {
      timeout: 3000,
    })
    // Settled: no transform left behind.
    await expect(reveal.style.transform).toBe('none')
    // Once: leaving the viewport does not hide it again.
    window.scrollTo(0, 0)
    await new Promise((resolve) => setTimeout(resolve, 150))
    await expect(reveal.style.opacity).toBe('1')
  },
}

/** Staggered group: `delayMs` 0, 90 and 180 reveals siblings one after another. */
export const Staggered: Story = {
  decorators: [withScrollSpacer],
  beforeEach: () => emulateReducedMotion(false),
  render: (args) => (
    <Stack gap={3}>
      {[0, 90, 180].map((delayMs) => (
        <Reveal key={delayMs} {...args} delayMs={delayMs} data-testid="reveal">
          <SampleCard title={`Delayed by ${delayMs} ms`} />
        </Reveal>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByTestId('reveal')
    for (const item of items) await expect(item.style.opacity).toBe('0')
    items[0]?.scrollIntoView({ block: 'center' })
    await waitFor(
      () => {
        for (const item of items) expect(item.style.opacity).toBe('1')
      },
      { timeout: 3000 },
    )
  },
}

/** Reduced motion: never hidden, even below the fold, so it stays fully legible. */
export const ReducedMotion: Story = {
  decorators: [withScrollSpacer],
  beforeEach: () => emulateReducedMotion(true),
  play: async ({ canvasElement }) => {
    const reveal = within(canvasElement).getByTestId('reveal')
    await expect(reveal.style.opacity).toBe('')
    await expect(reveal.style.transform).toBe('')
  },
}
