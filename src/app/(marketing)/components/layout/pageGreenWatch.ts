/**
 * When the marketing header's Get started gives way to the page's own green
 * action (tone refresh, train 2: one green main action per screen, marketing
 * included).
 *
 * The header's action is the green primary once the header is solid. Two
 * blocks of a marketing page carry a green action of their own: the landing's
 * hero (the Search pill) and the closing call to action (the Post a task pill;
 * the landing and /about both end with it). While either is on screen the
 * header's action stays secondary, so the screen has one green fill. On a page
 * with neither (/pricing, the legal pages) the header's action is the screen's
 * one green button.
 *
 * The page marks its blocks with hooks; this module watches them with one
 * IntersectionObserver. Pure functions, so they are unit-tested without a
 * browser.
 */

/** The hero (`HeroSection`) and the closing call (`FinalCtaBand`). */
export const PAGE_GREEN_BLOCKS = '[data-landing-hero], [data-final-cta]'

/**
 * The sticky header covers the top of the screen, so a block under it is not
 * on screen: the observer's root starts below the tallest header (64px).
 */
export const PAGE_GREEN_ROOT_MARGIN = '-64px 0px 0px 0px'

export type PageGreenOptions = {
  /** Selector list of the blocks that carry the page's green action. */
  blocks?: string
  onChange: (inView: boolean) => void
}

/**
 * Reports whether any block with the page's green action is on screen, once at
 * the start (the observer reports every target when it begins, so a reload
 * part way down the page is right at once) and again whenever that changes.
 * Returns the cleanup. A page with no such block reports `false`, and so does
 * a browser without IntersectionObserver.
 */
export function watchPageGreen(
  { blocks = PAGE_GREEN_BLOCKS, onChange }: PageGreenOptions,
  root: ParentNode = document,
): () => void {
  const targets = [...root.querySelectorAll(blocks)]
  if (typeof IntersectionObserver === 'undefined' || targets.length === 0) {
    onChange(false)
    return () => {}
  }

  const inView = new Set<Element>()
  let last: boolean | null = null

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) inView.add(entry.target)
        else inView.delete(entry.target)
      }
      const visible = inView.size > 0
      if (visible === last) return
      last = visible
      onChange(visible)
    },
    { rootMargin: PAGE_GREEN_ROOT_MARGIN },
  )
  for (const target of targets) observer.observe(target)

  return () => observer.disconnect()
}
