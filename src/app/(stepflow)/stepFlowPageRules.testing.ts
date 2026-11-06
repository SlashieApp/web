import { expect, within } from 'storybook/test'

import { READABLE_COLUMN_MAX_W_CSS } from '@/theme/pageContainer'
import {
  boxOf,
  expectPx,
  expectWindowWidth,
  lines,
  viewportAt,
} from '@/ui/PageContainer/pageLines.testing'
import { expectCentredCardBox } from '@/ui/StatusCard/statusCard.testing'

/**
 * Play checks for the page layout rules of the step flows (FE-493): post a
 * task, edit task, send a quote, leave a review and worker setup. Story
 * helpers, not part of the app.
 *
 * - R2: the flow header (Close, the logo, the flow's name) sits in the page
 *   container, so Close starts on the logo line and the bar ends on the menu
 *   line at every width.
 * - R3: below lg a step is one column of 720 (or the container when that is
 *   narrower), LEFT-aligned on the logo line, never centred.
 * - From lg a step flow is a stepper rail and a raised panel that fill the
 *   container, logo line to menu line (a rail + panel flow is not a single
 *   column; Ryan to confirm, see the layout audit W9).
 * - R5: the post-a-task map step (the compact card) sits on the container
 *   line.
 * - R6: a gate is the centred status card, one width.
 */

/** Below this window width (lg) a step is a single column. */
const LG = 1024

/** The 720 reading column in px. */
const COLUMN_PX = Number.parseFloat(READABLE_COLUMN_MAX_W_CSS) * 16

/** An element's content box: its edges less its padding and border. */
function contentBox(element: Element) {
  const { left, right } = element.getBoundingClientRect()
  const style = getComputedStyle(element)
  const inset = (side: 'Left' | 'Right') =>
    Number.parseFloat(style[`padding${side}`]) +
    Number.parseFloat(style[`border${side}Width`])
  return { left: left + inset('Left'), right: right - inset('Right') }
}

function pageContainerOf(element: Element | null, what: string) {
  const container = element?.closest('[data-page-container]') ?? null
  expect(container, `${what} sits in the page container`).not.toBeNull()
  return container as Element
}

/**
 * R2: the flow header is in the page container; Close starts on the logo line
 * and the container's content ends on the menu line.
 */
export function expectStepFlowHeader(
  canvasElement: HTMLElement,
  width: number,
) {
  expectWindowWidth(canvasElement, width)
  const { logo, menu } = lines(canvasElement)
  const header = canvasElement.querySelector('header')
  expect(header, 'the flow header').not.toBeNull()
  const container = pageContainerOf(
    (header as Element).firstElementChild,
    'the flow header',
  )
  const box = contentBox(container)
  expectPx(box.left, logo, 'the header content starts on the logo line')
  expectPx(box.right, menu, 'the header content ends on the menu line')
  const close = (header as Element).querySelector('a')
  expect(close, 'Close').not.toBeNull()
  expectPx(boxOf(close as Element).left, logo, 'Close is on the logo line')
}

/**
 * R3 below lg, the container from lg: the step's title block is a 720 column
 * (or the container, when narrower) left-aligned on the logo line; from lg the
 * stepper rail and the panel fill the container. `button`, when given, is the
 * bar's main button: below lg it ends inside the column.
 */
export function expectStepColumn(
  canvasElement: HTMLElement,
  width: number,
  button?: Element | null,
) {
  expectWindowWidth(canvasElement, width)
  const { logo, menu } = lines(canvasElement)
  const title = canvasElement.querySelector('h1')
  expect(title, 'the step title').not.toBeNull()
  const heading = (title as Element).parentElement as Element
  if (width < LG) {
    const column = boxOf(heading)
    expectPx(column.left, logo, 'the step column is on the logo line')
    expectPx(
      column.width,
      Math.min(COLUMN_PX, menu - logo),
      'the step column is 720, or the container when narrower',
    )
    if (button) {
      expect(
        boxOf(button).right,
        'Continue ends inside the column',
      ).toBeLessThanOrEqual(column.right + 1)
    }
    return
  }
  const grid = pageContainerOf(title, 'the step')
  const box = contentBox(grid)
  expectPx(box.left, logo, 'the stepper rail starts on the logo line')
  expectPx(box.right, menu, 'the panel ends on the menu line')
  expectStepFillsPanel(title as Element, width)
}

