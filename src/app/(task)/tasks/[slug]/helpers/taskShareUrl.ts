/**
 * The link a task is shared with: its own address, `/tasks/{id}` with the
 * page's language prefix, and nothing else (FE-475). Never the page's own
 * address: after Search that carries the sharer's map position
 * (`?from=search&lat=..&lng=..`), and the recipient's map would draw a route
 * from it.
 */
export function taskShareUrl(
  taskId: string,
  localize: (href: string) => string,
  origin: string,
): string {
  return new URL(localize(`/tasks/${encodeURIComponent(taskId)}`), origin).href
}
