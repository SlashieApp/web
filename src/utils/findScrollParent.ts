/**
 * Nearest scrollable ancestor of `node`. In the app shell this is the content
 * pane (`overflow-y: auto`), not the window, which never scrolls. Returns
 * null when none is found so callers can fall back to the window.
 */
export function findScrollParent(node: HTMLElement): HTMLElement | null {
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
