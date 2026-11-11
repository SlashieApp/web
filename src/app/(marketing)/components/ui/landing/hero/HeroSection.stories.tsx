import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { HeroStage } from '../stage/HeroStage'
import { HeroSection } from './HeroSection'

const hero = messages.en.landing.hero
const ctas = messages.en.common.ctas
const stageCopy = messages.en.landing.heroStage

/** `accent.active` (green 600), `text.muted` and `text.link`, resolved. */
const GREEN_600 = 'rgb(2, 165, 103)'
const TEXT_MUTED = 'rgb(82, 82, 91)'
const TEXT_LINK = 'rgb(5, 104, 63)'

/**
 * Story-only: the page's own stacking context (`home/page.tsx`), so the
 * glow under the copy paints above the ground and not behind it.
 */
const asOnThePage: Decorator = (Story) => (
  <Box position="relative" isolation="isolate">
    <Story />
  </Box>
)

const meta = {
  title: 'Marketing/Landing/HeroSection',
  component: HeroSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [asOnThePage],
  args: {
    copy: hero,
    ctas: { postTask: ctas.postTask, browseTasks: ctas.browseTasks },
    stage: <HeroStage copy={stageCopy} />,
  },
} satisfies Meta<typeof HeroSection>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Desktop: the centred hero. The h1 in `display-2xl` (72/72, 500, -0.045em), a
 * muted `text-lg` body, the 52px pill that asks what you need done with the
 * green Post a task pill, the trust row with green 600 checks, the worker's
 * line with its Browse tasks link, a faint radial grey behind it, and the
 * scene under the copy, down to the section's foot.
 */
export const Default: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const h1 = canvas.getByRole('heading', { level: 1, name: hero.heading })
    const h1Style = getComputedStyle(h1)
    await expect(h1Style.fontSize).toBe('72px')
    await expect(h1Style.lineHeight).toBe('72px')
    await expect(Number(h1Style.fontWeight)).toBe(500)
    await expect(Number.parseFloat(h1Style.letterSpacing)).toBeCloseTo(-3.24, 1)

    const body = canvas.getByText(hero.body)
    const bodyStyle = getComputedStyle(body)
    await expect(bodyStyle.fontSize).toBe('18px')
    await expect(bodyStyle.lineHeight).toBe('28px')
    await expect(bodyStyle.color).toBe(TEXT_MUTED)
    await expect(bodyStyle.textWrap).toBe('balance')

    const field = canvas.getByRole('textbox', { name: hero.taskAriaLabel })
    await expect(field.parentElement?.getBoundingClientRect().height).toBe(52)
    // Each part fades in after the one above it: wait for the entrance.
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: ctas.postTask })).toBeVisible(),
    )

    const items = canvas.getAllByRole('listitem')
    await expect(items.map((item) => item.textContent)).toEqual(hero.trustChips)
    for (const item of items) {
      const check = item.querySelector('span')
      await expect(check && getComputedStyle(check).color).toBe(GREEN_600)
    }

    // The worker's way in: the public search, as a text link.
    await waitFor(() =>
      expect(canvas.getByText(hero.workerPrompt)).toBeVisible(),
    )
    const link = canvas.getByRole('link', { name: ctas.browseTasks })
    await expect(link).toHaveAttribute('href', '/search')
    await expect(getComputedStyle(link).color).toBe(TEXT_LINK)

    const glow = canvasElement.querySelector('[data-hero-glow]')
    await expect(glow).not.toBeNull()
    await expect(glow && getComputedStyle(glow).backgroundImage).toContain(
      'radial-gradient',
    )

    // The hook the floating "Post a task" pill watches: it shows once this
    // section has scrolled out of view.
    const region = canvas.getByRole('region', { name: hero.heading })
    await expect(canvasElement.querySelector('[data-landing-hero]')).toBe(
      region,
    )

    // The scene is one picture with one name, under the copy, and it runs
    // down to the section's foot (the rule below is the edge it runs off).
    const scene = canvas.getByRole('img', { name: stageCopy.label })
    const sceneBox = scene.getBoundingClientRect()
    await expect(sceneBox.top).toBeGreaterThanOrEqual(
      link.getBoundingClientRect().bottom,
    )
    await expect(
      Math.abs(region.getBoundingClientRect().bottom - sceneBox.bottom),
    ).toBeLessThanOrEqual(1)
  },
}

