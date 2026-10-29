import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { HeroSection } from './HeroSection'

const hero = messages.en.landing.hero

/** `accent.active` (green 600), `text.muted` and `text.link`, resolved. */
const GREEN_600 = 'rgb(2, 165, 103)'
const TEXT_MUTED = 'rgb(82, 82, 91)'
const TEXT_LINK = 'rgb(5, 104, 63)'

const meta = {
  title: 'Marketing/Landing/HeroSection',
  component: HeroSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
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
  },
}

/** Phone width: the 44/46 heading wraps balanced, the search pill stays 52px and the checks wrap under it. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
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
      body: 'Trusted local workers send clear quotes for the job you post, and you choose who to hire. No platform cut of the job.',
      trustChips: [
        'No job fee',
        'Local workers',
        'Pay directly',
        'Free to post',
        'Reviews you can read',
        'Clear quotes',
      ],
    },
  },
}
