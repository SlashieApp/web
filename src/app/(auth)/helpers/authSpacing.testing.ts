/**
 * Layout measures for the auth page spacing stories (FE-481). They read the
 * card the way the spec does, between visible edges: the status icon, the
 * header (title and subtitle), then what the page puts under it.
 */
import { expect, userEvent, type within } from 'storybook/test'

import { gapBelow } from '@/ui/FormField/formGap.testing'

type Canvas = ReturnType<typeof within>

/**
 * The parts of an `AuthCard` the spacing checks start from. The card's column
 * holds, top to bottom: the status icon (status pages only), the header, a
 * notice (if any) and the page's body.
 */
export async function cardParts(canvas: Canvas) {
  const title = await canvas.findByRole('heading', { level: 1 })
  const header = title.parentElement as HTMLElement
  const column = header.parentElement as HTMLElement
  const siblings = [...column.children] as HTMLElement[]
  const at = siblings.indexOf(header)
  return {
    title,
    subtitle: title.nextElementSibling as HTMLElement,
    header,
    column,
    /** The status icon tile above the title: null on a form page. */
    icon: at > 0 ? siblings[at - 1] : null,
    /** Everything under the header, top to bottom. */
    below: siblings.slice(at + 1),
  }
}

/** The form's column of fields (a `FormStack` inside the `<form>`). */
export function formColumn(body: HTMLElement): HTMLElement {
  const form = body.tagName === 'FORM' ? body : body.querySelector('form')
  return (form as HTMLElement).firstElementChild as HTMLElement
}

/** The gaps between the direct children of `parent`, top to bottom. */
export function gapsBetweenChildren(parent: Element): number[] {
  const kids = [...parent.children]
  return kids.slice(1).map((kid, i) => gapBelow(kids[i], kid))
}

/** The bordered control inside a field, which is what the 48 height is on. */
export function controlShell(field: Element): HTMLElement {
  return (field.querySelector('input') as HTMLElement)
    .parentElement as HTMLElement
}

/**
 * Tabs to a link whose 44px target is grown by padding and checks that its
 * keyboard ring hugs the text line (the label, 20 tall) instead of being drawn
 * around the whole grown box.
 */
export async function expectRingHugsLabel(link: HTMLElement) {
  for (let i = 0; i < 12 && document.activeElement !== link; i += 1) {
    await userEvent.tab()
  }
  await expect(link).toHaveFocus()
  const label = link.querySelector('[data-hit-area-label]') as HTMLElement
  await expect(label).not.toBeNull()
  await expect(getComputedStyle(link).outlineStyle).toBe('none')
  await expect(getComputedStyle(label).outlineStyle).toBe('solid')
  await expect(getComputedStyle(label).outlineWidth).toBe('2px')
  await expect(label.getBoundingClientRect().height).toBe(20)
  // The ring's box is inside the grown target, with room above and below.
  const target = link.getBoundingClientRect()
  const text = label.getBoundingClientRect()
  await expect(target.height).toBeGreaterThan(text.height)
  await expect(text.top).toBeGreaterThanOrEqual(target.top)
  await expect(text.bottom).toBeLessThanOrEqual(target.bottom)
}
