'use client'

import { useLayoutEffect, useState } from 'react'
import { flushSync } from 'react-dom'

import {
  bareHeaderHeight,
  descriptionFitsPinned,
  dialogScrollsWhole,
  minBodyHeight,
} from './descriptionPin'

/** The panel's border, top and bottom: its maximum height includes both. */
const PANEL_BORDER = 1

type Measures = {
  header: number
  /** The title block alone: the header less the description when it is in the header. */
  bare: number
  footer: number
  description: number
  /** The room the panel can take: the window less the positioner's padding. */
  room: number
}

/** Nothing measured yet: all the room there is, so the description is pinned. */
const UNMEASURED: Measures = {
  header: 0,
  bare: 0,
  footer: 0,
  description: 0,
  room: Number.POSITIVE_INFINITY,
}

/**
 * Where a `Modal` draws its description (see `descriptionPin`): under the title
 * while the panel has room for the header with it, the bar and a body of any
 * use, else the first block of the scrolling body. The same choice the app's
 * `Dialog` makes, from the same numbers. It also says whether the dialog has to
 * scroll as a whole: only when the title block, the bar and a body of any use do
 * not fit even with the description in the body (`dialogScrollsWhole`).
 *
 * It measures what the browser laid out (the header, the bar, the description
 * wherever it is, and the room the window leaves the panel) and decides before
 * the first paint, so a dialog that opens with a long description never shows
 * the bar outside its panel for a frame. It looks again whenever any of them
 * changes size (a text that wraps, a button that wraps) and, synchronously,
 * when the window changes size: the resize event is handled before the frame
 * that has the new size is drawn, so a window that shrinks across the line
 * never shows one frame of the pinned layout in the smaller panel with the bar
 * outside it.
 * Only layout sizes are read (`offsetHeight`), which the dialog's scale-in
 * animation does not change. The state is dropped when the dialog is gone, so
 * the next open starts pinned.
 *
 * Give each ref to its element: `positioner` (the dialog's positioner, which
 * the panel's maximum height is a share of), `header`, `footer` (when there is
 * one) and `description`.
 */
export function useDescriptionPin({
  hasDescription,
  hasBody,
  showFooter,
}: {
  hasDescription: boolean
  hasBody: boolean
  showFooter: boolean
}) {
  // The nodes are state, so the measuring effect runs again when one is
  // swapped (the description is a new element when it moves); the setters are
  // the ref callbacks.
  const [positioner, positionerRef] = useState<HTMLElement | null>(null)
  const [header, headerRef] = useState<HTMLElement | null>(null)
  const [footer, footerRef] = useState<HTMLElement | null>(null)
  const [description, descriptionRef] = useState<HTMLElement | null>(null)
  const [measures, setMeasures] = useState<Measures>(UNMEASURED)
  const [pinned, setPinned] = useState(true)

  useLayoutEffect(() => {
    if (!positioner || !header) {
      setMeasures(UNMEASURED)
      setPinned(true)
      return
    }
    const measure = () => {
      const style = getComputedStyle(positioner)
      const descriptionHeight = description?.offsetHeight ?? 0
      const next: Measures = {
        header: header.offsetHeight,
        bare: bareHeaderHeight({
          header: header.offsetHeight,
          description: descriptionHeight,
          descriptionInHeader:
            description != null && header.contains(description),
        }),
        footer: footer?.offsetHeight ?? 0,
        description: descriptionHeight,
        room:
          positioner.clientHeight -
          Number.parseFloat(style.paddingTop) -
          Number.parseFloat(style.paddingBottom),
      }
      setMeasures((was) =>
        was.header === next.header &&
        was.bare === next.bare &&
        was.footer === next.footer &&
        was.description === next.description &&
        was.room === next.room
          ? was
          : next,
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    for (const node of [positioner, header, footer, description]) {
      if (node) observer.observe(node)
    }
    // The window's own resize: measure and render now, before the frame that
    // has the new size is drawn. A ResizeObserver reports after layout and its
    // state update renders after that frame, so a window that shrank across
    // the line would show one frame of the pinned layout in the smaller panel
    // with the bar outside it. The resize event comes first in the frame; the
    // layout effect below then chooses the pin from these measures, in the same
    // synchronous pass.
    const onResize = () => flushSync(measure)
    window.addEventListener('resize', onResize)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [positioner, header, footer, description])

  // No description: nothing to place.
  const fits =
    !hasDescription ||
    descriptionFitsPinned({
      pinned,
      header: measures.header,
      description: measures.description,
      footer: showFooter ? measures.footer : 0,
      minBody: minBodyHeight(hasBody),
      available: measures.room - PANEL_BORDER * 2,
    })
  useLayoutEffect(() => {
    setPinned(fits)
  }, [fits])

  return {
    /** Draw the description as the first block of the body, not under the title. */
    descriptionInBody: hasDescription && !pinned,
    /**
     * Scroll the dialog as a whole: not even the title block, the bar and a body
     * of any use fit, so the body between the bars would have no room.
     */
    scrollsWhole: dialogScrollsWhole({
      bareHeader: measures.bare,
      footer: showFooter ? measures.footer : 0,
      minBody: minBodyHeight(hasBody),
      available: measures.room - PANEL_BORDER * 2,
    }),
    positionerRef,
    headerRef,
    footerRef,
    descriptionRef,
  }
}
