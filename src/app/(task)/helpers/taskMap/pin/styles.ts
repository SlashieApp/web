import {
  BRAND_PRIMARY,
  BRAND_PRIMARY_HOVER,
  BRAND_PRIMARY_SOFT_BG,
  brandPrimary,
} from '@/theme/system'
import {
  PIN_STACK_GAP_PX,
  POPUP_ABOVE_DOT_PX,
  pinTransition,
} from './animation'
import { applyFadeFromBottom, mountFadeFromBottom } from './fadeFromBottom'

/** Slashie map pin palette. */
export const PIN = {
  green: BRAND_PRIMARY,
  greenBright: BRAND_PRIMARY_HOVER,
  greenSoft: brandPrimary[400],
  greenPale: BRAND_PRIMARY_SOFT_BG,
  /* TODO(sdl): raw Mapbox/DOM consumer - these map to text.muted / border.strong / bg.surface
     but have no brand.ts constant yet (theme is out of scope for this migration). */
  textMuted: '#6B7370',
  border: '#D1D5D4',
  white: '#FFFFFF',
  shadow: '0 2px 10px rgba(11, 23, 20, 0.12)',
  shadowExpanded: '0 10px 28px rgba(11, 23, 20, 0.16)',
} as const

export const PIN_FONT =
  'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'

const POPUP_RADIUS = '16px'

export type PinVisualState = {
  selected: boolean
  expanded: boolean
  showPill: boolean
}

type PinDom = {
  root: HTMLDivElement
  popupShell: HTMLDivElement
  popupReveal: HTMLDivElement
  popupBody: HTMLDivElement
  pricePillWrap: HTMLDivElement
  pricePill: HTMLDivElement
  priceEl: HTMLDivElement
  milesEl: HTMLDivElement
  viewTaskBtn: HTMLButtonElement
  pinDot: HTMLSpanElement
}

function pinBorder(selected: boolean, expanded: boolean): string {
  if (selected) return `2px solid ${PIN.greenBright}`
  if (expanded) return `1px solid ${PIN.border}`
  return '1px solid transparent'
}

export function mountPinStaticStyles(dom: PinDom, motion: boolean) {
  Object.assign(dom.root.style, {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0',
    margin: '0',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: PIN_FONT,
  })

  Object.assign(dom.popupShell.style, {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    flexShrink: '0',
    width: 'max-content',
    maxWidth: '160px',
    minWidth: '0',
    transition: pinTransition(motion, ['max-height', 'margin-bottom']),
  })

  // Motion layer: the whole card fades + slides up from the pin.
  mountFadeFromBottom(dom.popupReveal, motion)

  // Card chrome (background, radius, shadow, border) rides the motion layer.
  Object.assign(dom.popupBody.style, {
    position: 'relative',
    boxSizing: 'border-box',
    width: 'max-content',
    minWidth: '88px',
    maxWidth: '160px',
    padding: '10px 12px',
    borderRadius: POPUP_RADIUS,
    background: PIN.white,
    transition: pinTransition(motion, ['border-color', 'box-shadow']),
  })

  Object.assign(dom.pricePillWrap.style, {
    flexShrink: '0',
    overflow: 'hidden',
    pointerEvents: 'auto',
    transition: pinTransition(motion, [
      'opacity',
      'max-height',
      'box-shadow',
      'border-color',
    ]),
  })

  Object.assign(dom.priceEl.style, {
    fontSize: '20px',
    fontWeight: '800',
    lineHeight: '1.1',
    color: PIN.green,
    marginBottom: '2px',
    whiteSpace: 'nowrap',
  })

  Object.assign(dom.milesEl.style, {
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: '1.25',
    color: PIN.textMuted,
    whiteSpace: 'nowrap',
  })

  Object.assign(dom.viewTaskBtn.style, {
    display: 'none',
    marginTop: '8px',
    width: '100%',
    boxSizing: 'border-box',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '700',
    lineHeight: '1.2',
    color: PIN.white,
    background: PIN.green,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: PIN_FONT,
    textAlign: 'center',
    transition: pinTransition(motion, ['background-color', 'opacity']),
  })
}

export function applyPinVisualState(
  dom: PinDom,
  state: PinVisualState,
  motion: boolean,
) {
  const { selected, expanded, showPill } = state
  const zIndex = expanded ? '2' : '1'
  const dotPx = selected ? 14 : 12

  Object.assign(dom.root.style, {
    zIndex,
    // Flex gap still applies between hidden pill wrapper and dot — drop it when popup is open.
    gap: expanded ? '0px' : `${PIN_STACK_GAP_PX}px`,
  })

  Object.assign(dom.popupShell.style, {
    maxHeight: expanded ? '168px' : '0px',
    overflow: expanded ? 'visible' : 'hidden',
    marginBottom: expanded ? `${POPUP_ABOVE_DOT_PX}px` : '0px',
    pointerEvents: expanded ? 'auto' : 'none',
  })

  applyFadeFromBottom(dom.popupReveal, expanded, { motion })

  Object.assign(dom.popupBody.style, {
    border: pinBorder(selected, expanded),
    // Tighter shadow so the card glow doesn't wash out the dot below.
    boxShadow: expanded ? '0 4px 16px rgba(11, 23, 20, 0.14)' : 'none',
  })

  Object.assign(dom.pricePillWrap.style, {
    display: showPill ? 'inline-block' : 'block',
    width: 'max-content',
    maxWidth: 'max-content',
    maxHeight: showPill ? '64px' : '0px',
    opacity: showPill ? '1' : '0',
    background: PIN.white,
    borderRadius: '999px',
    boxShadow: showPill ? PIN.shadow : 'none',
    border: selected
      ? `2px solid ${PIN.greenBright}`
      : '1px solid rgba(209, 213, 212, 0.55)',
    pointerEvents: showPill ? 'auto' : 'none',
  })

  Object.assign(dom.pricePill.style, {
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
  })

  const dotActive = selected || expanded

  Object.assign(dom.pinDot.style, {
    position: 'relative',
    zIndex: '3',
    display: 'block',
    flexShrink: '0',
    width: `${dotPx}px`,
    height: `${dotPx}px`,
    borderRadius: '50%',
    background: dotActive ? PIN.greenBright : PIN.greenSoft,
    border: `2.5px solid ${PIN.white}`,
    boxShadow: dotActive
      ? `0 0 0 3px ${PIN.greenPale}, ${PIN.shadow}`
      : PIN.shadow,
    // Selected tasks show a zone circle on the map instead of a point — keep
    // the dot's layout box so the popup stays anchored above the location.
    opacity: selected ? '0' : '1',
    pointerEvents: selected ? 'none' : 'auto',
    transition: pinTransition(motion, ['width', 'height', 'opacity']),
  })

  Object.assign(dom.viewTaskBtn.style, {
    display: expanded ? 'block' : 'none',
    pointerEvents: expanded ? 'auto' : 'none',
  })
}

export type { PinDom }
