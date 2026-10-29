/**
 * Layout measures for the step-flow spacing stories (FE-481 step-flows: post a
 * task, edit task, send quote, leave review and worker setup). They read a step
 * the way the spec does, between visible edges: the title, the description 8
 * under it, the first field 24 under that, fields 20 apart, the last one 20
 * above Continue, and no line above the bar.
 *
 * They build on the dialog measures (`gapsBetweenChildren`, `phone390`,
 * `labelOf`) and the field measures (`expectField`, `lineOf`).
 */
import { expect, within } from 'storybook/test'

import {
  gapsBetweenChildren,
  phone390,
} from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { formSpace } from '@/theme/styles'
import { gapBelow, gapBeside, heightOf } from '@/ui/FormField/formGap.testing'

export { phone390 }

/**
 * A desktop 1280 wide (the step flows' two-column layout starts at 1024).
 * Spread it into a story: `{ ...desktop1280 }`.
 */
export const desktop1280 = {
  parameters: {
    viewport: {
      options: {
        desktop1280: {
          name: 'Desktop 1280',
          styles: { width: '1280px', height: '900px' },
          type: 'desktop',
        },
      },
    },
  },
  globals: { viewport: { value: 'desktop1280', isRotated: false } },
} as const

/** The story really is this wide: a check that a story is not measuring another layout. */
export function expectWidth(canvasElement: HTMLElement, width: number) {
  expect(canvasElement.ownerDocument.defaultView?.innerWidth).toBe(width)
}

/**
 * The parts of a step-flow screen: the title (`h1`), the description under it
 * (null when there is none), the body (the `FormStack` after the heading), and
 * the bar's main button (null where the story has no bar). The create flow wraps
 * its heading in a focus target of its own, so the body may follow the
 * heading's wrapper.
 */
export function stepFlowOf(
  canvasElement: HTMLElement,
  button: string | RegExp = 'Continue',
) {
  const canvas = within(canvasElement)
  const title = canvas.getByRole('heading', { level: 1 })
  const heading = title.parentElement as HTMLElement
  const description = title.nextElementSibling as HTMLElement | null
  const body = (heading.nextElementSibling ??
    heading.parentElement?.nextElementSibling) as HTMLElement
  const main = canvas.queryByRole('button', { name: button })
  return { title, heading, description, body, main }
}

/** Scrolls whatever scrolls (the step's pane, the page) to its end. */
export async function scrollStepToEnd(from: HTMLElement) {
  const doc = from.ownerDocument
  for (let el = from.parentElement; el; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el)
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      el.scrollHeight > el.clientHeight
    ) {
      el.scrollTop = el.scrollHeight
    }
  }
  doc.defaultView?.scrollTo(0, doc.body.scrollHeight)
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

/** The bar's top edge draws no line. */
export async function expectNoBarLine(main: HTMLElement) {
  const bar = main.parentElement?.parentElement as HTMLElement
  await expect(getComputedStyle(bar).borderTopWidth).toBe('0px')
  await expect(getComputedStyle(bar).borderBottomWidth).toBe('0px')
}

/**
 * The whole frame of a step: the title, the description `titleToSubtitle` (8)
 * under it, the first block `headerToBody` (24) under that, the children of the
 * body `fieldGap` (20) apart, and, at the end of the scroll, the last one
 * `bodyToAction` (20) above Continue, which is `controlHeight` (48) tall. The
 * bar has no line.
 *
 * A step that does not fill its pane leaves free space above the bar, so the
 * last gap is read on a body that overflows (or ends at the pane's end).
 */
export async function expectStepFlowFrame(
  canvasElement: HTMLElement,
  {
    button = 'Continue',
    gap = formSpace.fieldGap,
    atRest = false,
  }: {
    button?: string | RegExp
    /** The gap between the body's children (the fields: 20). */
    gap?: number
    /** The body is short: read the last gap without scrolling. */
    atRest?: boolean
  } = {},
) {
  const found = stepFlowOf(canvasElement, button)
  const { title, description, body } = found
  const main = found.main as HTMLElement
  const first = body.firstElementChild as HTMLElement
  const last = body.lastElementChild as HTMLElement
  if (description) {
    await expect(gapBelow(title, description)).toBe(formSpace.titleToSubtitle)
    await expect(gapBelow(description, first)).toBe(formSpace.headerToBody)
  } else {
    await expect(gapBelow(title, first)).toBe(formSpace.headerToBody)
  }
  for (const found of gapsBetweenChildren(body)) {
    await expect(found).toBe(gap)
  }
  if (!atRest) await scrollStepToEnd(body)
  await expect(gapBelow(last, main)).toBe(formSpace.bodyToAction)
  await expect(heightOf(main)).toBe(formSpace.controlHeight)
  await expectNoBarLine(main)
  return { title, description, body, main }
}

/**
 * The `FormField` root of the field whose label matches (a string or a pattern,
 * read from the label's whole text: a label may hold an icon or an Optional
 * badge in a span of its own).
 */
