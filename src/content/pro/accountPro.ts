/**
 * Whether the account has Slashie Pro now: the API's `me.membership.hasPro`
 * and nothing else (BE-145: Pro belongs to the account, not the worker
 * record). It is the gate for the customer's Pro features (Ryan 22 Nov,
 * BE-149): marking a task urgent, choosing a budget unit, asking up to 30
 * workers per task, and Find worker. Never a worker-only check.
 *
 * The screen only decides what to offer: the API checks each one itself and
 * answers `PRO_REQUIRED`.
 */
export function accountHasPro(
  me: { membership?: { hasPro?: boolean | null } | null } | null | undefined,
): boolean {
  return me?.membership?.hasPro === true
}
