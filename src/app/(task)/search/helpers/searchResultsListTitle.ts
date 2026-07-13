import {
  CURRENT_LOCATION_LABEL,
  URL_SEEDED_AREA_LABEL,
} from '../../helpers/browseReferenceLocation'

/** Short place label for “near …” list headings. */
export function browseNearPlaceLabel(areaLabel: string): string {
  if (areaLabel === CURRENT_LOCATION_LABEL) return 'you'
  if (areaLabel === URL_SEEDED_AREA_LABEL) return 'this area'
  return areaLabel
}

export function formatTasksListTitle(count: number, areaLabel: string): string {
  const noun = count === 1 ? 'task' : 'tasks'
  return `${count} ${noun} near ${browseNearPlaceLabel(areaLabel)}`
}

export function formatWorkersListTitle(count: number): string {
  const noun = count === 1 ? 'worker' : 'workers'
  return `${count} ${noun} serving this area`
}