/** The nearest ancestor with horizontal padding: the panel's padded step area. */
function paddedAncestor(element: Element) {
  let node = element.parentElement
  while (node) {
    if (Number.parseFloat(getComputedStyle(node).paddingLeft) > 0) return node
    node = node.parentElement
  }
  return null
}

/**
 * From lg the step is NOT narrowed to the 720 column (the decided exception:
 * rail + panel fill the container): the heading block takes the panel's whole
 * padded area, edge to edge. Where that area is wider than 720 (the panel is
 * 784 at 1366 and 1920 for a flow without an aside), it is wider than the
 * column cap too. At 1024 the panel is narrower than 720, so this holds with
 * or without a cap there: it is the 1366 and 1920 runs that catch one.
 */
function expectStepFillsPanel(title: Element, width: number) {
  const heading = boxOf(title.parentElement as Element)
  const padded = paddedAncestor(title)
  expect(padded, 'the step has a padded panel area').not.toBeNull()
  const area = contentBox(padded as Element)
  expectPx(
    heading.left,
    area.left,
    `the step starts at the panel edge (${width})`,
  )
  expectPx(
    heading.right,
    area.right,
    `the step fills the panel, not capped at the 720 column (${width})`,
  )
}

/**
 * R5: the compact post-a-task map step. Below lg the card runs edge to edge
 * and its content is on the logo line; from lg the card itself sits on the
 * logo line.
 */
export function expectCompactMapCard(
  canvasElement: HTMLElement,
  width: number,
) {
  expectWindowWidth(canvasElement, width)
  const { logo } = lines(canvasElement)
  const title = canvasElement.querySelector('h1')
  expect(title, 'the step title').not.toBeNull()
  if (width < LG) {
    expectPx(
      boxOf(title as Element).left,
      logo,
      'the card content is on the logo line',
    )
    return
  }
  const card = (title as Element).closest('[data-create-task-card]')
  expect(card, 'the card').not.toBeNull()
  expectPx(boxOf(card as Element).left, logo, 'the card is on the logo line')
}

/**
 * R6: a gate in front of a flow is the centred status card, one width, centred
 * in the window.
 */
export function expectGateCard(canvasElement: HTMLElement, width: number) {
  expectWindowWidth(canvasElement, width)
  const card = canvasElement.querySelector('section[aria-labelledby]')
  expect(card, 'the gate card').not.toBeNull()
  expectCentredCardBox(canvasElement, card as Element, 'the gate card')
}

/**
 * A story at a window `width` wide that checks the rules for a step flow
 * screen: the header on the logo line (R2) and the step in its column (R3) or
 * rail and panel. Spread it into a story with the screen's own decorators:
 * `{ decorators, ...stepFlowRulesAt(1366) }`. `button` names the bar's main
 * button (Continue, Save).
 */
export function stepFlowRulesAt(
  width: number,
  button: string | RegExp = 'Continue',
) {
  return {
    ...viewportAt(width),
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const canvas = within(canvasElement)
      await canvas.findByRole('heading', { level: 1 })
      expectStepFlowHeader(canvasElement, width)
      expectStepColumn(
        canvasElement,
        width,
        canvas.queryByRole('button', { name: button }),
      )
    },
  }
}

/**
 * The same for the post-a-task location step: the header on the logo line and
 * the compact map card on the container line (R5).
 */
export function compactMapRulesAt(width: number) {
  return {
    ...viewportAt(width),
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      await within(canvasElement).findByRole('heading', { level: 1 })
      expectStepFlowHeader(canvasElement, width)
      expectCompactMapCard(canvasElement, width)
    },
  }
}
