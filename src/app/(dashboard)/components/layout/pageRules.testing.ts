import { expect } from 'storybook/test'

import { READABLE_COLUMN_MAX_W_CSS } from '@/theme/pageContainer'
import {
  boxOf,
  expectPx,
  expectWindowWidth,
  lines,
} from '@/ui/PageContainer/pageLines.testing'

/** The 720 reading column in px. */
const COLUMN_PX = Number.parseFloat(READABLE_COLUMN_MAX_W_CSS) * 16

function parts(canvasElement: HTMLElement) {
  const title = canvasElement.querySelector('[data-sticky-header-title]')
  const row = canvasElement.querySelector('[data-sticky-header-row]')
  const frame = canvasElement.querySelector('[data-sticky-header]')
  expect(title, 'the page title').not.toBeNull()
  expect(row, 'the header row').not.toBeNull()
  expect(frame, 'the page frame').not.toBeNull()
  return {
    title: title as Element,
    row: row as Element,
    frame: frame as Element,
  }
}

/**
 * R2 for every dashboard page: the title starts on the logo line and the
 * header row spans the container, logo line to menu line.
 */
export function expectHeaderOnLogoLine(
  canvasElement: HTMLElement,
  width: number,
) {
  expectWindowWidth(canvasElement, width)
  const { logo, menu } = lines(canvasElement)
  const { title, row } = parts(canvasElement)
  expectPx(boxOf(title).left, logo, 'the title is on the logo line')
  expectPx(boxOf(row).right, menu, 'the header row ends on the menu line')
}

/**
 * R2 and R3 for a single-column page (Account, Billing, Admin notifications):
 * the header as above, then a body column of 720 (or the container, when that
 * is narrower), left-aligned on the logo line and never centred.
 */
export function expectColumnPage(canvasElement: HTMLElement, width: number) {
  expectHeaderOnLogoLine(canvasElement, width)
  const { logo, menu } = lines(canvasElement)
  const column = canvasElement.querySelector('[data-page-layout-column]')
  expect(column, 'the page column').not.toBeNull()
  const box = boxOf(column as Element)
  expectPx(box.left, logo, 'the column is on the logo line')
  expectPx(
    box.width,
    Math.min(COLUMN_PX, menu - logo),
    'the column is 720, or the container when narrower',
  )
}

/**
 * R2 and R4 for a wide page (Profile): the header as above, and the page
 * fills the container from the logo line to the menu line.
 */
export function expectWidePage(canvasElement: HTMLElement, width: number) {
  expectHeaderOnLogoLine(canvasElement, width)
  const { logo, menu } = lines(canvasElement)
  const { frame } = parts(canvasElement)
  expectPx(boxOf(frame).left, logo, 'the page starts on the logo line')
  expectPx(boxOf(frame).right, menu, 'the page ends on the menu line')
  expect(
    canvasElement.querySelector('[data-page-layout-column]'),
    'a wide page has no reading column',
  ).toBeNull()
}
