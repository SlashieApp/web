import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import cookiesBag from '@/app/(marketing)/cookies/i11n.json'
import safetyBag from '@/app/(marketing)/help/safety/i11n.json'
import privacyBag from '@/app/(marketing)/privacy/i11n.json'
import termsBag from '@/app/(marketing)/terms/i11n.json'

import { LegalPageLayout } from './LegalPageLayout'

/** The character the product's copy never uses, built here so no source line carries it. */
const EM_DASH = String.fromCodePoint(0x2014)

/** Resolved token values the stories check. */
const WHITE = 'rgb(255, 255, 255)'
const INK = 'rgb(10, 21, 18)'
const BORDER_DEFAULT = 'rgb(228, 228, 231)'
const TEXT_MUTED = 'rgb(82, 82, 91)'
const GREEN_400 = 'rgb(0, 220, 130)'
/** `sizes.page`: 80rem. */
const PAGE_PX = 1280

/**
 * Story-only: the page as the marketing layout holds it, on the layout's
 * canvas colour, so the frame's white is what the page shows.
 */
const withLayout: Decorator = (Story) => (
  <Box bg="bg.canvas" minH="100dvh">
    <Box as="main" id="main-content">
      <Story />
    </Box>
  </Box>
)

const meta = {
  title: 'Marketing/Layout/LegalPageLayout',
  component: LegalPageLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [withLayout],
  args: {
    document: cookiesBag.en,
  },
} satisfies Meta<typeof LegalPageLayout>

export default meta
type Story = StoryObj<typeof meta>

function box(node: Element) {
  return node.getBoundingClientRect()
}

/** The pieces of the page the stories look at. */
function parts(canvasElement: HTMLElement) {
  const rails = canvasElement.querySelector<HTMLElement>(
    '[data-marketing-rails]',
  )
  const frame = rails?.parentElement
  const policy = canvasElement.querySelector<HTMLElement>(
    '[data-legal-document]',
  )
  if (!rails || !frame || !policy) {
    throw new Error('The page is missing its frame or its document')
  }
  return {
    rails,
    frame,
    policy,
    intro: canvasElement.querySelector<HTMLElement>('[data-legal-intro]'),
    rows: [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-legal-section]'),
    ],
    rules: [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-section-rule]'),
    ],
  }
}

/** Every element in the frame. */
function everyNode(root: HTMLElement) {
  return [root, ...root.querySelectorAll<HTMLElement>('*')]
}

/**
 * How many characters each line of a paragraph holds, read from where the
 * browser put every character (`counts` picks which characters are counted).
 * A paragraph with a link in it is skipped: only a lone text node is measured.
 */
function lineLengths(
  paragraph: HTMLElement,
  counts: (character: string) => boolean = () => true,
): number[] {
  const [node, ...rest] = paragraph.childNodes
  if (!node || rest.length > 0 || node.nodeType !== Node.TEXT_NODE) return []
  const text = node.textContent ?? ''
  const range = document.createRange()
  const lines = new Map<number, number>()
  for (let index = 0; index < text.length; index++) {
    range.setStart(node, index)
    range.setEnd(node, index + 1)
    const rect = range.getClientRects()[0]
    if (rect) {
      const top = Math.round(rect.top)
      lines.set(
        top,
        (lines.get(top) ?? 0) + (counts(text[index] ?? '') ? 1 : 0),
      )
    }
  }
  // The last line is a remainder, not the column's measure.
  return [...lines.values()].slice(0, -1)
}

/** Every full line of the document's body text (the section paragraphs). */
function bodyLines(
  canvasElement: HTMLElement,
  counts?: (character: string) => boolean,
) {
  return [
    ...canvasElement.querySelectorAll<HTMLElement>('[data-legal-section] p'),
  ].flatMap((paragraph) => lineLengths(paragraph, counts))
}

/** A Chinese character or full-width punctuation mark. */
const isCjk = (character: string) =>
  /[\u3000-\u9fff\uff00-\uffef]/.test(character)

/**
 * The reading column on a wide screen: the text holds 65 to 75 characters a
 * line on average (a line of short words may run a few longer), whatever the
 * document.
 */
