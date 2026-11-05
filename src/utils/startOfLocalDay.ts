/** Midnight at the start of `date`'s local day, as a timestamp (ms). */
export function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}
