import type { SystemStyleObject } from '@chakra-ui/react'

import {
  PAGE_CONTAINER_MAX_W_CSS,
  SEARCH_LIST_COLUMN_W,
} from '@/theme/pageContainer'

const white = (alpha: number) => `rgba(255, 255, 255, ${alpha})`

/** Header-band wash: opaque at the top, clear by the bottom of the band. */
export const MAP_FADE_TOP = `linear-gradient(to bottom, ${white(0.95)} 0%, ${white(0.55)} 42%, ${white(0)} 100%)`

/** Carousel / CTA-band wash: opaque at the bottom, clear by the top of the band. */
export const MAP_FADE_BOTTOM = `linear-gradient(to top, ${white(0.92)} 0%, ${white(0.5)} 48%, ${white(0)} 100%)`

/** Desktop task-detail: bottom half of the map. */
export const MAP_FADE_BOTTOM_HALF = `linear-gradient(to top, ${white(0.98)} 0%, ${white(0.72)} 40%, ${white(0.2)} 78%, ${white(0)} 100%)`

/** Search desktop: list column, starting at the page container’s left edge. */
export const MAP_FADE_LEFT_LIST = `linear-gradient(to right, ${white(0.92)} 0%, ${white(0.88)} 55%, ${white(0)} 100%)`

/** Task-detail desktop: left → right across the card column. */
export const MAP_FADE_LEFT_WIDE = `linear-gradient(to right, ${white(0.97)} 0%, ${white(0.82)} 36%, ${white(0.32)} 58%, ${white(0)} 76%)`

/** `lg` Container gutter (`PAGE_GUTTER_X.lg` = 8 → 2rem) + list column. */
export const SEARCH_MAP_LEFT_FADE_SIZE = `calc(2rem + ${SEARCH_LIST_COLUMN_W})`

/** Centered `sizes.page` column’s left edge. */
export const SEARCH_MAP_LEFT_FADE_POS = `max(0px, (100% - ${PAGE_CONTAINER_MAX_W_CSS}) / 2)`

const canvasAfter: SystemStyleObject = {
  content: '""',
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  backgroundRepeat: 'no-repeat',
}

export type MapboxCanvasFadePreset =
  | 'search'
  | 'taskDetailMobile'
  | 'taskDetailDesktop'

/**
 * White edge washes on the Mapbox tile canvas (`::after`), under HTML markers
 * and controls. Layout overlays stay out of the way.
 */
export function mapboxCanvasFadeCss(
  preset: MapboxCanvasFadePreset,
): SystemStyleObject {
  if (preset === 'search') {
    return {
      '& .mapboxgl-canvas-container::after': {
        ...canvasAfter,
        backgroundImage: {
          base: `${MAP_FADE_TOP}, ${MAP_FADE_BOTTOM}`,
          lg: MAP_FADE_LEFT_LIST,
        },
        backgroundSize: {
          base: '100% 30%, 100% 40%',
          lg: `${SEARCH_MAP_LEFT_FADE_SIZE} 100%`,
        },
        backgroundPosition: {
          base: '0 0, 0 100%',
          lg: `${SEARCH_MAP_LEFT_FADE_POS} 0`,
        },
      },
    }
  }

  if (preset === 'taskDetailMobile') {
    return {
      '& .mapboxgl-canvas-container::after': {
        ...canvasAfter,
        backgroundImage: `${MAP_FADE_TOP}, ${MAP_FADE_BOTTOM}`,
        backgroundSize: '100% 28%, 100% 42%',
        backgroundPosition: '0 0, 0 100%',
      },
    }
  }

  return {
    '& .mapboxgl-canvas-container::after': {
      ...canvasAfter,
      backgroundImage: `${MAP_FADE_LEFT_WIDE}, ${MAP_FADE_BOTTOM_HALF}`,
      backgroundSize: '100% 100%, 100% 50%',
      backgroundPosition: '0 0, 0 100%',
    },
  }
}