async function expectReadingColumn(canvasElement: HTMLElement) {
  const lines = bodyLines(canvasElement)
  await expect(lines.length).toBeGreaterThan(5)
  const average = lines.reduce((sum, length) => sum + length, 0) / lines.length
  await expect(average).toBeGreaterThanOrEqual(65)
  await expect(average).toBeLessThanOrEqual(75)
  await expect(Math.max(...lines)).toBeLessThanOrEqual(80)
}

/**
 * The page in the marketing frame at desktop width (1366): a white page, a
 * rail down each side of the page column, one rule under the page header; the
 * title is the one h1 and the policy one landmark named by it, each section an
 * h2; the intro, then the sections as hairline rows with the heading on the
 * left and the text in the reading column; 500-weight headings, muted body, no
 * green fill and nothing heavier than 600.
 */
async function expectFramedDocument(
  canvasElement: HTMLElement,
  legal: { title: string; sections: { heading: string; id?: string }[] },
) {
  const canvas = within(canvasElement)
  const { rails, frame, policy, intro, rows, rules } = parts(canvasElement)

  // One h1 (the page header's title); the policy is one landmark named by it.
  await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  await expect(
    canvas.getByRole('heading', { level: 1, name: legal.title }),
  ).toBeVisible()
  await expect(canvas.getByRole('region', { name: legal.title })).toBe(policy)
  await expect(canvas.getAllByRole('region')).toHaveLength(1)
  await expect(
    canvas
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent),
  ).toEqual(legal.sections.map((section) => section.heading))
  await expect(frame.textContent).not.toContain(EM_DASH)

  // A white page; the rails bound the page column; one full-width rule sits
  // between the page header and the policy.
  await expect(getComputedStyle(frame).backgroundColor).toBe(WHITE)
  await expect(getComputedStyle(rails).display).toBe('block')
  const column = rails.firstElementChild as HTMLElement
  const edge = getComputedStyle(column)
  for (const side of ['Left', 'Right'] as const) {
    await expect(edge[`border${side}Width`]).toBe('1px')
    await expect(edge[`border${side}Color`]).toBe(BORDER_DEFAULT)
  }
  await expect(box(column).width).toBe(Math.min(box(frame).width, PAGE_PX))
  await expect(rules).toHaveLength(1)
  const [rule] = rules as [HTMLElement]
  await expect(box(rule).width).toBe(box(frame).width)
  await expect(box(rule).height).toBe(1)
  await expect(getComputedStyle(rule).backgroundColor).toBe(BORDER_DEFAULT)
  await expect(box(rule).bottom).toBeLessThanOrEqual(box(policy).top + 1)
  // The rails run over the page header's bar, not under it.
  await expect(Number(getComputedStyle(rails).zIndex)).toBeGreaterThan(10)

  // The rhythm: 128px above and below the policy.
  await expect(getComputedStyle(policy).paddingTop).toBe('128px')
  await expect(getComputedStyle(policy).paddingBottom).toBe('128px')

  // The rows: a hairline above each (the first, with no intro, takes none:
  // the page's rule does that), square, on the white page.
  await expect(rows).toHaveLength(legal.sections.length)
  for (const [index, row] of rows.entries()) {
    const style = getComputedStyle(row)
    const first = index === 0 && !intro
    await expect(style.borderTopWidth).toBe(first ? '0px' : '1px')
    await expect(style.borderTopColor).toBe(BORDER_DEFAULT)
    await expect(style.borderTopLeftRadius).toBe('0px')
    await expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    await expect(style.paddingTop).toBe(first ? '0px' : '40px')
    await expect(style.paddingBottom).toBe(
      index === rows.length - 1 ? '0px' : '40px',
    )
  }

  // The heading on the left, the text in the reading column on the right, the
  // two starting on one line.
  for (const row of rows) {
    const heading = within(row).getByRole('heading', { level: 2 })
    const first = row.querySelector('p') as HTMLElement
    await expect(box(heading).left).toBeLessThan(box(first).left)
    await expect(box(heading).right).toBeLessThanOrEqual(box(first).left)
    await expect(Math.abs(box(heading).top - box(first).top)).toBeLessThan(1)
    await expect(box(first).right).toBeLessThanOrEqual(box(policy).right)
    // Heading 24/30 at 500, tracking -0.02em, ink; text 16/24, muted.
    const head = getComputedStyle(heading)
    await expect(head.fontSize).toBe('24px')
    await expect(head.lineHeight).toBe('30px')
    await expect(Number(head.fontWeight)).toBe(500)
    await expect(head.letterSpacing).toBe('-0.48px')
    await expect(head.color).toBe(INK)
    await expect(head.textAlign).toMatch(/^(start|left)$/)
    for (const paragraph of row.querySelectorAll('p')) {
      const text = getComputedStyle(paragraph)
      await expect(text.fontSize).toBe('16px')
      await expect(text.lineHeight).toBe('24px')
      await expect(text.color).toBe(TEXT_MUTED)
      // 32em of 16px: the reading column.
      await expect(text.maxWidth).toBe('512px')
    }
  }

  // The intro: 18/28 in ink, the same reading column (32em of 18px), in the
  // text's column.
  if (intro) {
    for (const paragraph of intro.querySelectorAll('p')) {
      const text = getComputedStyle(paragraph)
      await expect(text.fontSize).toBe('18px')
      await expect(text.lineHeight).toBe('28px')
      await expect(text.color).toBe(INK)
      await expect(text.maxWidth).toBe('576px')
    }
    const firstRow = rows[0]
    if (firstRow) {
      await expect(box(intro.querySelector('p') as HTMLElement).left).toBe(
        box(firstRow.querySelector('p') as HTMLElement).left,
      )
    }
  }

  // Green only where it does a job: nothing is filled or inked in green 400,
  // and no type is heavier than 600.
  for (const node of everyNode(frame)) {
    const style = getComputedStyle(node)
    await expect(style.backgroundColor).not.toBe(GREEN_400)
    await expect(style.color).not.toBe(GREEN_400)
    await expect(Number(style.fontWeight)).toBeLessThanOrEqual(600)
  }
}

