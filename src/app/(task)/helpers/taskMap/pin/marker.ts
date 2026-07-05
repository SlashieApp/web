import type { TaskMapTask } from '../types'
import {
  HOVER_CLOSE_DELAY_MS,
  HOVER_OPEN_DELAY_MS,
  PIN_ANIM_MS,
  PIN_EASE,
  pinMotionEnabled,
} from './animation'
import { pinMilesText, pinPriceText } from './content'
import {
  type PinDom,
  type PinVisualState,
  applyPinVisualState,
  mountPinStaticStyles,
} from './styles'

export type TaskMapPinHandle = {
  el: HTMLDivElement
  setSelected: (v: boolean) => void
  setExpanded: (v: boolean) => void
}

function createPinDom(task: TaskMapTask): PinDom {
  const root = document.createElement('div')
  const popupShell = document.createElement('div')
  const popupReveal = document.createElement('div')
  const popupBody = document.createElement('div')
  const pricePillWrap = document.createElement('div')
  const pricePill = document.createElement('div')
  const pinDot = document.createElement('span')

  pinDot.setAttribute('aria-hidden', 'true')
  pricePill.textContent = pinPriceText(task)

  const priceEl = document.createElement('div')
  priceEl.textContent = pinPriceText(task)
  const milesEl = document.createElement('div')
  milesEl.textContent = pinMilesText(task)

  popupBody.append(priceEl, milesEl)
  popupReveal.appendChild(popupBody)
  popupShell.appendChild(popupReveal)
  pricePillWrap.appendChild(pricePill)
  root.append(popupShell, pricePillWrap, pinDot)

  return {
    root,
    popupShell,
    popupReveal,
    popupBody,
    pricePillWrap,
    pricePill,
    priceEl,
    milesEl,
    pinDot,
  }
}

function pulsePinDot(pinDot: HTMLSpanElement, motion: boolean) {
  if (!motion || typeof pinDot.animate !== 'function') return
  pinDot.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.18)' },
      { transform: 'scale(1)' },
    ],
    { duration: PIN_ANIM_MS + 80, easing: PIN_EASE },
  )
}

function visualState(isSelected: boolean, expanded: boolean): PinVisualState {
  const isExpanded = expanded || isSelected
  return {
    selected: isSelected,
    expanded: isExpanded,
    showPill: !isExpanded,
  }
}

function createHoverPeek(
  getSelected: () => boolean,
  getExpanded: () => boolean,
  setExpanded: (v: boolean) => void,
  onChange: () => void,
) {
  let openTimer: ReturnType<typeof setTimeout> | undefined
  let closeTimer: ReturnType<typeof setTimeout> | undefined

  const clearTimers = () => {
    if (openTimer) clearTimeout(openTimer)
    if (closeTimer) clearTimeout(closeTimer)
    openTimer = undefined
    closeTimer = undefined
  }

  const onEnter = () => {
    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = undefined
    }
    if (getSelected() || getExpanded()) return

    openTimer = setTimeout(() => {
      openTimer = undefined
      if (getSelected()) return
      setExpanded(true)
      onChange()
    }, HOVER_OPEN_DELAY_MS)
  }

  const onLeave = () => {
    if (openTimer) {
      clearTimeout(openTimer)
      openTimer = undefined
    }
    if (getSelected()) return

    closeTimer = setTimeout(() => {
      closeTimer = undefined
      setExpanded(false)
      onChange()
    }, HOVER_CLOSE_DELAY_MS)
  }

  return { onEnter, onLeave, clearTimers }
}

function wireSelection(dom: PinDom, task: TaskMapTask, onSelect: () => void) {
  const stopAndSelect = (e: Event) => {
    e.stopPropagation()
    e.preventDefault()
    onSelect()
  }

  const onKeySelect = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    onSelect()
  }

  const label = `${pinPriceText(task)}, ${pinMilesText(task)}. Select to highlight in list.`

  dom.pricePill.setAttribute('role', 'button')
  dom.pricePill.tabIndex = 0
  dom.pricePill.setAttribute('aria-label', label)
  dom.pricePill.addEventListener('click', stopAndSelect)
  dom.pricePill.addEventListener('keydown', onKeySelect)
  dom.pinDot.addEventListener('click', stopAndSelect)
  dom.popupReveal.addEventListener('click', stopAndSelect)
}

export function taskMarkerElement(
  task: TaskMapTask,
  selected: boolean,
  onSelect: () => void,
): TaskMapPinHandle {
  const motion = pinMotionEnabled()
  const dom = createPinDom(task)

  let isSelected = selected
  let expanded = false
  let wasExpanded = false

  mountPinStaticStyles(dom, motion)
  wireSelection(dom, task, onSelect)

  const render = () => {
    const state = visualState(isSelected, expanded)
    const opening = state.expanded && !wasExpanded

    applyPinVisualState(dom, state, motion)
    if (opening) pulsePinDot(dom.pinDot, motion)
    wasExpanded = state.expanded
  }

  const hover = createHoverPeek(
    () => isSelected,
    () => expanded,
    (v) => {
      expanded = v
    },
    render,
  )

  dom.root.addEventListener('mouseenter', hover.onEnter)
  dom.root.addEventListener('mouseleave', hover.onLeave)

  render()

  return {
    el: dom.root,
    setSelected: (v) => {
      isSelected = v
      if (v) hover.clearTimers()
      render()
    },
    setExpanded: (v) => {
      expanded = v
      if (v) hover.clearTimers()
      render()
    },
  }
}
