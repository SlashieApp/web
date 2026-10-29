/**
 * When the floating "Post a task" pill shows (tone refresh, train 2, item 8).
 *
 * The pill appears once the hero is out of view (scrolled past, above the
 * screen) and hides while the final call to action or the footer is in view,
 * because both already offer the same action on the page. The page marks its
 * blocks with hooks; this module watches them with one IntersectionObserver.
 * The rules are pure functions so they can be unit-tested without a browser.
 */

/** The hero section: `HeroSection` carries this attribute. */
export const FLOATING_PILL_HERO = '[data-landing-hero]'

/**
 * The blocks that hide the pill while any is in view: the final call to action
 * (`FinalCtaBand` carries this attribute) and the page footer.
 */
export const FLOATING_PILL_HIDE_WHILE = '[data-final-cta], footer'

/** The part of an observer entry the rules read. */
export type PillEntry = Pick<
  IntersectionObserverEntry,
  'isIntersecting' | 'boundingClientRect' | 'rootBounds'
>

/**
 * Whether the hero has been scrolled past: none of it is on screen and it
 * lies above the top edge. A hero below the screen (it never is on the page)
 * does not count, so the pill never shows before the visitor has seen it.
 */
export function heroIsAbove(entry: PillEntry): boolean {
  if (entry.isIntersecting) return false
  const top = entry.rootBounds?.top ?? 0
  return entry.boundingClientRect.bottom <= top
}

/** The pill shows once the hero is above, unless an end block is in view. */
export function shouldShowPill(state: {
  heroAbove: boolean
  endBlocksInView: number
}): boolean {
  return state.heroAbove && state.endBlocksInView === 0
}

export type PillWatchOptions = {
  /** Selector of the hero. */
  hero: string
  /** Selector list of the blocks that hide the pill while in view. */
  hideWhile: string
  onChange: (visible: boolean) => void
}

/**
 * Watches the page and reports whether the pill should show, once at the
 * start (the observer reports every target when it begins, so a reload part
 * way down the page is right at once) and again whenever that changes.
 * Returns the cleanup. With no hero on the page the hero counts as scrolled
 * past; without IntersectionObserver the pill stays hidden.
 */
export function watchFloatingPill(
  { hero, hideWhile, onChange }: PillWatchOptions,
  root: ParentNode = document,
): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {}

  const heroBlock = root.querySelector(hero)
  const endBlocks = [...root.querySelectorAll(hideWhile)].filter(
    (block) => block !== heroBlock,
  )
  const inView = new Set<Element>()
  let heroAbove = heroBlock === null
  let last: boolean | null = null

  const report = () => {
    const visible = shouldShowPill({
      heroAbove,
      endBlocksInView: inView.size,
    })
    if (visible === last) return
    last = visible
    onChange(visible)
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === heroBlock) {
        heroAbove = heroIsAbove(entry)
      } else if (entry.isIntersecting) {
        inView.add(entry.target)
      } else {
        inView.delete(entry.target)
      }
    }
    report()
  })

  if (heroBlock) observer.observe(heroBlock)
  for (const block of endBlocks) observer.observe(block)
  // Nothing to observe: there is nothing to wait for either.
  if (!heroBlock && endBlocks.length === 0) report()

  return () => observer.disconnect()
}
