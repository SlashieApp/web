/**
 * Whether the 3D scene can be seen (tone refresh, train 2).
 *
 * The scene is a fixed layer behind the whole page, and most of the page is
 * opaque panels (the map panel, the bento, the trust row, the pricing teaser,
 * the footer) that hide it. Only three blocks are transparent: the hero, how
 * it works (both acts) and the close. While none of them is on screen no prop
 * can be seen, so the scene stops drawing (GPU and battery) until one is.
 * The page marks the blocks with hooks; this module watches them with one
 * IntersectionObserver. Pure functions, unit-tested without a browser.
 */

/** The hero (`HeroSection`), how it works (`LandingStory`) and the close (`FinalCtaBand`). */
export const SCENE_BLOCKS =
  '[data-landing-hero], [data-how-it-works], [data-final-cta]'

/** The hero alone: its formation of props is only for as long as it is on screen. */
export const SCENE_HERO = '[data-landing-hero]'

/**
 * The sticky header (64px at most) is opaque once the page has scrolled, so a
 * block only under it does not show a prop: the observer's root starts below it.
 */
export const SCENE_ROOT_MARGIN = '-64px 0px 0px 0px'

/**
 * Reports whether any block that shows the scene is on screen, and whether the
 * hero is, once at the start (the observer reports every target when it begins,
 * so a reload part way down the page is right at once) and again whenever
 * either changes. Returns the cleanup. With no such block, or without
 * IntersectionObserver, the scene counts as visible and the hero as in view (it
 * draws, as it did before).
 */
export function watchSceneBlocks(
  onChange: (visible: boolean, heroInView: boolean) => void,
  root: ParentNode = document,
): () => void {
  const targets = [...root.querySelectorAll(SCENE_BLOCKS)]
  if (typeof IntersectionObserver === 'undefined' || targets.length === 0) {
    onChange(true, true)
    return () => {}
  }

  // A page with no hero never leaves the hero's formation.
  const hero = root.querySelector(SCENE_HERO)
  const inView = new Set<Element>()
  let last: { visible: boolean; heroInView: boolean } | null = null

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) inView.add(entry.target)
        else inView.delete(entry.target)
      }
      const visible = inView.size > 0
      const heroInView = hero === null || inView.has(hero)
      if (last?.visible === visible && last.heroInView === heroInView) return
      last = { visible, heroInView }
      onChange(visible, heroInView)
    },
    { rootMargin: SCENE_ROOT_MARGIN },
  )
  for (const target of targets) observer.observe(target)

  return () => observer.disconnect()
}
