/** A calendar day as `YYYY-MM-DD`, the form's date. */
export function toYmd(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function parseYmd(
  value: string,
): { year: number; monthIndex: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return null
  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  if (monthIndex < 0 || monthIndex > 11 || day < 1) return null
  if (day > daysInMonth(year, monthIndex)) return null
  return { year, monthIndex, day }
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
}

/** Monday is 0. */
export function mondayIndex(year: number, monthIndex: number, day = 1): number {
  const sunday = new Date(Date.UTC(year, monthIndex, day)).getUTCDay()
  return (sunday + 6) % 7
}

export type MonthCell = { key: string; day: number | null }

/** The month's cells, Monday first. Empty cells pad the first and last week. */
export function monthCells(year: number, monthIndex: number): MonthCell[] {
  const cells: MonthCell[] = []
  const pad = mondayIndex(year, monthIndex)
  for (let i = 0; i < pad; i++) {
    cells.push({ key: `${year}-${monthIndex}-lead-${i + 1}`, day: null })
  }
  const count = daysInMonth(year, monthIndex)
  for (let day = 1; day <= count; day++) {
    cells.push({ key: toYmd(year, monthIndex, day), day })
  }
  let trail = 0
  while (cells.length % 7 !== 0) {
    trail += 1
    cells.push({ key: `${year}-${monthIndex}-trail-${trail}`, day: null })
  }
  return cells
}

export function shiftMonth(
  year: number,
  monthIndex: number,
  by: number,
): { year: number; monthIndex: number } {
  const next = new Date(Date.UTC(year, monthIndex + by, 1))
  return { year: next.getUTCFullYear(), monthIndex: next.getUTCMonth() }
}

export function parseTime(
  value: string,
): { hour: number; minute: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim())
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return null
  return { hour, minute }
}

export function toTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}
