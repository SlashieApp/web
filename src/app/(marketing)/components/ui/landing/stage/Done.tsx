'use client'

import { useLayoutEffect, useRef } from 'react'
import { LuCheck } from 'react-icons/lu'

/** The tick on a settled button: 14px, in an even box. */
export const Tick = () => (
  <LuCheck size={14} strokeWidth={2.5} aria-hidden="true" />
)

/**
 * A tick and its label, centred in a button. The label's width is whatever
 * the font makes it, so the pair would sit on a half pixel and the tick would
 * hop as the label settles: the box is widened to the next even pixel, which
 * centres it on a whole one. Measured again once the web font is in.
 *
 * The scene's stylesheet lays the box out (an inline flex row, 6px apart).
 */
export function Done({
  label,
  className = 'sh-done',
}: { label: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  // biome-ignore lint/correctness/useExhaustiveDependencies: a new label is a new width
  useLayoutEffect(() => {
    const box = ref.current
    if (!box) return
    let live = true
    const fit = () => {
      if (!live) return
      box.style.minWidth = ''
      // The used width, in the stage's own pixels (a rect would be scaled).
      const width = Math.ceil(Number.parseFloat(getComputedStyle(box).width))
      if (width > 0) box.style.minWidth = `${width + (width % 2)}px`
    }
    fit()
    document.fonts?.ready.then(fit)
    return () => {
      live = false
    }
  }, [label])
  return (
    <span ref={ref} className={className}>
      <Tick />
      {label}
    </span>
  )
}
