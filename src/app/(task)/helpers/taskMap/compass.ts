import type { IControl, Map as MapboxMap } from 'mapbox-gl'

import { SDL_PRESS_SCALE, sdlMotion } from '@/theme/styles'

import { pinMotionEnabled } from './pin/animation'

/** Marks the compass group so touch layouts can hide only the zoom buttons. */
export const COMPASS_CONTROL_CLASS = 'slashie-map-compass'
const RESET_MS = 300

/** Shown only while the map is rotated or tilted. */
export function compassVisible(bearing: number, pitch: number): boolean {
  return Math.abs(bearing) >= 0.5 || pitch >= 0.5
}

let compassStylesMounted = false

function mountCompassStyles() {
  if (compassStylesMounted || typeof document === 'undefined') return
  compassStylesMounted = true
  const style = document.createElement('style')
  style.textContent = `
.${COMPASS_CONTROL_CLASS} button { transition: transform ${sdlMotion.duration.fast} ${sdlMotion.easing.standard}; }
.${COMPASS_CONTROL_CLASS} button:active { transform: ${SDL_PRESS_SCALE}; }
@media (prefers-reduced-motion: reduce) {
  .${COMPASS_CONTROL_CLASS} button, .${COMPASS_CONTROL_CLASS} button:active { transition: none; transform: none; }
}`
  document.head.appendChild(style)
}

/** Red north / grey south needle; it turns with the map so it points north. */
const NEEDLE_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style="transition:none">
<path d="M12 2 L16 12 L8 12 Z" fill="#E5484D"/>
<path d="M12 22 L8 12 L16 12 Z" fill="#A1A1AA"/>
</svg>`

/**
 * Apple Maps style compass (FE-199) as a Mapbox control: hidden while the
 * map faces north and is flat; a tap turns it back to north and flattens
 * the tilt, keeping the centre and zoom.
 */
export function createCompassControl(): IControl {
  let map: MapboxMap | null = null
  let container: HTMLDivElement | null = null
  let needle: SVGSVGElement | null = null

  const update = () => {
    if (!map || !container || !needle) return
    const bearing = map.getBearing()
    container.style.display = compassVisible(bearing, map.getPitch())
      ? ''
      : 'none'
    needle.style.transform = `rotate(${-bearing}deg)`
  }

  return {
    onAdd(m) {
      map = m
      mountCompassStyles()
      container = document.createElement('div')
      container.className = `mapboxgl-ctrl mapboxgl-ctrl-group ${COMPASS_CONTROL_CLASS}`
      const button = document.createElement('button')
      button.type = 'button'
      button.setAttribute('aria-label', 'Reset map to north')
      button.title = 'Reset map to north'
      button.style.display = 'flex'
      button.style.alignItems = 'center'
      button.style.justifyContent = 'center'
      button.innerHTML = NEEDLE_SVG
      needle = button.querySelector('svg')
      button.addEventListener('click', () => {
        m.resetNorthPitch({ duration: pinMotionEnabled() ? RESET_MS : 0 })
      })
      container.appendChild(button)
      m.on('rotate', update)
      m.on('pitch', update)
      update()
      return container
    },
    onRemove() {
      map?.off('rotate', update)
      map?.off('pitch', update)
      container?.remove()
      container = null
      needle = null
      map = null
    },
  }
}
