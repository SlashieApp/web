import type { TaskMapTask } from './taskMap.types'

/** Slashie map pin + peek popup tokens (see slashie-design skill). */
const PIN = {
  green: '#00AB63',
  greenBright: '#00DC82',
  greenSoft: '#53D388',
  greenPale: '#D9F4E5',
  text: '#0B1714',
  textSecondary: '#3F4B45',
  textMuted: '#6B7370',
  border: '#D1D5D4',
  white: '#FFFFFF',
  shadow: '0 2px 10px rgba(11, 23, 20, 0.12)',
  shadowExpanded: '0 10px 28px rgba(11, 23, 20, 0.16)',
} as const

const PIN_FONT =
  'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'

const PIN_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const PIN_ANIM_MS = 240
const PIN_ANIM = `${PIN_ANIM_MS}ms ${PIN_EASE}`

function pinMotionEnabled(): boolean {
  if (typeof window === 'undefined') return true
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** GraphQL / JSON often returns coordinates as strings; Mapbox needs finite numbers. */
export function parseCoord(value: unknown): number | null {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number.parseFloat(value.trim())
    return Number.isFinite(n) ? n : null
  }
  return null
}

export function taskLngLat(
  task: TaskMapTask,
): { lng: number; lat: number } | null {
  const lat = parseCoord(task.locationLat)
  const lng = parseCoord(task.locationLng)
  if (lat == null || lng == null) return null
  return { lat, lng }
}

/** Price for the always-visible pill; falls back to detailLine before `·`. */
export function pinPriceText(task: TaskMapTask): string {
  const p = task.priceLabel?.trim()
  if (p) return p
  const line = (task.detailLine ?? '').trim()
  if (!line) return '—'
  const head = line.split('·')[0]?.trim()
  return head || line
}

/** Stable signature for pin popup content (excluding coordinates). */
export function taskPinContentSig(task: TaskMapTask): string {
  return [
    task.title,
    pinPriceText(task),
    task.category ?? '',
    task.location ?? '',
    task.distanceLabel ?? '',
  ].join('\x1f')
}

export function tasksCoordsSig(tasks: TaskMapTask[]): string {
  return tasks
    .map((t) => {
      const ll = taskLngLat(t)
      return ll ? `${t.id}:${ll.lat},${ll.lng}` : ''
    })
    .filter(Boolean)
    .join('|')
}

export function tasksMarkerSig(tasks: TaskMapTask[]): string {
  return tasks
    .map((t) => {
      const ll = taskLngLat(t)
      if (!ll) return ''
      return `${t.id}:${ll.lat},${ll.lng}:${taskPinContentSig(t)}`
    })
    .filter(Boolean)
    .join('|')
}

export function referenceMarkerElement(): HTMLDivElement {
  const root = document.createElement('div')
  root.setAttribute('aria-hidden', 'true')
  Object.assign(root.style, {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: '#00AB63',
    border: '3px solid #ffffff',
    boxShadow: '0 0 0 2px rgba(0,171,99,0.35), 0 2px 8px rgba(15,23,42,0.25)',
    zIndex: '0',
    pointerEvents: 'none',
  })
  return root
}

export type TaskMapPinHandle = {
  el: HTMLDivElement
  setSelected: (v: boolean) => void
  setExpanded: (v: boolean) => void
}

