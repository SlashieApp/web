/**
 * A bar pinned to the bottom of a scroller (a step flow's Back and Continue, a
 * drawer's Cancel and Save) must not cover the control that has keyboard focus
 * (WCAG 2.4.11, Focus Not Obscured). This tabs through what the scroller
 * holds, lets the browser scroll each control into view, and returns the ones
 * that end up under the bar, or closer to it than the 20 a field keeps from it.
 *
 * A control is the box a person sees: a radio card is its label, not the 1px
 * input inside it (`focusBoxOf`).
 */
import { userEvent } from 'storybook/test'

import { formSpace } from '@/theme/styles'

import { focusBoxOf } from './focusClearance'

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

function nameOf(el: HTMLElement) {
  return (
    el.getAttribute('aria-label') ||
    focusBoxOf(el).textContent ||
    el.getAttribute('name') ||
    el.tagName
  )
    .trim()
    .slice(0, 30)
}

/**
 * Tabs until focus reaches the bar (or `max` stops) and returns every control
 * outside the bar whose box is under it, below it, or closer than `clearance`
 * above it once focused. `radios` also walks each radio group it meets with the
 * arrow keys, as a person does (Tab reaches one radio, ArrowDown the rest), and
 * checks every card on the way: that changes the choice, so it is for a story
 * that may.
 */
export async function controlsUnderBar(
  bar: HTMLElement,
  {
    max = 60,
    radios = false,
    clearance = formSpace.bodyToAction,
  }: { max?: number; radios?: boolean; clearance?: number } = {},
): Promise<CoveredControl[]> {
  const doc = bar.ownerDocument
  const covered: CoveredControl[] = []
  const check = async (el: HTMLElement) => {
    const visible = focusBoxOf(el)
    await settle(visible)
    const box = visible.getBoundingClientRect()
    const barBox = bar.getBoundingClientRect()
    // A hair of slack: boxes sit on fractions of a pixel.
    if (box.bottom > barBox.top - clearance + 0.5) {
      covered.push({
        name: nameOf(el),
        top: Math.round(box.top),
        bottom: Math.round(box.bottom),
      })
    }
  }
  for (let i = 0; i < max; i += 1) {
    await userEvent.tab()
    const el = doc.activeElement as HTMLElement | null
    if (!el || el === doc.body) continue
    if (bar.contains(el)) break
    await check(el)
    if (radios && el instanceof HTMLInputElement && el.type === 'radio') {
      const group = [
        ...doc.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
      ].filter((radio) => radio.name === el.name && radio.form === el.form)
      for (let n = 1; n < group.length; n += 1) {
        await userEvent.keyboard('{ArrowDown}')
        const next = doc.activeElement as HTMLElement | null
        if (next) await check(next)
      }
    }
  }
  return covered
}
