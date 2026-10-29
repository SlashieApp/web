'use client'

import {
  type CSSProperties,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react'

import { sdlMotion } from '@/theme/styles'

import { REVEAL_MS, REVEAL_RISE_PX } from '../Reveal'

/**
 * Where a bento snippet is in its entrance:
 *
 *   - `static`   the finished state, no motion. Server HTML, no-JS visitors,
 *                reduced motion, and a snippet that is already on screen (or
 *                behind the visitor) at hydration all stay here.
 *   - `waiting`  hydrated, below the fold and motion allowed: the rows are
 *                held back (opacity and a rise only, so nothing shifts).
 *   - `playing`  the snippet has come into view: the rows fade in with the
 *                same 8px rise as `Reveal`, staggered, once.
 */
export type SnippetPhase = 'static' | 'waiting' | 'playing'

/** Stagger between the rows of one snippet, in ms. */
export const SNIPPET_STAGGER_MS = 70

/**
 * Drives a snippet's entrance. Like `Reveal`, it is safe without JavaScript:
 * the server renders the finished snippet and only after hydration, and only
 * when the snippet is below the fold and motion is allowed, are the rows held
 * back until it scrolls into view.
 */
export function useSnippetEntrance<T extends HTMLElement = HTMLDivElement>(): {
  ref: RefObject<T | null>
  phase: SnippetPhase
} {
  const ref = useRef<T>(null)
  const [phase, setPhase] = useState<SnippetPhase>('static')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (typeof IntersectionObserver === 'undefined') return
    // On screen (or nearly), or already scrolled past, at hydration: leave it
    // as it is, so nothing hides and shows again.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return

    setPhase('waiting')
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setPhase('playing')
        observer.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  return { ref, phase }
}

/**
 * The entrance style of the nth row of a snippet: held back while `waiting`,
 * a fade with an 8px rise over 400ms on the decelerate curve once `playing`,
 * and no style at all when `static`. Transform and opacity only.
 */
export function snippetEnter(
  phase: SnippetPhase,
  index: number,
): CSSProperties | undefined {
  if (phase === 'static') return undefined
  if (phase === 'waiting') {
    return { opacity: 0, transform: `translateY(${REVEAL_RISE_PX}px)` }
  }
  const delay = index * SNIPPET_STAGGER_MS
  return {
    opacity: 1,
    transform: 'none',
    transition: [
      `opacity ${REVEAL_MS}ms ${sdlMotion.easing.decelerate} ${delay}ms`,
      `transform ${REVEAL_MS}ms ${sdlMotion.easing.decelerate} ${delay}ms`,
    ].join(', '),
  }
}

/**
 * The accepted check's confirmation: it scales in on the emphasis curve (the
 * one easing the SDL keeps for "quote accepted"), after the row it sits in.
 */
export function snippetConfirm(
  phase: SnippetPhase,
  index: number,
): CSSProperties | undefined {
  if (phase === 'static') return undefined
  if (phase === 'waiting') return { opacity: 0, transform: 'scale(0.6)' }
  const delay = index * SNIPPET_STAGGER_MS + REVEAL_MS / 2
  return {
    opacity: 1,
    transform: 'none',
    transition: [
      `opacity ${sdlMotion.duration.slow} ${sdlMotion.easing.standard} ${delay}ms`,
      `transform ${sdlMotion.duration.map} ${sdlMotion.easing.emphasis} ${delay}ms`,
    ].join(', '),
  }
}
