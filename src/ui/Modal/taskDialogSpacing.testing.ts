/**
 * Layout measures for the task dialog spacing stories (FE-481 task-dialogs:
 * report, feedback, review, accept a quote, mark Failed, reschedule, and the
 * confirms). They add what those dialogs need to the account dialogs' measures
 * in `dialogSpacing.testing` (`openDialog`, `barButton`, `bodyColumn`, `phone390`):
 * the visible control of a field, and one call that checks a field the way the
 * spec does, between visible edges.
 */
import { expect, within } from 'storybook/test'

import { labelOf } from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

/**
 * The visible control of a `FormField`: the bordered shell of an input or a
 * select, or the textarea itself (a multiline field has no shell).
 */
export function controlOf(field: HTMLElement): HTMLElement {
  const control = field.querySelector('input, select, textarea') as HTMLElement
  return control instanceof HTMLTextAreaElement
    ? control
    : (control.parentElement as HTMLElement)
}

/**
 * A field the way the spec reads it: the label sits `labelToControl` (8) above
 * the control, and a single-line control is `controlHeight` (48) tall. Pass
 * `height` for a control that is not a single line (a textarea).
 */
export async function expectField(
  field: HTMLElement,
  height: number | null = formSpace.controlHeight,
) {
  const control = controlOf(field)
  await expect(gapBelow(labelOf(field), control)).toBe(formSpace.labelToControl)
  if (height !== null) await expect(heightOf(control)).toBe(height)
}

/** The helper or error line of a field, by its text. */
export function lineOf(field: HTMLElement, text: string | RegExp) {
  return within(field).getByText(text)
}

/**
 * The five visible star tiles of a `StarRatingInput`, left to right: what a gap
 * is measured from. The tap target (`starTargetsOf`) is bigger.
 */
export function starTilesOf(scope: HTMLElement): HTMLElement[] {
  return [...scope.querySelectorAll('[data-star-tile]')] as HTMLElement[]
}

/** The five tap targets of a `StarRatingInput`: its radios, which fill the label's padding box. */
export function starTargetsOf(scope: HTMLElement): HTMLElement[] {
  return [...scope.querySelectorAll('input[type="radio"]')] as HTMLElement[]
}

/**
 * Scrolls a dialog body to its end. A form taller than the screen scrolls
 * between the header and the bar, and "the last field is 20 above the buttons"
 * is read at the end of that scroll (a short form is already there).
 */
export async function scrollToEnd(body: HTMLElement) {
  body.scrollTop = body.scrollHeight
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}