/** Short policy (Cookie Policy): the page in the frame, an intro and four sections. */
export const Default: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    await expectFramedDocument(canvasElement, cookiesBag.en)
    await expectReadingColumn(canvasElement)
  },
}

/** Longest document (Terms of Service): sixteen hairline rows in one frame. */
export const TermsOfService: Story = {
  args: { document: termsBag.en },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    await expectFramedDocument(canvasElement, termsBag.en)
    await expectReadingColumn(canvasElement)
    await expect(
      within(canvasElement).getAllByRole('heading', { level: 2 }),
    ).toHaveLength(16)
  },
}

/** Privacy Policy: sections with several paragraphs each. */
export const PrivacyPolicy: Story = {
  args: { document: privacyBag.en },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    await expectFramedDocument(canvasElement, privacyBag.en)
    await expectReadingColumn(canvasElement)
  },
}

/**
 * Safety help page: two intro paragraphs and a section with an anchor id (the
 * app links to `#report`), which is the row, so it clears the two bars when
 * it is scrolled to.
 */
export const SafetyGuidance: Story = {
  args: { document: safetyBag.en },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    await expectFramedDocument(canvasElement, safetyBag.en)
    await expectReadingColumn(canvasElement)
    const { rows, intro } = parts(canvasElement)
    await expect(intro?.querySelectorAll('p')).toHaveLength(2)
    const anchored = canvasElement.querySelector<HTMLElement>('#report')
    await expect(anchored).toBe(rows[2])
    await expect(
      within(anchored as HTMLElement).getByRole('heading', {
        level: 2,
        name: 'How to report',
      }),
    ).toBeVisible()
    await expect(
      getComputedStyle(anchored as HTMLElement).scrollMarginTop,
    ).toBe('138px')
  },
}

/**
 * Traditional Chinese copy, with its own "last updated" label. The column is
 * 32em, so a line holds about 32 Chinese characters, a good measure for Chinese.
 */
export const TraditionalChinese: Story = {
  args: { document: cookiesBag.zh_hk },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expectFramedDocument(canvasElement, cookiesBag.zh_hk)
    await expect(
      canvas.getByText(
        `${cookiesBag.zh_hk.lastUpdatedLabel}: ${cookiesBag.zh_hk.lastUpdated}`,
      ),
    ).toBeVisible()
    // A line of Latin words holds more characters, so count the Chinese ones.
    const lines = bodyLines(canvasElement, isCjk)
    await expect(lines.length).toBeGreaterThan(0)
    await expect(Math.max(...lines)).toBeLessThanOrEqual(34)
  },
}

