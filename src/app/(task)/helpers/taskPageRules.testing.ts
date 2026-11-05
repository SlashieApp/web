import { expect } from 'storybook/test'

import { SEARCH_LIST_COLUMN_W } from '@/theme/pageContainer'
import {
  boxOf,
  expectPx,
  expectWindowWidth,
  lines,
} from '@/ui/PageContainer/pageLines.testing'

/**
 * Story helpers for the layout rules on the task pages (R2, R4, R5). Not part
 * of any barrel.
 */

/** The desktop list column in px. */
const SEARCH_LIST_COLUMN_PX = Number.parseFloat(SEARCH_LIST_COLUMN_W)

/** The box inside an element's padding: where its content is laid out. */
export function contentBoxOf(element: Element) {
  const style = getComputedStyle(element)
  const { left, right } = element.getBoundingClientRect()
  const l = left + Number.parseFloat(style.paddingLeft)
  const r = right - Number.parseFloat(style.paddingRight)
  return { left: l, right: r, width: r - l }
}

/** The page container's content box is the logo line to the menu line (R1). */
export function expectContainerOnLines(
  canvasElement: HTMLElement,
  container: Element,
  message = 'container',
) {
  const { logo, menu } = lines(canvasElement)
  const box = contentBoxOf(container)
  expectPx(box.left, logo, `${message} content starts on the logo line`)
  expectPx(box.right, menu, `${message} content ends on the menu line`)
}

function mustFind<T extends Element>(
  root: Element,
  selector: string,
  what: string,
) {
  const found = root.querySelector<T>(selector)
  expect(found, what).not.toBeNull()
  return found as T
}

/**
 * Task detail (R2 and R4): Back and the title start on the logo line, the
 * header row ends on the menu line, and the body (the tab panels and the rail
 * beside them) fills the container from the logo line to the menu line.
 */
export function expectTaskDetailOnLines(
  canvasElement: HTMLElement,
  width: number,
) {
  expectWindowWidth(canvasElement, width)
  const { logo, menu } = lines(canvasElement)
  const title = mustFind(canvasElement, '[data-sticky-header-title]', 'title')
  const row = mustFind(canvasElement, '[data-sticky-header-row]', 'header row')
  const back = mustFind(canvasElement, '[data-sticky-header-back]', 'Back')
  expectPx(boxOf(title).left, logo, 'the title is on the logo line')
  expectPx(boxOf(back).left, logo, 'Back is on the logo line')
  expectPx(boxOf(row).left, logo, 'the header row starts on the logo line')
  expectPx(boxOf(row).right, menu, 'the header row ends on the menu line')

  const grid = mustFind(
    canvasElement,
    '[data-task-detail-body]',
    'the body grid',
  )
  const body = boxOf(grid)
  expectPx(body.left, logo, 'the body starts on the logo line')
  expectPx(body.right, menu, 'the body ends on the menu line')
}

/** My tasks (R2 and R4): the title on the logo line, the page filling the container. */
export function expectMyTasksOnLines(
  canvasElement: HTMLElement,
  width: number,
) {
  expectWindowWidth(canvasElement, width)
  const { logo } = lines(canvasElement)
  const container = mustFind(
    canvasElement,
    '[data-page-container]',
    'the page container',
  )
  expectContainerOnLines(canvasElement, container, 'My tasks')
  const title = mustFind(canvasElement, 'h1', 'the title')
  expectPx(boxOf(title).left, logo, 'the title is on the logo line')
}

/** The desktop search list column (R4, R5): 460 wide, starting on the logo line over the map. */
export function expectSearchListColumn(
  canvasElement: HTMLElement,
  width: number,
) {
  expectWindowWidth(canvasElement, width)
  const { logo } = lines(canvasElement)
  const column = mustFind(
    canvasElement,
    '[data-search-list-column]',
    'the list column',
  )
  const box = boxOf(column)
  expectPx(box.left, logo, 'the list column is on the logo line')
  expectPx(box.width, SEARCH_LIST_COLUMN_PX, 'the list column is 460 wide')
  const container = mustFind(
    canvasElement,
    '[data-page-container]',
    'the page container',
  )
  expectContainerOnLines(canvasElement, container, 'search')
}

/**
 * Phone and tablet search (R5): the chrome over the map (logo, search bar,
 * chips) sits in the page container, on the gutters.
 */
export function expectSearchChromeInContainer(
  canvasElement: HTMLElement,
  width: number,
) {
  expectWindowWidth(canvasElement, width)
  const container = mustFind(
    canvasElement,
    '[data-page-container]',
    'the page container',
  )
  expectContainerOnLines(canvasElement, container, 'search chrome')
}

/**
 * A card over the map on a phone sits on the page gutters (R5): the card
 * strip's slide runs from the logo line to the menu line. A slide is a
 * fixed-width flex item of the strip.
 */
export function expectCardStripOnGutters(
  canvasElement: HTMLElement,
  width: number,
) {
  expectWindowWidth(canvasElement, width)
  const { logo, menu } = lines(canvasElement)
  const slide = [...canvasElement.querySelectorAll<HTMLElement>('div')].find(
    (element) => {
      const style = getComputedStyle(element)
      return (
        style.flexShrink === '0' &&
        style.flexGrow === '0' &&
        /^[\d.]+px$/.test(style.flexBasis) &&
        element.getBoundingClientRect().width > 200
      )
    },
  )
  expect(slide, 'a card in the strip').toBeDefined()
  const box = boxOf(slide as Element)
  expectPx(box.left, logo, 'the card starts on the gutter')
  expectPx(box.right, menu, 'the card ends on the gutter')
}
