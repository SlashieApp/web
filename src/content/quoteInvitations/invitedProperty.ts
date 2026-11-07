/**
 * `invited: true` for the existing quote-sent event when the worker was asked
 * to quote on this task (`task.viewerQuoteInvitation` exists, also after Not
 * for me). Nothing is added otherwise, so events from quotes nobody asked for
 * keep their old shape (FE-507).
 */
export function invitedProperty(
  task: { viewerQuoteInvitation?: object | null } | null | undefined,
): { invited: true } | Record<string, never> {
  return task?.viewerQuoteInvitation ? { invited: true } : {}
}
