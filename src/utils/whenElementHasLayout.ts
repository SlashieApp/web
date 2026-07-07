/**
 * Invoke `cb` once `node` has layout (non-zero size) — immediately when it
 * already does, otherwise on the first resize tick that reports a size.
 *
 * The task-detail page renders both form-factor views and gates them with CSS
 * `display` only, so refs still mount inside the hidden one. Guarding
 * expensive per-mount work (Mapbox GL instances, geolocation prompts,
 * Directions requests) on real layout keeps it to the visible view.
 *
 * One-shot by design: once created, the consumer owns the resource — a later
 * collapse back to zero size (breakpoint change) hides it via CSS only.
 *
 * Returns a cleanup that cancels a still-pending observer.
 */
export function whenElementHasLayout(
  node: HTMLElement,
  cb: () => void,
): () => void {
  const hasLayout = () => node.offsetWidth > 0 && node.offsetHeight > 0

  if (hasLayout() || typeof ResizeObserver === 'undefined') {
    cb()
    return () => {}
  }

  const observer = new ResizeObserver(() => {
    if (!hasLayout()) return
    observer.disconnect()
    cb()
  })
  observer.observe(node)
  return () => observer.disconnect()
}
