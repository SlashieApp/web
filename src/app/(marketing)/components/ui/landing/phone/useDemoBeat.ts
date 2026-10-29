'use client'

import { useReducedMotion } from 'motion/react'
import { type CSSProperties, useCallback, useEffect, useState } from 'react'

/** Wait before the demo taps for the visitor, if they haven't. */
const AUTOPLAY_MS = 2600

export type DemoBeat = {
  /** Intro items are in place (drives the staggered entrance). */
  entered: boolean
  /** The screen's one interaction has happened (tapped or autoplayed). */
  done: boolean
  /** The visitor tapped the hotspot: play the beat, or replay it. */
  trigger: () => void
  reduced: boolean
}

/**
 * The state reduced motion rests a screen in: everything entered, and the beat
 * played (`done`) unless `jumpToDone` is false.
 */
export function reducedBeat(jumpToDone: boolean): {
  entered: boolean
  done: boolean
} {
  return { entered: true, done: jumpToDone }
}

/**
 * One screen's little script: items enter, then the beat plays on tap or
 * after a pause. Leaving the screen (`active` false) resets it, so it plays
 * again next time. Reduced motion jumps straight to the finished state.
 *
 * `intro` false starts already entered: use it for whatever is on screen at
 * first paint, so server HTML and no-JS visitors see the content.
 *
 * `jumpToDone` false is for a screen that should rest as its starting state
 * under reduced motion (the post screen: its finished state swaps the app bar
 * for a toast): it rests entered but not played, with its hotspot still there
 * to tap.
 */
export function useDemoBeat(
  active: boolean,
  intro = true,
  jumpToDone = true,
): DemoBeat {
  const reduced = Boolean(useReducedMotion())
  const [entered, setEntered] = useState(!intro)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (reduced) {
      const rest = reducedBeat(jumpToDone)
      setEntered(rest.entered)
      setDone(rest.done)
      return
    }
    if (!active) {
      setEntered(false)
      setDone(false)
      return
    }
    const enter = window.setTimeout(() => setEntered(true), 60)
    const play = window.setTimeout(() => setDone(true), AUTOPLAY_MS)
    return () => {
      window.clearTimeout(enter)
      window.clearTimeout(play)
    }
  }, [active, reduced, jumpToDone])

  const trigger = useCallback(() => {
    setEntered(true)
    setDone((value) => !value)
  }, [])

  return { entered, done, trigger, reduced }
}

/**
 * Types `text` out once `run` turns true (instantly under reduced motion,
 * and shows it whole when not running so server HTML has the full text).
 */
export function useTypewriter(
  text: string,
  run: boolean,
  reduced: boolean,
  delayMs = 300,
): string {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    if (!run || reduced) {
      setCount(null)
      return
    }
    setCount(0)
    let typed = 0
    let tick: number | undefined
    const start = window.setTimeout(() => {
      tick = window.setInterval(() => {
        typed += 1
        setCount(typed)
        if (typed >= text.length) window.clearInterval(tick)
      }, 34)
    }, delayMs)
    return () => {
      window.clearTimeout(start)
      window.clearInterval(tick)
    }
  }, [text, run, reduced, delayMs])

  return count === null ? text : text.slice(0, count)
}

/**
 * Staggered entrance for the nth item of a screen (transform + opacity only):
 * a fade with an 8px rise, like every other reveal on the page. (Under reduced
 * motion `PhoneFrame` zeroes every transition and animation inside the phone.)
 */
export function enterStyle(
  entered: boolean,
  index: number,
  distance = 8,
): CSSProperties {
  return {
    opacity: entered ? 1 : 0,
    transform: entered ? 'none' : `translateY(${distance}px)`,
    transition: `opacity 420ms cubic-bezier(0.2, 0, 0, 1) ${index * 70}ms, transform 420ms cubic-bezier(0.2, 0, 0, 1) ${index * 70}ms`,
  }
}
