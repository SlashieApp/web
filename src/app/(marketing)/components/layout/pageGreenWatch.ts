/**
 * When the marketing header's Get started gives way to the page's own green
 * action (tone refresh, train 2: one green main action per screen, marketing
 * included).
 *
 * The header's action is the green primary once the header is solid. A page
 * that carries a green action of its own marks that button with
 * `data-page-green-action`: the hero's Search pill, the closing call's Post a
 * task pill, the paid plan's action on /pricing. While one of those buttons is
 * on screen the header's action stays secondary, so the screen has one green
 * fill. The moment none is on screen the header's action is the green one
 * again, so the screen is never left without a green main action. On a page
 * with no such button (the legal pages) it is the screen's one green button.
 *
 * It watches the buttons, not the sections around them: a hero that is half
 * under the header, or a close whose pill has not come in yet, must not keep
 * the header quiet while no green is on screen.
 *
 * The page marks its buttons with the hook; this module watches them with one
 * IntersectionObserver. A button can arrive after the header (the pricing
 * page streams in behind its loading frame) or leave with its page, so a
 * MutationObserver picks up marked buttons as they come and go. The logic is
 * plain functions, so it is unit-tested without a browser.
 */

/** The hook on a page's own green action. */
export const PAGE_GREEN_ACTIONS = '[data-page-green-action]'

/**
 * The sticky header covers the top of the screen, so a button under it is not
 * on screen: the observer's root starts below the tallest header (64px).
 */
export const PAGE_GREEN_ROOT_MARGIN = '-64px 0px 0px 0px'

export type PageGreenOptions = {
  /** Selector list of the buttons that are the page's green action. */
  actions?: string
  onChange: (inView: boolean) => void
}

/** Whether a changed node is, or holds, a marked button. */
function touchesAction(node: Node, actions: string): boolean {
  if (node.nodeType !== 1) return false
  const element = node as Element
  return element.matches(actions) || element.querySelector(actions) !== null
}

/**
 * Reports whether any marked green action is on screen, once at the start
 * (the observer reports every target when it begins, so a reload part way down
 * the page is right at once) and again whenever that changes. Returns the
 * cleanup. A page with no such button reports `false`, and so does a browser
 * without IntersectionObserver.
 */
export function watchPageGreen(
  { actions = PAGE_GREEN_ACTIONS, onChange }: PageGreenOptions,
  root: ParentNode = document,
): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    onChange(false)
    return () => {}
  }

  const watched = new Set<Element>()
  const inView = new Set<Element>()
  let last: boolean | null = null

  const report = () => {
    const visible = inView.size > 0
    if (visible === last) return
    last = visible
    onChange(visible)
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) inView.add(entry.target)
        else inView.delete(entry.target)
      }
      report()
    },
    { rootMargin: PAGE_GREEN_ROOT_MARGIN },
  )

  /** Picks up the marked buttons that arrived and drops the ones that left. */
  const scan = () => {
    for (const target of root.querySelectorAll(actions)) {
      if (watched.has(target)) continue
      watched.add(target)
      observer.observe(target)
    }
    for (const target of watched) {
      if (target.isConnected) continue
      watched.delete(target)
      inView.delete(target)
      observer.unobserve(target)
    }
    report()
  }
  scan()

  const mutations =
    typeof MutationObserver === 'undefined'
      ? null
      : new MutationObserver((records) => {
          const changed = records.some((record) =>
            [...record.addedNodes, ...record.removedNodes].some((node) =>
              touchesAction(node, actions),
            ),
          )
          if (changed) scan()
        })
  mutations?.observe(root, { childList: true, subtree: true })

  return () => {
    observer.disconnect()
    mutations?.disconnect()
  }
}
