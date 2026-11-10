import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { TOOLBOX_STILL_SRC } from '../scene/HeroObjectsPoster'
import { HERO_TOOLBOX_SLOT } from '../scene/formations'
import { setSceneReady } from '../story/storyState'
import { HeroSection } from './HeroSection'

const hero = messages.en.landing.hero

/** `accent.active` (green 600), `text.muted` and `text.link`, resolved. */
const GREEN_600 = 'rgb(2, 165, 103)'
const TEXT_MUTED = 'rgb(82, 82, 91)'
const TEXT_LINK = 'rgb(5, 104, 63)'

/**
 * Story-only: the page's own stacking context (`home/page.tsx`), so the
 * layers under the copy (the glow, a phone's toolbox) paint above the ground
 * and not behind it.
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
    copy: messages.en.landing.hero,
    ctas: { seeHowItWorks: messages.en.common.ctas.seeHowItWorks },
  },
} satisfies Meta<typeof HeroSection>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Desktop: the centred hero. The h1 in `display-2xl` (72/72, 500, -0.045em), a
 * muted `text-lg` body, the 52px search pill, the trust row with green 600
 * checks, the "See how it works" text link and a faint radial grey behind it.
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

    const search = canvas.getByRole('textbox', {
      name: hero.searchAriaLabel,
    })
    await expect(search.parentElement?.getBoundingClientRect().height).toBe(52)

    const items = canvas.getAllByRole('listitem')
    await expect(items.map((item) => item.textContent)).toEqual(hero.trustChips)
    for (const item of items) {
      const check = item.querySelector('span')
      await expect(check && getComputedStyle(check).color).toBe(GREEN_600)
    }

    const link = canvas.getByRole('link', {
      name: messages.en.common.ctas.seeHowItWorks,
    })
    await expect(getComputedStyle(link).color).toBe(TEXT_LINK)

    const glow = canvasElement.querySelector('[data-hero-glow]')
    await expect(glow).not.toBeNull()
    await expect(glow && getComputedStyle(glow).backgroundImage).toContain(
      'radial-gradient',
    )

    // The hook the floating "Post a task" pill watches: it shows once this
    // section has scrolled out of view.
    await expect(canvasElement.querySelector('[data-landing-hero]')).toBe(
      canvas.getByRole('region', { name: hero.heading }),
    )

    // The toolbox's slot is a phone's: from `sm` the scene places the props.
    const slot = canvasElement.querySelector(HERO_TOOLBOX_SLOT)
    await expect(slot && getComputedStyle(slot).display).toBe('none')
  },
}

/** Wide screen: 128px above the h1 (the frame's section padding) and 96px under the last line, not the old 40px. */
export const Desktop: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const stack = canvasElement.querySelector('h1')?.parentElement
    if (!stack) throw new Error('The hero has no content stack')
    const style = getComputedStyle(stack)
    await expect(style.paddingTop).toBe('128px')
    await expect(style.paddingBottom).toBe('96px')
  },
}

/**
 * Phone width, edge to edge as on the page: the 44/46 heading wraps balanced,
 * the search pill stays 52px and the checks wrap under it. The one prop a
 * phone has, the toolbox, is whole in its slot at the hero's foot: a page
 * gutter (16px) in from the screen's edge and from the panel below, under the
 * trust row and clear of the link's 44px target.
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
    const search = canvas.getByRole('textbox', {
      name: hero.searchAriaLabel,
    })
    await expect(search.parentElement?.getBoundingClientRect().height).toBe(52)
    // 56px above and below, the phone rhythm.
    const stack = canvas.getByRole('heading', { level: 1 }).parentElement
    await expect(stack && getComputedStyle(stack).paddingTop).toBe('56px')
    await expect(stack && getComputedStyle(stack).paddingBottom).toBe('56px')

    const slot = canvasElement.querySelector(HERO_TOOLBOX_SLOT)
    if (!slot) throw new Error('The hero has no toolbox slot')
    const box = slot.getBoundingClientRect()
    const frame = canvas
      .getByRole('region', { name: hero.heading })
      .getBoundingClientRect()
    await expect(box.left - frame.left).toBe(16)
    await expect(frame.bottom - box.bottom).toBe(16)
    await expect(box.width).toBeGreaterThanOrEqual(56)
    await expect(box.height).toBe(box.width)
    await expect(getComputedStyle(slot).backgroundImage).toContain(
      TOOLBOX_STILL_SRC,
    )
    const target = canvas
      .getByRole('link', { name: messages.en.common.ctas.seeHowItWorks })
      .getBoundingClientRect()
    await expect(target.height).toBe(44)
    await expect(box.right).toBeLessThanOrEqual(target.left)
    await expect(box.top).toBeGreaterThanOrEqual(
      canvas.getByRole('list').getBoundingClientRect().bottom,
    )
  },
}

/** A phone, the live scene drawn: the still in the slot fades out, and the scene's own toolbox is in its place. */
export const MobileSceneReady: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: { layout: 'fullscreen' },
  beforeEach: () => {
    setSceneReady(true)
    return () => setSceneReady(false)
  },
  play: async ({ canvasElement }) => {
    const slot = canvasElement.querySelector(HERO_TOOLBOX_SLOT)
    if (!slot) throw new Error('The hero has no toolbox slot')
    await waitFor(() => expect(getComputedStyle(slot).opacity).toBe('0'), {
      timeout: 3000,
    })
  },
}

/** Traditional Chinese copy (zh_hk bag): CJK wrapping in the heading and body. */
export const TraditionalChinese: Story = {
  args: {
    copy: messages.zh_hk.landing.hero,
    ctas: { seeHowItWorks: messages.zh_hk.common.ctas.seeHowItWorks },
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
