import { findScrollParent } from '@/utils/findScrollParent'

import {
  BAR_H,
  type CollapseFrame,
  collapseFrame,
  collapseStart,
  titlePosition,
} from './headerCollapse'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** The parts of the header, found inside its frame by these attributes. */
const PART = {
  bar: '[data-sticky-header-bar]',
  row: '[data-sticky-header-row]',
  bg: '[data-sticky-header-bar-bg]',
  barTitle: '[data-sticky-header-bar-title]',
  traveller: '[data-sticky-header-traveller]',
  title: '[data-sticky-header-title]',
} as const

type PartName = keyof typeof PART

type WrittenStyle =
  | 'opacity'
  | 'transform'
  | 'marginTop'
  | 'marginLeft'
  | 'width'
  | 'pointerEvents'

/** What one frame reads from the page. */
type Rects = {
  title: DOMRect
  frame: DOMRect
  /** The bar's row: its left edge is the page's content edge. */
  row: DOMRect
  /** The row's top in the viewport once the bar is stuck. */
  barTop: number
}

/** Writes a style only when it changed, so a frame that changes nothing writes nothing. */
function setStyle(el: HTMLElement, name: WrittenStyle, value: string) {
  if (el.style[name] !== value) el.style[name] = value
}

const fixed = (value: number, digits: number) => value.toFixed(digits)

/**
 * Drives the collapsing header of a `StickyHeader` frame from the scroll of
 * the page's real scroll container (the app shell's pane, not always the
 * window): one passive listener, and requestAnimationFrame writes opacity and
 * transform straight onto the elements, so nothing re-renders per frame.
 *
 * The page's own heading stays where it is (the page's only h1). Once it
 * reaches the bar, a copy in the frame takes its place and moves into the
 * bar. The copy is `position: sticky`, so the scroll carries it up the 48px
 * natively and pins it at the bar copy's place; only its scale, its drift to
 * the right and the opacities are written here. Returns the cleanup.
 */
export function attachHeaderCollapse(frame: HTMLElement): () => void {
  const scroller = findScrollParent(frame)
  const target: HTMLElement | Window = scroller ?? window
  const reducedQuery = window.matchMedia(REDUCED_MOTION_QUERY)
  const resizeObserver =
    typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)

  let reduced = reducedQuery.matches
  // The bar's `top` once stuck. It is a responsive length, so read it.
  let barTop = 0
  let frameId = 0
  const parts: Partial<Record<PartName, HTMLElement | null>> = {}

  /** A part of the header, looked up again if React replaced it. */
  function part(name: PartName): HTMLElement | null {
    const known = parts[name]
    if (known?.isConnected) return known
    const found = frame.querySelector<HTMLElement>(PART[name])
    parts[name] = found
    if (found && name === 'title') resizeObserver?.observe(found)
    return found
  }

  function measureBar() {
    const bar = part('bar')
    barTop = bar ? Number.parseFloat(getComputedStyle(bar).top) || 0 : 0
  }

  function apply(state: CollapseFrame, rects: Rects, title: HTMLElement) {
    const barTitle = part('barTitle')
    const bg = part('bg')
    const traveller = part('traveller')
    if (barTitle) {
      setStyle(barTitle, 'opacity', fixed(state.barTitleOpacity, 3))
    }
    if (bg && frame.hasAttribute('data-over-media')) {
      setStyle(bg, 'opacity', fixed(state.barBgOpacity, 3))
      // Open to the map or cover until the bar has something to cover.
      setStyle(bg, 'pointerEvents', state.barBgOpacity > 0 ? 'auto' : 'none')
    }
    setStyle(title, 'opacity', state.moving ? '0' : '')
    if (!traveller) return
    if (!state.moving) {
      setStyle(traveller, 'opacity', '0')
      return
    }
    const rest = { x: rects.title.left, y: rects.title.top }
    const to = titlePosition(state.p, rest, {
      contentLeft: rects.row.left,
      rowTop: rects.barTop,
      // Over a map or cover Back is a chip inside the margin: the copy lands after it.
      chips: frame.hasAttribute('data-over-media'),
    })
    // Start the copy exactly on the heading: same place, same width.
    const top = rects.title.top - rects.frame.top
    const left = rects.title.left - rects.frame.left
    setStyle(traveller, 'marginTop', `${fixed(top, 2)}px`)
    setStyle(traveller, 'marginLeft', `${fixed(left, 2)}px`)
    setStyle(traveller, 'width', `${fixed(rects.title.width, 2)}px`)
    setStyle(
      traveller,
      'transform',
      state.p > 0
        ? `translateX(${fixed(to.x - rest.x, 2)}px) scale(${fixed(state.scale, 4)})`
        : '',
    )
    setStyle(traveller, 'opacity', fixed(state.movingOpacity, 3))
  }

  function update() {
    frameId = 0
    const title = part('title')
    const row = part('row')
    // A bar with no heading to collapse has nothing to drive.
    if (!title || !row) return

    const scrollY = scroller ? scroller.scrollTop : window.scrollY
    const scrollerTop = scroller
      ? scroller.getBoundingClientRect().top + scroller.clientTop
      : 0
    const stuckTop = scrollerTop + barTop
    const titleRect = title.getBoundingClientRect()
    const start = collapseStart({
      scrollY,
      titleTop: titleRect.top,
      barBottom: stuckTop + BAR_H,
    })
    apply(
      collapseFrame(scrollY, start, reduced),
      {
        title: titleRect,
        frame: frame.getBoundingClientRect(),
        row: row.getBoundingClientRect(),
        barTop: stuckTop,
      },
      title,
    )
  }

  function schedule() {
    if (!frameId) frameId = requestAnimationFrame(update)
  }

  const onResize = () => {
    measureBar()
    schedule()
  }
  const onReducedChange = () => {
    reduced = reducedQuery.matches
    schedule()
  }

  target.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', onResize)
  reducedQuery.addEventListener('change', onReducedChange)
  resizeObserver?.observe(frame)
  measureBar()
  schedule()

  return () => {
    target.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', onResize)
    reducedQuery.removeEventListener('change', onReducedChange)
    resizeObserver?.disconnect()
    if (frameId) cancelAnimationFrame(frameId)
    const title = parts.title
    if (title) setStyle(title, 'opacity', '')
  }
}
