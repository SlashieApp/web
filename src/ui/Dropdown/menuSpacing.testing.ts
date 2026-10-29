/**
 * Layout measures for the menu spacing stories (FE-481 menus: the Dropdown
 * panel, the account, task, message and card menus, and the list sheets). They
 * read a menu the way the spec does: the panel's padding is 8 on every side, the
 * rows stay rows (they keep their own height and their own gap), and in a sheet
 * the first row is 24 under the title. A row is measured by its own box, which is
 * what shows on hover, press and the current page.
 *
 * They build on the field measures (`gapBelow`, `heightOf`) and the drawer
 * measures (`openDrawer`).
 */
import { expect, userEvent, waitFor } from 'storybook/test'

import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

/** The padding of a menu panel (px): the 8 step, on every side, in both panel modes. */
export const menuPanelPadding = 8

const round = (value: number) => Math.round(value * 100) / 100

/** The panel a trigger opened (`aria-controls`), or throws when it is not on screen. */
export function panelOf(trigger: HTMLElement): HTMLElement {
  const id = trigger.getAttribute('aria-controls')
  const panel = id ? trigger.ownerDocument.getElementById(id) : null
  if (!panel) throw new Error('The trigger has no open panel')
  return panel
}

/**
 * Opens the menu of `trigger` the way a person does and returns its panel, once
 * the enter motion has ended. A menu started with `defaultOpen` is not used: it
 * starts in the phone mode and closes itself when the desktop breakpoint
 * resolves, and a panel that is closing is scaled like one that is opening.
 */
export async function openPopover(
  trigger: HTMLElement,
  { hover = false }: { hover?: boolean } = {},
) {
  if (trigger.getAttribute('aria-expanded') !== 'true') {
    if (hover) await userEvent.hover(trigger)
    else await userEvent.click(trigger)
  }
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
  const panel = panelOf(trigger)
  await settled(panel)
  return panel
}

/**
 * How far the panel's content sits inside the panel: the gap from each edge of
 * the panel to the outer edge of its children that take room (the first at the
 * top, the last at the bottom, the widest at each side).
 */
export function insetsOf(panel: Element) {
  const box = panel.getBoundingClientRect()
  // A child with no size (the sentinel a closed dialog leaves) is not content.
  const rects = [...panel.children]
    .map((child) => child.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.height > 0)
  return {
    top: round(Math.min(...rects.map((r) => r.top)) - box.top),
    bottom: round(box.bottom - Math.max(...rects.map((r) => r.bottom))),
    left: round(Math.min(...rects.map((r) => r.left)) - box.left),
    right: round(box.right - Math.max(...rects.map((r) => r.right))),
  }
}

/**
 * The panel scales in (0.98 to 1 over 100ms), and a measure taken on the way is
 * scaled with it: wait for the enter motion to end before reading a size.
 */
export async function settled(panel: Element) {
  await Promise.all(panel.getAnimations().map((a) => a.finished))
}

/** Every side of the panel is `menuPanelPadding` (8) from its content. */
export async function expectPanelPadding(panel: Element) {
  await settled(panel)
  await expect(insetsOf(panel)).toEqual({
    top: menuPanelPadding,
    bottom: menuPanelPadding,
    left: menuPanelPadding,
    right: menuPanelPadding,
  })
}

/** The gaps between consecutive rows, in px (rows stay rows: whatever the menu already had). */
export function rowGaps(rows: Element[]): number[] {
  return rows.slice(1).map((row, i) => gapBelow(rows[i] as Element, row))
}

/** Every row is at least the house touch target tall (44): rows stay rows. */
export async function expectRowsAreRows(rows: Element[], gap: number) {
  for (const row of rows) {
    await expect(heightOf(row)).toBeGreaterThanOrEqual(44)
  }
  for (const found of rowGaps(rows)) await expect(found).toBe(gap)
}

/** The first row of a sheet is `headerToBody` (24) under the title. */
export async function expectFirstRowUnderTitle(
  title: Element,
  firstRow: Element,
) {
  await expect(gapBelow(title, firstRow)).toBe(formSpace.headerToBody)
}

/** The left edge of the text inside `element` (px), for lining a label up with a title. */
export function textLeft(element: Element): number {
  const range = element.ownerDocument.createRange()
  range.selectNodeContents(element)
  return round(range.getBoundingClientRect().left)
}
