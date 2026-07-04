'use client'

import {
  type RefObject,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

/**
 * Nearest scrollable ancestor of `node` — in the (task) app shell this is the
 * content pane (`overflow-y: auto`), NOT the window (which never scrolls in
 * this shell). Returns null if none is found, so callers can fall back to the
 * window.
 */
function findScrollParent(node: HTMLElement): HTMLElement | null {
  let el = node.parentElement
  while (el) {
    const overflowY = getComputedStyle(el).overflowY
    if (
      overflowY === 'auto' ||
      overflowY === 'scroll' ||
      overflowY === 'overlay'
    ) {
      return el
    }
    el = el.parentElement
  }
  return null
}

/**
 * Collapsed flag for the task-detail header + map, driven by the ACTUAL scroll
 * container resolved from `ref` — the app-shell content pane, since the window
 * stays at scrollY 0 in this layout (this is why the old window-based hook
 * never fired). Hysteresis (collapse past `collapseAt`, expand only back near
 * the top) keeps the collapse animation — which shrinks the header and thus
 * the scroll height — from oscillating the state. Only re-renders on flip.
 */
export function useScrollContainerCollapsed(
  ref: RefObject<HTMLElement | null>,
  collapseAt = 96,
  expandAt = 8,
): boolean {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const scroller = findScrollParent(node)
    const target: HTMLElement | Window = scroller ?? window
    const readY = () => (scroller ? scroller.scrollTop : window.scrollY)

    // Disable scroll anchoring on the pane. As the header collapses/expands it
    // changes height ABOVE the viewport content; scroll anchoring would then
    // shift scrollTop by that delta to keep content stable, re-crossing the
    // threshold and flip-flopping the state forever. Opting the scroller out
    // stops the browser from compensating, so scrollTop stays put.
    const prevAnchor = scroller?.style.overflowAnchor
    if (scroller) scroller.style.overflowAnchor = 'none'

    let isCollapsed = false
    const onScroll = () => {
      const y = readY()
      const next = isCollapsed ? y > expandAt : y > collapseAt
      if (next !== isCollapsed) {
        isCollapsed = next
        setCollapsed(next)
      }
    }

    onScroll()
    target.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      target.removeEventListener('scroll', onScroll)
      if (scroller) scroller.style.overflowAnchor = prevAnchor ?? ''
    }
  }, [ref, collapseAt, expandAt])

  return collapsed
}

const HeaderCollapsedContext = createContext(false)

/** Provides the collapsed flag to the header + map background subtree. */
export const TaskDetailHeaderCollapsedProvider = HeaderCollapsedContext.Provider

/** Reads the collapsed flag published by {@link TaskDetailHeaderCollapsedProvider}. */
export function useTaskDetailHeaderCollapsed(): boolean {
  return useContext(HeaderCollapsedContext)
}