export function taskMarkerElement(
  task: TaskMapTask,
  selected: boolean,
  onClearActiveSelection: () => void,
  onSelect: () => void,
): TaskMapPinHandle {
  const root = document.createElement('div')
  Object.assign(root.style, {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '6px',
    padding: '0',
    margin: '0',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: PIN_FONT,
  })

  const popupShell = document.createElement('div')
  const pricePillWrap = document.createElement('div')
  const pinDot = document.createElement('span')
  pinDot.setAttribute('aria-hidden', 'true')

  root.appendChild(popupShell)
  root.appendChild(pricePillWrap)
  root.appendChild(pinDot)

  const pricePill = document.createElement('div')
  pricePill.textContent = pinPriceText(task)
  pricePillWrap.appendChild(pricePill)

  const popupBody = document.createElement('div')
  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.setAttribute('aria-label', 'Close task preview')
  closeBtn.textContent = '×'

  let isSelected = selected
  let expanded = false
  let wasExpanded = false
  let hoverOpenTimer: ReturnType<typeof setTimeout> | undefined
  let hoverCloseTimer: ReturnType<typeof setTimeout> | undefined

  const cat = (task.category ?? '').trim()
  const locationText = (task.location ?? '').trim()
  const distanceText = (task.distanceLabel ?? '').trim()
  const priceText = pinPriceText(task)

  let categoryEl: HTMLDivElement | null = null
  if (cat) {
    categoryEl = document.createElement('div')
    categoryEl.textContent = cat
    popupBody.appendChild(categoryEl)
  }

  const titleEl = document.createElement('div')
  titleEl.textContent = task.title
  popupBody.appendChild(titleEl)

  const metaParts = [locationText, distanceText].filter(Boolean)
  let metaEl: HTMLDivElement | null = null
  if (metaParts.length > 0) {
    metaEl = document.createElement('div')
    metaEl.textContent = metaParts.join(' · ')
    popupBody.appendChild(metaEl)
  }

  const priceEl = document.createElement('div')
  priceEl.textContent = priceText
  popupBody.appendChild(priceEl)

  popupBody.appendChild(closeBtn)

  const popupReveal = document.createElement('div')
  popupReveal.appendChild(popupBody)
  popupShell.appendChild(popupReveal)

  Object.assign(popupShell.style, {
    overflow: 'hidden',
    flexShrink: '0',
    transition: pinMotionEnabled()
      ? `max-height ${PIN_ANIM}, margin-bottom ${PIN_ANIM}, width ${PIN_ANIM}, max-width ${PIN_ANIM}`
      : 'none',
  })
  Object.assign(popupReveal.style, {
    transformOrigin: 'center bottom',
    overflow: 'hidden',
    transition: pinMotionEnabled()
      ? `clip-path ${PIN_ANIM}, box-shadow ${PIN_ANIM}, border-color ${PIN_ANIM}`
      : 'none',
  })
  Object.assign(pricePillWrap.style, {
    transformOrigin: 'center bottom',
    flexShrink: '0',
    transition: pinMotionEnabled()
      ? `opacity ${PIN_ANIM}, max-height ${PIN_ANIM}, box-shadow ${PIN_ANIM}, border-color ${PIN_ANIM}`
      : 'none',
  })
  Object.assign(pricePill.style, {
    transition: pinMotionEnabled()
      ? `opacity ${PIN_ANIM}, transform ${PIN_ANIM}`
      : 'none',
  })
  Object.assign(popupBody.style, {
    position: 'relative',
    boxSizing: 'border-box',
    width: '236px',
  })
  Object.assign(closeBtn.style, {
    transition: 'none',
  })

  const clearHoverTimers = () => {
    if (hoverOpenTimer) clearTimeout(hoverOpenTimer)
    if (hoverCloseTimer) clearTimeout(hoverCloseTimer)
    hoverOpenTimer = undefined
    hoverCloseTimer = undefined
  }

  const pulsePinDot = () => {
    if (!pinMotionEnabled() || typeof pinDot.animate !== 'function') return
    pinDot.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.18)' },
        { transform: 'scale(1)' },
      ],
      { duration: 320, easing: PIN_EASE },
    )
  }

  const apply = () => {
    const isSel = isSelected
    const isExpanded = expanded || isSel
    const dotPx = isSel ? 14 : 12
    const zIndex = isExpanded ? '2' : '1'
    const opening = isExpanded && !wasExpanded
    const showPill = !isExpanded

    Object.assign(root.style, { zIndex })

    Object.assign(popupShell.style, {
      width: isExpanded ? '236px' : '0px',
      maxWidth: isExpanded ? '236px' : '0px',
      minWidth: '0',
      maxHeight: isExpanded ? '240px' : '0px',
      marginBottom: isExpanded ? '6px' : '0px',
      pointerEvents: isExpanded ? 'auto' : 'none',
    })

    Object.assign(popupReveal.style, {
      background: PIN.white,
      borderRadius: '16px',
      boxShadow: isExpanded ? PIN.shadowExpanded : 'none',
      border: isSel
        ? `2px solid ${PIN.greenBright}`
        : isExpanded
          ? `1px solid ${PIN.border}`
          : '1px solid transparent',
      clipPath: isExpanded
        ? 'inset(0 0 0 0 round 16px)'
        : 'inset(100% 0 0 0 round 16px)',
    })

    Object.assign(pricePillWrap.style, {
      display: showPill ? 'inline-block' : 'block',
      width: 'max-content',
      maxWidth: 'max-content',
      maxHeight: showPill ? '64px' : '0px',
      opacity: showPill ? '1' : '0',
      overflow: 'hidden',
      background: PIN.white,
      borderRadius: '999px',
      boxShadow: PIN.shadow,
      border: isSel
        ? `2px solid ${PIN.greenBright}`
        : '1px solid rgba(209, 213, 212, 0.55)',
      pointerEvents: 'none',
    })

    Object.assign(pricePill.style, {
      display: 'inline-block',
      width: 'max-content',
      maxWidth: 'max-content',
      boxSizing: 'border-box',
      padding: '5px 12px',
      fontSize: '13px',
      fontWeight: '800',
      lineHeight: '1.2',
      color: PIN.green,
      whiteSpace: 'nowrap',
      textAlign: 'center',
      transform: showPill ? 'translateY(0)' : 'translateY(10px)',
    })

    Object.assign(popupBody.style, {
      padding: '14px 36px 12px 14px',
    })

    if (categoryEl) {
      Object.assign(categoryEl.style, {
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: PIN.green,
        marginBottom: '6px',
      })
    }

    Object.assign(titleEl.style, {
      fontWeight: '700',
      fontSize: '15px',
      lineHeight: '1.3',
      color: PIN.text,
      marginBottom: metaEl ? '4px' : '8px',
      display: '-webkit-box',
      WebkitLineClamp: '2',
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    })

    if (metaEl) {
      Object.assign(metaEl.style, {
        fontSize: '12px',
        lineHeight: '1.35',
        color: PIN.textMuted,
        marginBottom: '10px',
        display: '-webkit-box',
        WebkitLineClamp: '2',
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      })
    }

    Object.assign(priceEl.style, {
      fontSize: '22px',
      fontWeight: '800',
      lineHeight: '1',
      color: PIN.green,
    })

    Object.assign(closeBtn.style, {
      position: 'absolute',
      top: '8px',
      right: '8px',
      width: '26px',
      height: '26px',
      border: 'none',
      borderRadius: '999px',
      background: PIN.greenPale,
      color: PIN.textSecondary,
      fontSize: '18px',
      lineHeight: '26px',
      cursor: 'pointer',
      opacity: isExpanded ? '1' : '0',
      pointerEvents: isExpanded ? 'auto' : 'none',
    })

    Object.assign(pinDot.style, {
      display: 'block',
      flexShrink: '0',
      width: `${dotPx}px`,
      height: `${dotPx}px`,
      borderRadius: '50%',
      background: isSel ? PIN.greenBright : PIN.greenSoft,
      border: `2.5px solid ${PIN.white}`,
      boxShadow: isSel
        ? `0 0 0 3px ${PIN.greenPale}, ${PIN.shadow}`
        : PIN.shadow,
      transition: pinMotionEnabled()
        ? `width ${PIN_ANIM}, height ${PIN_ANIM}, background ${PIN_ANIM}, box-shadow ${PIN_ANIM}`
        : 'none',
    })

    if (opening) pulsePinDot()
    wasExpanded = isExpanded
  }

  apply()

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    e.preventDefault()
    expanded = false
    if (isSelected) {
      isSelected = false
      onClearActiveSelection()
    }
    apply()
  })

  const handleSelect = (e: Event) => {
    e.stopPropagation()
    e.preventDefault()
    onSelect()
  }

  const handleSelectKey = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    onSelect()
  }

  pricePill.setAttribute('role', 'button')
  pricePill.tabIndex = 0
  pricePill.setAttribute(
    'aria-label',
    `${task.title}, ${pinPriceText(task)}. Select to highlight in list.`,
  )
  pricePill.addEventListener('click', handleSelect)
  pricePill.addEventListener('keydown', handleSelectKey)
  pinDot.addEventListener('click', handleSelect)
  popupReveal.addEventListener('click', (e) => {
    const target = e.target
    if (
      target === closeBtn ||
      (target instanceof Node && closeBtn.contains(target))
    ) {
      return
    }
    handleSelect(e)
  })

  root.addEventListener('mouseenter', () => {
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer)
      hoverCloseTimer = undefined
    }
    if (isSelected || expanded) return
    hoverOpenTimer = setTimeout(() => {
      hoverOpenTimer = undefined
      if (isSelected) return
      expanded = true
      apply()
    }, 120)
  })

  root.addEventListener('mouseleave', () => {
    if (hoverOpenTimer) {
      clearTimeout(hoverOpenTimer)
      hoverOpenTimer = undefined
    }
    if (isSelected) return
    hoverCloseTimer = setTimeout(() => {
      hoverCloseTimer = undefined
      expanded = false
      apply()
    }, 160)
  })

  return {
    el: root,
    setSelected: (v: boolean) => {
      isSelected = v
      if (v) clearHoverTimers()
      apply()
    },
    setExpanded: (v: boolean) => {
      expanded = v
      if (v) clearHoverTimers()
      apply()
    },
  }
}
