import {
  CURRENT_LOCATION_LABEL,
  URL_SEEDED_AREA_LABEL,
} from '../../helpers/browseReferenceLocation'

/** Short place label for “near …” list headings. */
export function browseNearPlaceLabel(
  areaLabel: string,
  /** Find workers passes its own words; /search is still English (FE-422). */
  words: { you: string; thisArea: string } = {
    you: 'you',
    thisArea: 'this area',
  },
): string {
  if (areaLabel === CURRENT_LOCATION_LABEL) return words.you
  if (areaLabel === URL_SEEDED_AREA_LABEL) return words.thisArea
  return areaLabel
}

/** `hasMore`: another page exists, so the count reads as `100+`. */
export function formatTasksListTitle(
  count: number,
  areaLabel: string,
  hasMore = false,
): string {
  const noun = count === 1 && !hasMore ? 'task' : 'tasks'
  return `${count}${hasMore ? '+' : ''} ${noun} near ${browseNearPlaceLabel(areaLabel)}`
}