export function fieldByLabel(
  scope: HTMLElement,
  label: string | RegExp,
): HTMLElement {
  const found = [...scope.querySelectorAll('label')].find((el) => {
    const text = (el.textContent ?? '').trim()
    return typeof label === 'string' ? text === label : label.test(text)
  })
  if (!found) throw new Error(`No field labelled ${String(label)}`)
  return found.parentElement as HTMLElement
}

/** The label of a field: it sits `labelToControl` (8) above the control. */
export function labelIn(field: HTMLElement): HTMLElement {
  return field.querySelector('label') as HTMLElement
}

/** Every gap between the visible edges of `elements`, in order, side by side or one under the other. */
export function gapsBetween(elements: Element[]): number[] {
  return elements.slice(1).map((next, i) => {
    const before = elements[i] as Element
    // On the same line (the next starts above the previous one's bottom edge).
    return next.getBoundingClientRect().top <
      before.getBoundingClientRect().bottom - 1
      ? gapBeside(before, next)
      : gapBelow(before, next)
  })
}

/** Every element of `elements` is `gap` px from the next. */
export async function expectGaps(elements: Element[], gap: number) {
  await expect(elements.length).toBeGreaterThan(1)
  for (const found of gapsBetween(elements)) await expect(found).toBe(gap)
}

/**
 * A choice group (`RadioButtonGroup`): the label `labelToControl` (8) above the
 * rows, the rows `alternativesGap` (8) apart (one under the other on a phone,
 * side by side from `sm`) and at least 44 tall, and the lines under the rows
 * (a helper, a hint, an error) `controlToHelper` (4) under them and `helperGap`
 * (4) apart, in the order given.
 */
export async function expectChoiceGroup(
  scope: HTMLElement,
  name: string | RegExp,
  lines: (string | RegExp)[] = [],
) {
  const grid = within(scope).getByRole('radiogroup', { name })
  const label = grid.ownerDocument.getElementById(
    grid.getAttribute('aria-labelledby') as string,
  ) as HTMLElement
  const rows = [...grid.children]
  await expect(gapBelow(label, grid)).toBe(formSpace.labelToControl)
  await expectGaps(rows, formSpace.alternativesGap)
  for (const row of rows) {
    await expect(heightOf(row)).toBeGreaterThanOrEqual(44)
  }
  if (lines.length > 0) {
    const meta = grid.nextElementSibling as HTMLElement
    const found = lines.map((line) => within(meta).getByText(line))
    await expect(gapBelow(grid, found[0] as Element)).toBe(
      formSpace.controlToHelper,
    )
    for (const gap of gapsBetween(found))
      await expect(gap).toBe(formSpace.helperGap)
  }
  return { grid, label, rows, root: grid.parentElement as HTMLElement }
}

/**
 * A composite field (a chip list, a bio with starters): the label
 * `labelToControl` (8) above the first piece of the control, and the pieces
 * `labelToControl` (8) apart. Returns the pieces and the control box (the
 * helper and error sit 4 under it).
 */
export async function expectPieces(field: HTMLElement) {
  const label = labelIn(field)
  const control = label.nextElementSibling as HTMLElement
  const stack = control.firstElementChild as HTMLElement
  const pieces = [...stack.children] as HTMLElement[]
  await expect(gapBelow(label, pieces[0] as Element)).toBe(
    formSpace.labelToControl,
  )
  await expectGaps(pieces, formSpace.labelToControl)
  return { label, control, stack, pieces }
}

/** An entry row (the input and its Add button): `inlineGap` (12) apart, both `controlHeight` (48) tall. */
export async function expectAddRow(row: HTMLElement) {
  const [input, add] = [...row.children] as HTMLElement[]
  await expect(gapBeside(input as Element, add as Element)).toBe(
    formSpace.inlineGap,
  )
  await expect(heightOf(input as Element)).toBe(formSpace.controlHeight)
  await expect(heightOf(add as Element)).toBe(formSpace.controlHeight)
}

/** The line under a field's control (its helper or error) is `controlToHelper` (4) under it. */
export async function expectLineUnder(
  control: Element,
  field: HTMLElement,
  text: string | RegExp,
) {
  await expect(gapBelow(control, within(field).getByText(text))).toBe(
    formSpace.controlToHelper,
  )
}

/**
 * The gap between two elements, one of which (or both) is a control whose 44px
 * hit area grows into the gaps around it (padding with an equal negative
 * margin): it is read between their content edges, the padding left out, which
 * is where the visible text is.
 */
export function gapBelowContent(upper: Element, lower: Element): number {
  const edge = (el: Element, side: 'Top' | 'Bottom') =>
    Number.parseFloat(getComputedStyle(el)[`padding${side}`])
  const gap =
    lower.getBoundingClientRect().top +
    edge(lower, 'Top') -
    (upper.getBoundingClientRect().bottom - edge(upper, 'Bottom'))
  return Math.round(gap * 100) / 100
}
