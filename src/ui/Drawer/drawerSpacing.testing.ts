/**
 * Layout measures for the filter panel spacing stories (FE-481 filter-panels:
 * the Workers and My tasks filter drawers, the search sheet, and the Date and
 * Budget panels). They read an open drawer the way the spec does, between
 * visible edges: the title, the first filter 24 under it, filters 20 apart, a
 * label 8 above its control, and the last filter 20 above the buttons.
 */
import { expect, waitFor, within } from 'storybook/test'

import { gapsBetweenChildren } from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { formSpace } from '@/theme/styles'
import { gapBelow, gapBeside, heightOf } from '@/ui/FormField/formGap.testing'

/** The open drawer called `name` (its title), on screen, with the parts of its frame. */
export async function openDrawer(
  canvasElement: HTMLElement,
  name: string | RegExp,
) {
  const page = within(canvasElement.ownerDocument.body)
  const dialog = await page.findByRole('dialog', { name }, { timeout: 5000 })
  await waitFor(() => expect(dialog).toBeVisible(), { timeout: 5000 })
  const part = (cls: string) => dialog.querySelector(cls) as HTMLElement | null
  return {
    dialog,
    title: within(dialog).getByRole('heading', { name }),
    body: part('.chakra-drawer__body') as HTMLElement,
    footer: part('.chakra-drawer__footer'),
    /** The `FormStack` the caller put in the body (the first child of the body's box). */
    column: (part('.chakra-drawer__body') as HTMLElement).firstElementChild
      ?.firstElementChild as HTMLElement,
  }
}

/** The bar under the body has no line above it, and nothing draws one in the header. */
export async function expectNoLines(dialog: HTMLElement) {
  for (const cls of ['.chakra-drawer__header', '.chakra-drawer__footer']) {
    const part = dialog.querySelector(cls)
    if (part) {
      await expect(getComputedStyle(part).borderTopWidth).toBe('0px')
      await expect(getComputedStyle(part).borderBottomWidth).toBe('0px')
    }
  }
}

/** Every gap between the filters of `column` is the field gap (20). */
export async function expectFiltersApart(column: HTMLElement) {
  const gaps = gapsBetweenChildren(column)
  await expect(gaps.length).toBeGreaterThan(0)
  for (const gap of gaps) await expect(gap).toBe(formSpace.fieldGap)
}

/** A label sits `labelToControl` (8) above its control; a field control is `controlHeight` (48) tall. */
export async function expectLabelAbove(
  label: Element,
  control: Element,
  { height }: { height?: number } = {},
) {
  await expect(gapBelow(label, control)).toBe(formSpace.labelToControl)
  if (height !== undefined) await expect(heightOf(control)).toBe(height)
}

/**
 * The bar of a drawer: the last filter is `bodyToAction` (20) above the buttons;
 * with two, they are `inlineGap` (12) apart, the primary one on the right, and
 * every button of the bar is as tall as the frame's (52).
 */
export async function expectBar(
  last: Element,
  buttons: HTMLElement[],
  { height = 52 }: { height?: number } = {},
) {
  for (const button of buttons) {
    await expect(gapBelow(last, button)).toBe(formSpace.bodyToAction)
    await expect(heightOf(button)).toBe(height)
  }
  for (let i = 1; i < buttons.length; i++) {
    await expect(
      gapBeside(buttons[i - 1] as Element, buttons[i] as Element),
    ).toBe(formSpace.inlineGap)
  }
}
