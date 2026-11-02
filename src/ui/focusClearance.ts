'use client'

import { type RefObject, useEffect } from 'react'

import { formSpace } from '@/theme/styles'

/**
 * The box a person sees for a focused control. A native input drawn as 1px by
 * its card (a radio card, a chip) is not what they see or what the focus ring
 * goes round: that is its label, so it is the label that has to be clear of the
 * bar. Any other control is its own box.
 */
export function focusBoxOf(target: HTMLElement): HTMLElement {
  if (!(target instanceof HTMLInputElement)) return target
  const { width, height } = target.getBoundingClientRect()
  if (width > 2 || height > 2) return target
  return target.closest('label') ?? target.labels?.[0] ?? target
}

/**
 * Keeps a control that takes keyboard focus clear of a bar pinned over the foot
 * of its scroller (a step flow's Back and Continue, a drawer's Cancel and Save),
 * WCAG 2.4.11 Focus Not Obscured.
 *
 * The scroller's `scroll-padding-bottom` (`pinnedBarClearance`: the bar and the
 * 20 the last field keeps from it) tells the browser where "visible" ends, but
 * the browser only acts on it when the control is fully out of view: a tall
 * control that is partly visible (a textarea with its lower part under the bar,
 * with the keyboard up and a short viewport) is left where it is, and the caret
 * line of a long text ends up behind the bar. So after a control takes focus,
 * when its box reaches into the bar or the 20 above it, it is scrolled with
 * `block: 'nearest'`, which honours the same padding: the smallest scroll that
 * puts its foot 20 above the bar. The box is the one the person sees
 * ({@link focusBoxOf}): a radio card, not the 1px input inside it, which the
 * browser would scroll to and which sits at the card's top.
 *
 * Only controls in the bar's own scroller are moved: a dialog that opens over a
 * page with a bar is not (its own body scrolls).
 */
export function keepFocusClearOfBar(bar: HTMLElement, target: Element) {
  if (!(target instanceof HTMLElement) || bar.contains(target)) return
  // A control in a dialog that does not hold the bar: that dialog's own scroll.
  const dialog = target.closest('[role="dialog"]')
  if (dialog && !dialog.contains(bar)) return
  const box = focusBoxOf(target)
  if (
    box.getBoundingClientRect().bottom <=
    bar.getBoundingClientRect().top - formSpace.bodyToAction
  )
    return
  box.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

/**
 * While the pinned bar is mounted, a control that takes focus and reaches under
 * it is scrolled clear (see {@link keepFocusClearOfBar}). It looks a frame after
 * the focus, so the browser's own scroll to the control has already happened.
 */
export function useKeepFocusClearOfBar(
  barRef: RefObject<HTMLElement | null>,
  active = true,
) {
  useEffect(() => {
    if (!active) return
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target
      requestAnimationFrame(() => {
        const bar = barRef.current
        if (!bar || !(target instanceof Element)) return
        if (target.ownerDocument.activeElement !== target) return
        // Keyboard focus, and the text fields a click also focuses: not a
        // button or chip a pointer is pressing, which would move out from under
        // it between press and release.
        if (!target.matches(':focus-visible')) return
        keepFocusClearOfBar(bar, target)
      })
    }
    document.addEventListener('focusin', onFocusIn)
    return () => document.removeEventListener('focusin', onFocusIn)
  }, [barRef, active])
}