/** Wide screen: 128px above the h1 (the frame's section padding) and 32px between the last line and the scene. */
export const Desktop: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const stack = canvasElement.querySelector('h1')?.parentElement
    if (!stack) throw new Error('The hero has no content stack')
    const style = getComputedStyle(stack)
    await expect(style.paddingTop).toBe('128px')
    await expect(style.paddingBottom).toBe('32px')
  },
}

/**
 * Phone width, edge to edge as on the page: the 44/46 heading wraps balanced,
 * the pill stays 52px with Post a task whole inside it, the checks wrap under
 * it, the Browse tasks link is a 44px target, and the scene is the app on a
 * phone, 24px under the copy.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: { layout: 'fullscreen' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const h1Style = getComputedStyle(
      canvas.getByRole('heading', { level: 1, name: hero.heading }),
    )
    await expect(h1Style.fontSize).toBe('44px')
    await expect(h1Style.lineHeight).toBe('46px')
    const field = canvas.getByRole('textbox', { name: hero.taskAriaLabel })
    const pill = field.parentElement
    if (!pill) throw new Error('The task field has no pill around it')
    await expect(pill.getBoundingClientRect().height).toBe(52)
    const submit = canvas.getByRole('button', { name: ctas.postTask })
    await expect(submit.getBoundingClientRect().right).toBeLessThanOrEqual(
      pill.getBoundingClientRect().right,
    )
    // 56px above the h1 and 24px between the last line and the scene.
    const stack = canvas.getByRole('heading', { level: 1 }).parentElement
    await expect(stack && getComputedStyle(stack).paddingTop).toBe('56px')
    await expect(stack && getComputedStyle(stack).paddingBottom).toBe('24px')

    const target = canvas
      .getByRole('link', { name: ctas.browseTasks })
      .getBoundingClientRect()
    await expect(target.height).toBe(44)

    const scene = canvas.getByRole('img', { name: stageCopy.label })
    await expect(scene.getBoundingClientRect().width).toBeLessThanOrEqual(
      canvasElement.getBoundingClientRect().width,
    )
  },
}

/** No scene: the copy alone, closed by the old foot (96px on a wide screen). */
export const WithoutScene: Story = {
  args: { stage: undefined },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const stack = canvasElement.querySelector('h1')?.parentElement
    if (!stack) throw new Error('The hero has no content stack')
    await expect(getComputedStyle(stack).paddingBottom).toBe('96px')
    await expect(within(canvasElement).queryByRole('img')).toBeNull()
  },
}

/** Traditional Chinese copy (zh_hk bag): CJK wrapping in the heading and body. */
export const TraditionalChinese: Story = {
  args: {
    copy: messages.zh_hk.landing.hero,
    ctas: {
      postTask: messages.zh_hk.common.ctas.postTask,
      browseTasks: messages.zh_hk.common.ctas.browseTasks,
    },
    stage: <HeroStage copy={messages.zh_hk.landing.heroStage} />,
  },
}

/** Long copy: a balanced multi-line heading, a longer body and six checks that wrap. */
export const LongCopy: Story = {
  args: {
    copy: {
      ...messages.en.landing.hero,
      heading:
        'Help around the corner, whatever the job and whenever you need it.',
      body: 'Trusted local workers send clear quotes for the job you post, and you choose who to hire. Slashie takes no cut of the job.',
      trustChips: [
        ...messages.en.landing.hero.trustChips,
        'Free to post',
        'Reviews you can read',
        'Clear quotes',
      ],
    },
  },
}