/** No `intro`: the first section follows the page's rule directly, with no hairline of its own. */
export const WithoutIntro: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  args: {
    document: {
      title: 'Community guidelines',
      description: 'How we expect members to behave.',
      lastUpdated: '1 October 2026',
      lastUpdatedLabel: 'Last updated',
      sections: [
        {
          heading: '1. Be respectful',
          body: ['Treat other members the way you would like to be treated.'],
        },
        {
          heading: '2. Keep it honest',
          body: [
            'Describe tasks and skills accurately so people can choose well.',
          ],
        },
      ],
    },
  },
  play: async ({ canvasElement, args }) => {
    await expectFramedDocument(canvasElement, args.document)
    const { intro, rows } = parts(canvasElement)
    await expect(intro).toBeNull()
    await expect(getComputedStyle(rows[0] as HTMLElement).borderTopWidth).toBe(
      '0px',
    )
    await expect(getComputedStyle(rows[1] as HTMLElement).borderTopWidth).toBe(
      '1px',
    )
  },
}

/** `lastUpdatedLabel` omitted: the layout falls back to "Last updated". */
export const DefaultUpdatedLabel: Story = {
  args: {
    document: {
      title: 'Acceptable use',
      description: 'What you can and cannot do on the service.',
      lastUpdated: '1 October 2026',
      intro: ['These rules apply to everything you post.'],
      sections: [
        {
          heading: '1. Prohibited content',
          body: ['Do not post anything unlawful, misleading, or abusive.'],
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('Last updated: 1 October 2026'),
    ).toBeVisible()
  },
}

/** Email addresses in the intro and body become mailto links. */
export const EmailLinks: Story = {
  args: {
    document: {
      title: 'Contact us',
      description: 'Where to send questions.',
      lastUpdated: '1 October 2026',
      lastUpdatedLabel: 'Last updated',
      intro: ['Questions about this page? Write to hello@example.com.'],
      sections: [
        {
          heading: '1. Who to write to',
          body: [
            'Billing: billing@example.com. Safety concerns: safety@example.com, any time.',
          ],
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('link', { name: 'hello@example.com' }),
    ).toHaveAttribute('href', 'mailto:hello@example.com')
    await expect(canvas.getAllByRole('link')).toHaveLength(3)
  },
}

/**
 * Tablet: no rails below `lg`, 80px above and below the policy, and each row
 * stacked, the heading over its text, in a column that is still 32em.
 */
export const Tablet: Story = {
  args: { document: termsBag.en },
  globals: { viewport: { value: 'tablet', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { rails, rules, policy, rows } = parts(canvasElement)
    await expect(getComputedStyle(rails).display).toBe('none')
    await expect(rules).toHaveLength(1)
    await expect(getComputedStyle(policy).paddingTop).toBe('80px')
    await expect(getComputedStyle(policy).paddingBottom).toBe('80px')
    for (const row of rows) {
      const heading = within(row).getByRole('heading', { level: 2 })
      const first = row.querySelector('p') as HTMLElement
      await expect(box(first).top).toBeGreaterThanOrEqual(box(heading).bottom)
      await expect(box(first).left).toBe(box(heading).left)
      await expect(getComputedStyle(first).maxWidth).toBe('512px')
    }
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/**
 * Phone width (320px, the narrowest): one column in reading order, no rails,
 * 56px above and below the policy, the heading over its text, the text filling
 * the screen inside the page's 16px gutters (a phone holds fewer than 65
 * characters a line, as a phone must).
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { document: safetyBag.en },
  play: async ({ canvasElement }) => {
    const { rails, rules, policy, rows } = parts(canvasElement)
    await expect(getComputedStyle(rails).display).toBe('none')
    await expect(rules).toHaveLength(1)
    await expect(getComputedStyle(policy).paddingTop).toBe('56px')
    await expect(getComputedStyle(policy).paddingBottom).toBe('56px')
    for (const row of rows) {
      const heading = within(row).getByRole('heading', { level: 2 })
      const first = row.querySelector('p') as HTMLElement
      await expect(box(first).top).toBeGreaterThanOrEqual(box(heading).bottom)
      await expect(box(first).left).toBe(box(heading).left)
      await expect(box(first).left).toBeGreaterThanOrEqual(16)
      await expect(box(first).right).toBeLessThanOrEqual(
        canvasElement.clientWidth - 16,
      )
    }
    await expect(getComputedStyle(rows[1] as HTMLElement).paddingTop).toBe(
      '32px',
    )
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}
