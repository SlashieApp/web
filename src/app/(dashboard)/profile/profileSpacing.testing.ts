/**
 * Layout measures for the profile editor spacing stories (FE-481
 * profile-editors: the Personal and Worker editors and the photo card in the
 * profile drawer). They read the open drawer the way the spec does, between
 * visible edges: the title, the description 8 under it, the first field 24
 * under that, fields 20 apart, a label 8 above its control, a helper 4 under
 * it, and the last field 20 above Cancel and Save, which are 48 tall.
 *
 * They build on the drawer measures (`openDrawer`, `expectNoLines`), the dialog
 * measures (`gapsBetweenChildren`, `fieldOf`, `labelOf`) and the field measures
 * (`controlOf`, `lineOf`).
 */
import { expect, within } from 'storybook/test'

import {
  fieldOf,
  gapsBetweenChildren,
} from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { formSpace } from '@/theme/styles'
import { expectNoLines, openDrawer } from '@/ui/Drawer/drawerSpacing.testing'
import { gapBelow, gapBeside, heightOf } from '@/ui/FormField/formGap.testing'
import {
  controlOf,
  expectField,
  lineOf,
  scrollToEnd,
} from '@/ui/Modal/taskDialogSpacing.testing'

/**
 * A scroll position is a whole number and the layout is not, so the end of a
 * scroll can sit up to half a pixel off the pinned bar.
 */
export function expectWithinHalfPixel(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(0.5)
}

/** The open profile drawer called `name`, with its description and the editor's form and `FormStack`. */
export async function openEditor(
  canvasElement: HTMLElement,
  name: string | RegExp,
) {
  const found = await openDrawer(canvasElement, name)
  const form = found.body.querySelector('form') as HTMLElement | null
  return {
    ...found,
    description: found.dialog.querySelector(
      '[data-part="description"]',
    ) as HTMLElement,
    form,
    /** The editor's `FormStack`: the fields, then the bar. */
    stack: form?.firstElementChild as HTMLElement,
  }
}

/** The title, its description 8 under it, and the first block 24 under that. */
export async function expectTitleBlock(
  title: HTMLElement,
  description: HTMLElement,
  first: Element,
) {
  await expect(gapBelow(title, description)).toBe(formSpace.titleToSubtitle)
  await expect(gapBelow(description, first)).toBe(formSpace.headerToBody)
}

/** A field with a label 8 above a 48 control, and its helper (or error) line 4 under the control. */
export async function expectFieldWith(
  dialog: HTMLElement,
  label: string,
  line?: string | RegExp,
) {
  const field = fieldOf(dialog, label)
  await expectField(field)
  if (line) {
    await expect(gapBelow(controlOf(field), lineOf(field, line))).toBe(
      formSpace.controlToHelper,
    )
  }
  return field
}

/** The buttons of the editor's bar: Cancel, then Save. */
export function barOf(stack: HTMLElement) {
  const bar = stack.lastElementChild as HTMLElement
  const [cancel, save] = within(bar).getAllByRole('button') as [
    HTMLElement,
    HTMLElement,
  ]
  return { bar, cancel, save }
}

/**
 * The bar at the end of an editor: the last field is `bodyToAction` (20) above
 * both buttons, which are `controlHeight` (48) tall, `inlineGap` (12) apart,
 * Cancel on the left of Save and Save on the right edge of the fields; the bar
 * draws no line and the body adds no padding under it.
 *
 * The last field is read at the end of the scroll (a short form is already
 * there).
 */
export async function expectBar({
  dialog,
  body,
  stack,
}: { dialog: HTMLElement; body: HTMLElement; stack: HTMLElement }) {
  await scrollToEnd(body)
  const { bar, cancel, save } = barOf(stack)
  const last = stack.children[stack.children.length - 2] as Element
  for (const button of [cancel, save]) {
    expectWithinHalfPixel(gapBelow(last, button), formSpace.bodyToAction)
    await expect(heightOf(button)).toBe(formSpace.controlHeight)
  }
  await expect(gapBeside(cancel, save)).toBe(formSpace.inlineGap)
  await expect(
    Math.abs(
      save.getBoundingClientRect().right - stack.getBoundingClientRect().right,
    ),
  ).toBeLessThanOrEqual(0.5)
  await expect(getComputedStyle(bar).borderTopWidth).toBe('0px')
  await expect(getComputedStyle(bar).borderBottomWidth).toBe('0px')
  await expect(getComputedStyle(body).paddingBottom).toBe('0px')
  await expectNoLines(dialog)
  return { bar, cancel, save }
}

/** Every gap between the children of the editor's stack (fields, then the bar) is the field gap (20). */
export async function expectFieldsApart(stack: HTMLElement) {
  const gaps = gapsBetweenChildren(stack)
  await expect(gaps.length).toBeGreaterThan(0)
  for (const gap of gaps) await expect(gap).toBe(formSpace.fieldGap)
}
