'use client'

import { type RefObject, useEffect } from 'react'

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
 * when its box reaches under the bar, it is scrolled with `block: 'nearest'`,
 * which honours the same padding: the smallest scroll that puts its foot above
 * the bar, with the 20 between.
 *
 * Only controls in the bar's own scroller are moved: a dialog that opens over a
 * page with a bar is not (its own body scrolls).
 */
export function keepFocusClearOfBar(bar: HTMLElement, target: Element) {
  if (!(target instanceof HTMLElement) || bar.contains(target)) return
  // A control in a dialog that does not hold the bar: that dialog's own scroll.
  const dialog = target.closest('[role="dialog"]')
  if (dialog && !dialog.contains(bar)) return
  if (target.getBoundingClientRect().bottom <= bar.getBoundingClientRect().top)
    return
  target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
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
