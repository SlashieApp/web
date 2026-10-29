/**
 * Layout measures for the account dialog spacing stories (FE-481). They read an
 * open dialog the way the spec does, between visible edges: the title, the
 * description 8 under it, the first field or block 24 under that, fields 20
 * apart, and the last one 20 above the buttons.
 */
import { expect, waitFor, within } from 'storybook/test'

import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

/**
 * A phone 390 wide (the width the app's phone layouts are checked at). Spread it
 * into a story: `{ ...phone390 }`. Storybook's own "mobile1" is 320.
 */
export const phone390 = {
  parameters: {
    viewport: {
      options: {
        phone390: {
          name: 'Phone 390',
          styles: { width: '390px', height: '844px' },
          type: 'mobile',
        },
      },
    },
  },
  globals: { viewport: { value: 'phone390', isRotated: false } },
} as const

/** The story really is phone width: a check that a phone story is not measuring a desktop. */
export function expectPhoneWidth(canvasElement: HTMLElement) {
  expect(canvasElement.ownerDocument.defaultView?.innerWidth).toBe(390)
}

/** The open dialog called `name` (its title), settled, with the parts of its frame. */
export async function openDialog(
  canvasElement: HTMLElement,
  name: string | RegExp,
) {
  const page = within(canvasElement.ownerDocument.body)
  const dialog = await page.findByRole('dialog', { name }, { timeout: 3000 })
  await waitFor(() => expect(dialog).toBeVisible(), { timeout: 3000 })
  // The dialog scales in: measure once it has settled.
  await waitFor(() => expect(dialog.getAnimations()).toHaveLength(0), {
    timeout: 3000,
  })
  const part = (cls: string) => dialog.querySelector(cls) as HTMLElement | null
  return {
    dialog,
    title: within(dialog).getByRole('heading', { name }),
    /** The description under the title: null when the dialog has none. */
    description: part('[data-part="description"]'),
    body: part('.chakra-dialog__body') as HTMLElement,
    footer: part('.chakra-dialog__footer') as HTMLElement | null,
  }
}

/** The `FormField` root of the field with this label. */
export function fieldOf(dialog: HTMLElement, label: string) {
  return within(dialog).getByText(label, { selector: 'label' })
    .parentElement as HTMLElement
}

/** The bordered control of a field: what the 48 height is on. */
export function shellOf(field: HTMLElement) {
  return (field.querySelector('input') as HTMLElement)
    .parentElement as HTMLElement
}

/** The field's label, which sits 8 above its control. */
export function labelOf(field: HTMLElement) {
  return field.querySelector('label') as HTMLElement
}

/** A button of the bar under the body, by name (not the close button in the header). */
export function barButton(dialog: HTMLElement, name: string) {
  const bar = dialog.querySelector('.chakra-dialog__footer') as HTMLElement
  return within(bar ?? dialog).getByRole('button', { name })
}

/** The gaps between the direct children of `parent`, top to bottom. */
export function gapsBetweenChildren(parent: Element): number[] {
  const kids = [...parent.children]
  return kids.slice(1).map((kid, i) => gapBelow(kids[i], kid))
}

/** The dialog's body column: the `FormStack` (or block) the callers put in the body. */
export function bodyColumn(body: HTMLElement): HTMLElement {
  return body.firstElementChild?.firstElementChild as HTMLElement
}

/** No horizontal scroll in the dialog's body: nothing is wider than the dialog. */
export function expectNoHorizontalOverflow(body: HTMLElement) {
  expect(body.scrollWidth).toBeLessThanOrEqual(body.clientWidth)
}

/**
 * "Sign in again first" (`ReauthPrompt`): the sentence 8 above Google, Google 8
 * above Apple, both 48 tall and as wide as each other. Returns the pieces so the caller can place the
 * block among its other parts. Apple's button only renders when a Services ID
 * is set, so without it there is nothing to measure and this returns null.
 */
export async function expectReauthPrompt(
  dialog: HTMLElement,
  sentence: RegExp,
) {
  const text = within(dialog).getByText(sentence)
  const apple = within(dialog).queryByRole('button', {
    name: 'Continue with Apple',
  })
  if (!apple) return null
  // Google's widget sits in its own container, above Apple's button.
  const google = apple.previousElementSibling as HTMLElement
  await expect(gapBelow(text, google)).toBe(formSpace.labelToControl)
  await expect(gapBelow(google, apple)).toBe(formSpace.alternativesGap)
  for (const button of [google, apple]) {
    await expect(heightOf(button)).toBe(formSpace.controlHeight)
  }
  // The same width too: Google's widget (drawn at 40 and scaled to 48) follows
  // its container, so it must not be measured while the dialog scales in.
  await waitFor(() => expect(google.firstElementChild).not.toBeNull())
  const widget = google.firstElementChild as HTMLElement
  await expect(
    Math.abs(
      widget.getBoundingClientRect().width -
        apple.getBoundingClientRect().width,
    ),
  ).toBeLessThan(1.5)
  return { text, google, apple }
}
