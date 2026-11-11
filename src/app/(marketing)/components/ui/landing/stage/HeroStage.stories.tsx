import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { HeroStage } from './HeroStage'
import { buildHeroStageCopy } from './heroStageCopy'

const copy = buildHeroStageCopy(messages.en.landing.heroStage, 'en')
const zhCopy = buildHeroStageCopy(messages.zh_hk.landing.heroStage, 'zh-hk')

/** The design the page's width shows: the other one takes no room. */
function shownHost(canvasElement: HTMLElement, design: 'wide' | 'compact') {
  const other = design === 'wide' ? 'compact' : 'wide'
  const shown = canvasElement.querySelector<HTMLElement>(`.sh-host--${design}`)
  const hidden = canvasElement.querySelector<HTMLElement>(`.sh-host--${other}`)
  if (!shown || !hidden) throw new Error('The scene has no hosts')
  return { shown, hidden }
}

const meta = {
  title: 'Marketing/Landing/HeroStage',
  component: HeroStage,
  parameters: { layout: 'fullscreen' },
  args: { copy },
} satisfies Meta<typeof HeroStage>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A desktop column: the customer's task page in a browser window, laid out as
 * the web page is. The page scrolls to its quotes, two arrive at the top of
 * the list, the customer accepts the Best match and confirms its time, and
 * the page returns to the top, booked. A second task then gets its first
 * quote before the loop starts again. One picture to a screen reader.
 */
export const Desktop: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('img', { name: copy.label })).toBeVisible()

    const { shown, hidden } = shownHost(canvasElement, 'wide')
    await expect(getComputedStyle(hidden).display).toBe('none')
    await expect(shown.getBoundingClientRect().height).toBeGreaterThan(300)
    await expect(
      within(shown).getAllByText(copy.tasks[0]?.title ?? '').length,
    ).toBeGreaterThan(0)

    // The kit's styles sit above Chakra's reset layer (`stage/layers.css`):
    // the window's bar keeps its padding, the quote's button its own.
    const bar = shown.querySelector('.ss-window__bar')
    if (!bar) throw new Error('The window has no bar')
    await expect(getComputedStyle(bar).paddingLeft).not.toBe('0px')
    const accept = shown.querySelector('.ss-button')
    if (!accept) throw new Error('The scene has no Accept button')
    await expect(getComputedStyle(accept).paddingLeft).not.toBe('0px')
    // Not a control: nothing in the picture takes keyboard focus.
    await expect(shown.querySelector('button, a, input, [tabindex]')).toBeNull()
  },
}

/**
 * A phone column: the same task page as the app draws it, on a phone that
 * runs off the foot. Each quote is announced by a notification, opens as a
 * row, and a tap accepts it in a bottom sheet.
 */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { shown, hidden } = shownHost(canvasElement, 'compact')
    await expect(getComputedStyle(hidden).display).toBe('none')
    const phone = shown.querySelector('.ss-phone')
    if (!phone) throw new Error('The scene has no phone')
    const box = phone.getBoundingClientRect()
    // The phone fits the column, a gutter in from each side.
    await expect(box.left).toBeGreaterThanOrEqual(0)
    await expect(box.right).toBeLessThanOrEqual(
      canvasElement.getBoundingClientRect().right,
    )
  },
}

/** Traditional Chinese copy (zh_hk bag): the same story, CJK labels. */
export const TraditionalChinese: Story = {
  args: { copy: zhCopy },
  globals: { viewport: { value: 'desktop', isRotated: false } },
}

/** Traditional Chinese on a phone column. */
export const TraditionalChinesePhone: Story = {
  args: { copy: zhCopy },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
