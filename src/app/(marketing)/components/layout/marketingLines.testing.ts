import { expect } from 'storybook/test'

import { PAGE_CONTAINER_PX } from '@/theme/pageContainer'
import {
  boxOf,
  expectPx,
  expectWindowWidth,
  lines,
} from '@/ui/PageContainer/pageLines.testing'

/**
 * Story helpers for the marketing pages and the site header: the layout rules
 * R1, R2 and R5 as a play check (FE-493). Not part of the barrel.
 */

/** Within half a pixel: a 1px offset (the header's border once) must fail. */
function expectExact(actual: number, expected: number, message: string) {
  expect(Math.abs(actual - expected), message).toBeLessThanOrEqual(0.5)
}

/** The container's box edges (where the rails stand): 80rem centred, or the window. */
export function containerEdges(width: number) {
  const left = Math.max((width - PAGE_CONTAINER_PX) / 2, 0)
  return { left, right: width - left }
}

/** The content box of an element: its box less its padding and its border. */
function contentBox(element: Element) {
  const { left, right } = element.getBoundingClientRect()
  const style = getComputedStyle(element)
  return {
    left:
      left +
      Number.parseFloat(style.paddingLeft) +
      Number.parseFloat(style.borderLeftWidth),
    right:
      right -
      Number.parseFloat(style.paddingRight) -
      Number.parseFloat(style.borderRightWidth),
  }
}

/** Every visible link and button in an element, in reading order. */
function visibleActions(root: Element) {
  return [...root.querySelectorAll('a, button')].filter(
    (node) => node.getBoundingClientRect().width > 0,
  )
}

/**
 * R1: the site header's logo is on the logo line and its last action ends on
 * the menu line, to the pixel (the header's 1px border is top and bottom only,
 * so it takes nothing from the gutter: audit W12).
 */
export function expectSiteHeaderOnLines(
  canvasElement: HTMLElement,
  width: number,
) {
  expectWindowWidth(canvasElement, width)
  const { logo, menu } = lines(canvasElement)
  const header = canvasElement.querySelector('header')
  expect(header, 'the site header').not.toBeNull()
  const image = (header as Element).querySelector('img, svg')
  expect(image, 'the logo').not.toBeNull()
  expectExact(
    boxOf(image as Element).left,
    logo,
    'the logo is on the logo line',
  )
  const actions = visibleActions(header as Element)
  const last = actions[actions.length - 1]
  expect(last, 'the last action of the header').toBeDefined()
  expectExact(
    boxOf(last as Element).right,
    menu,
    'the last action ends on the menu line',
  )
  const style = getComputedStyle(header as Element)
  expect(style.borderLeftWidth, 'no side border in the gutter').toBe('0px')
  expect(style.borderRightWidth, 'no side border in the gutter').toBe('0px')
}

/**
 * R2: a marketing page's own header starts on the logo line and spans the
 * container, logo line to menu line, at every width.
 */
export function expectPageHeaderOnLines(canvasElement: HTMLElement) {
  const { logo, menu } = lines(canvasElement)
  const title = canvasElement.querySelector('[data-sticky-header-title]')
  const row = canvasElement.querySelector('[data-sticky-header-row]')
  expect(title, 'the page title').not.toBeNull()
  expect(row, 'the header row').not.toBeNull()
  expectPx(boxOf(title as Element).left, logo, 'the title is on the logo line')
  expectPx(
    boxOf(row as Element).right,
    menu,
    'the header row ends on the menu line',
  )
}

/** R2 for a page whose h1 is in its own hero (About): the title starts on the logo line. */
export function expectTitleOnLogoLine(canvasElement: HTMLElement) {
  const { logo } = lines(canvasElement)
  const title = canvasElement.querySelector('h1')
  expect(title, 'the page title').not.toBeNull()
  expectPx(boxOf(title as Element).left, logo, 'the title is on the logo line')
}

/**
 * R1 for the content: every page container outside the rails (the sections of
 * the page, the footer's) has its content on the logo line and the menu line.
 */
export function expectContainersOnLines(canvasElement: HTMLElement) {
  const { logo, menu } = lines(canvasElement)
  const containers = [
    ...canvasElement.querySelectorAll('[data-page-container]'),
  ].filter(
    (node) =>
      !node.closest('[data-marketing-rails]') && !node.closest('header'),
  )
  expect(containers.length, 'page containers').toBeGreaterThan(0)
  for (const container of containers) {
    const box = contentBox(container)
    expectExact(box.left, logo, 'a container starts on the logo line')
    expectExact(box.right, menu, 'a container ends on the menu line')
  }
}

/**
 * The marketing frame's rails (FE-471) stand on the container's box edge, 32px
 * outside the logo and menu lines (decided exception to R1, 5 Nov): from lg,
 * the rail box is the 80rem container, centred. Below lg there are no rails.
 */
export function expectRailsOnContainerEdge(
  canvasElement: HTMLElement,
  width: number,
) {
  const wrapper = canvasElement.querySelector('[data-marketing-rails]')
  expect(wrapper, 'the rails').not.toBeNull()
  if (width < 1024) {
    expect(
      getComputedStyle(wrapper as Element).display,
      'no rails below lg',
    ).toBe('none')
    return
  }
  const rail = (wrapper as Element).firstElementChild as Element
  const { left, right } = containerEdges(width)
  expectExact(boxOf(rail).left, left, 'the left rail is on the container edge')
  expectExact(
    boxOf(rail).right,
    right,
    'the right rail is on the container edge',
  )
  const style = getComputedStyle(rail)
  expect(style.borderLeftWidth).toBe('1px')
  expect(style.borderRightWidth).toBe('1px')
}

/** R5: the section rules run edge to edge, across the rails. */
export function expectRulesFullBleed(
  canvasElement: HTMLElement,
  width: number,
) {
  const rules = [...canvasElement.querySelectorAll('[data-section-rule]')]
  expect(rules.length, 'section rules').toBeGreaterThan(0)
  for (const rule of rules) {
    expectExact(boxOf(rule).left, 0, 'a rule starts at the window edge')
    expectExact(boxOf(rule).right, width, 'a rule ends at the window edge')
  }
}

/**
 * A framed marketing page, all at once. `header`: the story renders the site
 * header. `pageHeader: false`: the title is the page's own h1, not a page header.
 */
export function expectMarketingPage(
  canvasElement: HTMLElement,
  width: number,
  { header, pageHeader = true }: { header: boolean; pageHeader?: boolean },
) {
  expectWindowWidth(canvasElement, width)
  if (header) expectSiteHeaderOnLines(canvasElement, width)
  if (pageHeader) expectPageHeaderOnLines(canvasElement)
  else expectTitleOnLogoLine(canvasElement)
  expectContainersOnLines(canvasElement)
  expectRailsOnContainerEdge(canvasElement, width)
  expectRulesFullBleed(canvasElement, width)
}
