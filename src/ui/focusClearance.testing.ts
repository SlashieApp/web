/**
 * A bar pinned to the bottom of a scroller (a step flow's Back and Continue, a
 * drawer's Cancel and Save) must not cover the control that has keyboard focus
 * (WCAG 2.4.11, Focus Not Obscured). This tabs through what the scroller
 * holds, lets the browser scroll each control into view, and returns the ones
 * that end up under the bar.
 */
import { userEvent } from 'storybook/test'

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

/** Waits for a (smooth) scroll to finish: the control's top stops moving. */
async function settle(el: Element) {
  let last = Number.NaN
  let still = 0
  for (let i = 0; i < 90 && still < 3; i += 1) {
    await nextFrame()
    const top = el.getBoundingClientRect().top
    still = top === last ? still + 1 : 0
    last = top
  }
}

export type CoveredControl = { name: string; top: number; bottom: number }

/**
 * Tabs until focus reaches the bar (or `max` stops) and returns every control
 * outside the bar whose box reaches under it once focused. `bar` is the pinned
 * element; `inside` limits the walk to controls within a container.
 */
export async function controlsUnderBar(
  bar: HTMLElement,
  { max = 60 }: { max?: number } = {},
): Promise<CoveredControl[]> {
  const doc = bar.ownerDocument
  const covered: CoveredControl[] = []
  for (let i = 0; i < max; i += 1) {
    await userEvent.tab()
    const el = doc.activeElement as HTMLElement | null
    if (!el || el === doc.body) continue
    if (bar.contains(el)) break
    await settle(el)
    const box = el.getBoundingClientRect()
    const barBox = bar.getBoundingClientRect()
    if (box.bottom > barBox.top && box.top < barBox.bottom) {
      covered.push({
        name: (
          el.getAttribute('aria-label') ||
          el.textContent ||
          el.getAttribute('name') ||
          el.tagName
        )
          .trim()
          .slice(0, 30),
        top: Math.round(box.top),
        bottom: Math.round(box.bottom),
      })
    }
  }
  return covered
}
