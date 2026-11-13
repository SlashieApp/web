import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import marketingMessages from '@/app/(marketing)/i11n.json'
import { viewportAt } from '@/ui/PageContainer/pageLines.testing'
import reportMessages from '@/ui/ReportDialog/i11n.json'

import { expectMarketingPage } from '../../../components/layout/marketingLines.testing'
import messages from '../i11n.json'
import { SafetyScreen } from './SafetyScreen'

const copy = messages.en
const phone = marketingMessages.en.landing.phone
const report = reportMessages.en

/** The character the product's copy never uses, built here so no source line carries it. */
const EM_DASH = String.fromCodePoint(0x2014)

const WHITE = 'rgb(255, 255, 255)'
const BORDER_DEFAULT = 'rgb(228, 228, 231)'
const TEXT_MUTED = 'rgb(82, 82, 91)'
/** `sizes.page`: 80rem. */
const PAGE_PX = 1280

/** Story-only: the page as the marketing layout holds it. */
const withLayout: Decorator = (Story) => (
  <Box bg="bg.canvas" minH="100dvh">
    <Box as="main" id="main-content">
      <Story />
    </Box>
  </Box>
)

const meta = {
  title: 'Marketing/Help/SafetyScreen',
  component: SafetyScreen,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [withLayout],
  args: { document: copy, phone, report },
} satisfies Meta<typeof SafetyScreen>

export default meta
type Story = StoryObj<typeof meta>

function box(node: Element) {
  return node.getBoundingClientRect()
}

/**
 * The hero rises in like Home's (a CSS animation), and the scenes play once
 * scrolled into view: wait for what a check looks at to be shown.
 */
async function shown(element: HTMLElement) {
  element.scrollIntoView({ block: 'center' })
  await waitFor(() => expect(element).toBeVisible(), { timeout: 4000 })
  return element
}

/** The pieces of the page the stories look at. */
function parts(canvasElement: HTMLElement) {
  const rails = canvasElement.querySelector<HTMLElement>(
    '[data-marketing-rails]',
  )
  const frame = rails?.parentElement
  const hero = canvasElement.querySelector<HTMLElement>('[data-safety-hero]')
  if (!rails || !frame || !hero) {
    throw new Error('The page is missing its frame or hero')
  }
  return {
    rails,
    frame,
    hero,
    rules: [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-section-rule]'),
    ],
    sections: [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-safety-section]'),
    ],
  }
}

/**
 * Desktop (1366), redesigned to follow Home (FE-555): Home's centred hero
 * (the title, the description, the intro and Last updated), then one section
 * per heading of the guide, each a landmark named by its h2, divided by
 * full-width rules. The first three have a scene beside the text, named by
 * the section's heading: the accepted quote (pay the worker directly), the
 * accept-quote dialog with its safety note, the report dialog. The fourth is
 * text only. The copy fixes of 13 Nov are in: job pay is between the customer
 * and the worker, and the old earnings line is gone.
 */
