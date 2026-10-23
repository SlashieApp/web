import { afterEach, describe, expect, it, vi } from 'vitest'

import type { TaskMapTask } from '../types'
import { taskMarkerElement } from './marker'

const task = {
  id: 'task-1',
  title: 'Mount a TV',
  priceLabel: '£120',
  distanceLabel: '1.2 mi away',
} as TaskMapTask

const mounted: HTMLElement[] = []

function mountPin(selected = false) {
  const onSelect = vi.fn()
  const handle = taskMarkerElement(task, selected, onSelect)
  document.body.appendChild(handle.el)
  mounted.push(handle.el)
  // popup shell > popup (`popupReveal`), pill wrap > pill, then the dot.
  const [popupShell, pillWrap, dot] = Array.from(handle.el.children)
  return {
    handle,
    onSelect,
    popup: popupShell.firstElementChild as HTMLElement,
    pill: pillWrap.firstElementChild as HTMLElement,
    dot: dot as HTMLElement,
  }
}

afterEach(() => {
  for (const el of mounted.splice(0)) el.remove()
})

describe('task pin taps', () => {
  it('reports a tap from the pill, the popup and the dot alike', () => {
    const { onSelect, pill, popup, dot } = mountPin()
    pill.click()
    popup.click()
    dot.click()
    expect(onSelect).toHaveBeenCalledTimes(3)
  })

  it('reports the popup of a selected pin too: the page decides to open', () => {
    const { handle, onSelect, popup } = mountPin()
    handle.setSelected(true)
    popup.click()
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('keeps the tap off the map underneath', () => {
    const onMapClick = vi.fn()
    document.body.addEventListener('click', onMapClick)
    const { pill, popup, dot } = mountPin()
    pill.click()
    popup.click()
    dot.click()
    document.body.removeEventListener('click', onMapClick)
    expect(onMapClick).not.toHaveBeenCalled()
  })

  it('reports Enter and Space on the pill, nothing else', () => {
    const { onSelect, pill } = mountPin()
    for (const key of ['Enter', ' ', 'a', 'Tab']) {
      pill.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
    }
    expect(onSelect).toHaveBeenCalledTimes(2)
  })
})

describe('task pin label', () => {
  it('only names the pin until it is selected', () => {
    const { handle, pill } = mountPin()
    expect(pill.getAttribute('aria-label')).toBe('£120, 1.2 mi away')

    handle.setSelected(true)
    expect(pill.getAttribute('aria-label')).toBe(
      '£120, 1.2 mi away. View task details.',
    )

    handle.setSelected(false)
    expect(pill.getAttribute('aria-label')).toBe('£120, 1.2 mi away')
  })

  it('starts with the opening hint when the pin is created selected', () => {
    const { pill } = mountPin(true)
    expect(pill.getAttribute('aria-label')).toBe(
      '£120, 1.2 mi away. View task details.',
    )
  })
})