export const Desktop: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { rails, frame, hero, rules, sections } = parts(canvasElement)

    // One h1, centred, naming the hero; four h2s naming the sections.
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    const h1 = canvas.getByRole('heading', { level: 1, name: copy.title })
    await shown(h1)
    await expect(getComputedStyle(h1).textAlign).toBe('center')
    await expect(canvas.getByRole('region', { name: copy.title })).toBe(hero)
    await expect(
      canvas
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(copy.sections.map((section) => section.heading))
    await expect(sections).toHaveLength(4)
    for (const [index, section] of copy.sections.entries()) {
      await expect(canvas.getByRole('region', { name: section.heading })).toBe(
        sections[index],
      )
    }
    await expect(
      within(hero).getByText(`${copy.lastUpdatedLabel}: ${copy.lastUpdated}`),
    ).toBeInTheDocument()
    await expect(copy.lastUpdated).toBe('13 November 2026')

    // The copy fixes (13 Nov).
    await expect(frame.textContent).toContain(
      'Job pay is arranged between the customer and the worker',
    )
    await expect(frame.textContent).not.toContain('customer-to-customer')
    await expect(frame.textContent).not.toContain('earnings')
    await expect(frame.textContent).not.toContain(EM_DASH)

    // How to report keeps its anchor, for the app's /help/safety#report.
    await expect(sections[2]).toHaveAttribute('id', 'report')

    // The scenes, beside their text and named by their section's heading.
    const scenes = [
      canvas.getByRole('figure', { name: copy.sections[0]?.heading }),
      canvas.getByRole('figure', { name: copy.sections[1]?.heading }),
      canvas.getByRole('figure', { name: copy.sections[2]?.heading }),
    ]
    for (const [index, scene] of scenes.entries()) {
      const section = sections[index] as HTMLElement
      await expect(section).toContainElement(scene)
      const heading = within(section).getByRole('heading', { level: 2 })
      await expect(box(scene).left).toBeGreaterThan(box(heading).right)
    }
    await expect(sections[3]?.querySelector('figure')).toBeNull()
    await shown(within(scenes[0] as HTMLElement).getByText(phone.hire.note))
    const dialog = scenes[1] as HTMLElement
    await shown(within(dialog).getByText(phone.hire.acceptHint))
    await expect(dialog).toHaveTextContent(phone.hire.acceptTitle)
    const reportScene = scenes[2] as HTMLElement
    await shown(within(reportScene).getByText(report.reportTask))
    await expect(reportScene).toHaveTextContent(report.titleTask)
    await expect(reportScene).toHaveTextContent(report.reasons.SCAM)
    // A scene is a picture: no control in it can be clicked or focused.
    for (const scene of scenes.slice(1)) {
      await expect(
        scene.querySelectorAll('button, a, input, textarea, [tabindex]'),
      ).toHaveLength(0)
    }

    // The email is a mailto link, as on the legal pages.
    await expect(
      canvas.getByRole('link', { name: 'admin@slashie.app' }),
    ).toHaveAttribute('href', 'mailto:admin@slashie.app')

    // White page; the rails bound the column; four full-width rules, one
    // above each section; the body text muted.
    await expect(getComputedStyle(frame).backgroundColor).toBe(WHITE)
    await expect(getComputedStyle(rails).display).toBe('block')
    const column = rails.firstElementChild as HTMLElement
    await expect(box(column).width).toBe(Math.min(box(frame).width, PAGE_PX))
    await expect(rules).toHaveLength(4)
    for (const [index, rule] of rules.entries()) {
      await expect(box(rule).width).toBe(box(frame).width)
      await expect(getComputedStyle(rule).backgroundColor).toBe(BORDER_DEFAULT)
      await expect(box(rule).bottom).toBeLessThanOrEqual(
        box(sections[index] as HTMLElement).top + 1,
      )
    }
    await expect(
      getComputedStyle(canvas.getByText(copy.sections[3]?.body[0] ?? '')).color,
    ).toBe(TEXT_MUTED)
    for (const node of [frame, ...frame.querySelectorAll('*')]) {
      await expect(
        Number(getComputedStyle(node).fontWeight),
      ).toBeLessThanOrEqual(600)
    }

    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/** A tablet (834px): no rails; each scene follows its text, in the page's gutters. */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { rails, rules, sections } = parts(canvasElement)
    await expect(getComputedStyle(rails).display).toBe('none')
    await expect(rules).toHaveLength(4)
    for (const section of sections.slice(0, 3)) {
      const heading = within(section).getByRole('heading', { level: 2 })
      const scene = section.querySelector('figure') as HTMLElement
      await expect(box(scene).top).toBeGreaterThan(box(heading).bottom)
    }
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/** Phone width (320px, the narrowest): one column in reading order, inside the gutters. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { rails, sections } = parts(canvasElement)
    await expect(getComputedStyle(rails).display).toBe('none')
    for (let i = 1; i < sections.length; i += 1) {
      await expect(box(sections[i] as HTMLElement).top).toBeGreaterThanOrEqual(
        box(sections[i - 1] as HTMLElement).bottom,
      )
    }
    for (const scene of canvasElement.querySelectorAll('figure')) {
      await expect(box(scene).left).toBeGreaterThanOrEqual(16)
      await expect(box(scene).right).toBeLessThanOrEqual(
        canvasElement.clientWidth - 16,
      )
    }
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/** Traditional Chinese: the guide's and the scenes' zh-HK copy, 工作者 throughout. */
export const TraditionalChinese: Story = {
  args: {
    document: messages.zh_hk,
    phone: marketingMessages.zh_hk.landing.phone,
    report: reportMessages.zh_hk,
  },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await shown(
      canvas.getByRole('heading', { level: 1, name: messages.zh_hk.title }),
    )
    await expect(canvasElement.textContent).toContain('顧客與工作者之間安排')
    await expect(canvasElement.textContent).toContain('2026 年 11 月 13 日')
    await expect(canvasElement.textContent).not.toContain('顧客對顧客')
    await expect(canvasElement.textContent).not.toContain('師傅')
    await expect(canvasElement.textContent).not.toContain(EM_DASH)
  },
}

/** R1, R2, R5 (FE-493): the sections on the logo and menu lines (the h1 is centred, FE-555), the rails on the container edge from lg, the rules edge to edge at 390 (phone). */
export const PageLines390: Story = {
  ...viewportAt(390),
  play: async ({ canvasElement }) => {
    expectMarketingPage(canvasElement, 390, {
      header: false,
      centredTitle: true,
    })
  },
}

/** R1, R2, R5 (FE-493) at 1024 (tablet). */
export const PageLines1024: Story = {
  ...viewportAt(1024),
  play: async ({ canvasElement }) => {
    expectMarketingPage(canvasElement, 1024, {
      header: false,
      centredTitle: true,
    })
  },
}

/** R1, R2, R5 (FE-493) at 1366 (laptop). */
export const PageLines1366: Story = {
  ...viewportAt(1366),
  play: async ({ canvasElement }) => {
    expectMarketingPage(canvasElement, 1366, {
      header: false,
      centredTitle: true,
    })
  },
}

/** R1, R2, R5 (FE-493) at 1920 (wide desktop). */
export const PageLines1920: Story = {
  ...viewportAt(1920),
  play: async ({ canvasElement }) => {
    expectMarketingPage(canvasElement, 1920, {
      header: false,
      centredTitle: true,
    })
  },
}
