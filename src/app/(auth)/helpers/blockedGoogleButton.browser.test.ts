import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  guardBlockedGoogleButton,
  isActivationKey,
} from './blockedGoogleButton'

// A stand-in for Google's widget: a container with an in-page div[role=button]
// that arrives later and has its own `click` and key handlers (the ones the
// guard must keep Enter, Space and clicks away from: Google's real button lists
// click and keydown). Nothing here talks to Google.

const HINT_ID = 'consent-hint'

let mounted: HTMLElement[] = []
let cleanups: (() => void)[] = []

afterEach(() => {
  for (const cleanup of cleanups) cleanup()
  for (const node of mounted) node.remove()
  mounted = []
  cleanups = []
})

function mount(): HTMLElement {
  const container = document.createElement('div')
  document.body.append(container)
  mounted.push(container)
  return container
}

/** Google's button, with spies standing in for its own handlers. */
function googleButton() {
  const node = document.createElement('div')
  node.setAttribute('role', 'button')
  node.tabIndex = 0
  const seen = vi.fn()
  for (const type of ['keydown', 'keypress', 'keyup', 'click']) {
    node.addEventListener(type, seen)
  }
  return { node, seen }
}

function press(node: Element, type: string, key: string, repeat = false) {
  const event = new KeyboardEvent(type, {
    key,
    code: key === ' ' ? 'Space' : key,
    repeat,
    bubbles: true,
    cancelable: true,
  })
  node.dispatchEvent(event)
  return event
}

function guard(container: HTMLElement, describedBy: string | undefined) {
  const onBlocked = vi.fn()
  const stop = guardBlockedGoogleButton(container, { describedBy, onBlocked })
  cleanups.push(stop)
  return { onBlocked, stop }
}

/** MutationObserver callbacks run as microtasks: let them. */
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

describe('isActivationKey', () => {
  it('is Enter and Space, and nothing else', () => {
    const key = (k: string, code = k) =>
      new KeyboardEvent('keydown', { key: k, code })
    expect(isActivationKey(key('Enter'))).toBe(true)
    expect(isActivationKey(key(' ', 'Space'))).toBe(true)
    expect(isActivationKey(key('Tab'))).toBe(false)
    expect(isActivationKey(key('Escape'))).toBe(false)
    expect(isActivationKey(key('a'))).toBe(false)
  })
})

describe('guardBlockedGoogleButton: the description', () => {
  it('describes the role=button node that is already there', () => {
    const container = mount()
    const { node } = googleButton()
    container.append(node)
    guard(container, HINT_ID)
    expect(node.getAttribute('aria-describedby')).toBe(HINT_ID)
  })

  it('describes a button Google draws later, and one it draws again', async () => {
    const container = mount()
    guard(container, HINT_ID)

    const first = googleButton()
    const wrapper = document.createElement('div')
    wrapper.append(first.node)
    container.append(wrapper)
    await settle()
    expect(first.node.getAttribute('aria-describedby')).toBe(HINT_ID)

    // Redrawn: the old node goes, a new one takes its place.
    const second = googleButton()
    wrapper.replaceChildren(second.node)
    await settle()
    expect(second.node.getAttribute('aria-describedby')).toBe(HINT_ID)

    // A node that becomes a button after it was added.
    const late = document.createElement('div')
    container.append(late)
    await settle()
    expect(late.getAttribute('aria-describedby')).toBeNull()
    late.setAttribute('role', 'button')
    await settle()
    expect(late.getAttribute('aria-describedby')).toBe(HINT_ID)
  })

  it('leaves everything that is not a button alone, and the container too', () => {
    const container = mount()
    const link = document.createElement('a')
    const frame = document.createElement('iframe')
    container.append(link, frame, googleButton().node)
    guard(container, HINT_ID)
    expect(link.getAttribute('aria-describedby')).toBeNull()
    expect(frame.getAttribute('aria-describedby')).toBeNull()
    expect(container.getAttribute('aria-describedby')).toBeNull()
  })

  it('names the hint for assistive tech: the description is its text', () => {
    const container = mount()
    const hint = document.createElement('p')
    hint.id = HINT_ID
    hint.textContent = 'Confirm you are 18 or over.'
    document.body.append(hint)
    mounted.push(hint)
    const { node } = googleButton()
    container.append(node)
    guard(container, HINT_ID)
    const id = node.getAttribute('aria-describedby') ?? ''
    expect(document.getElementById(id)?.textContent).toBe(
      'Confirm you are 18 or over.',
    )
  })

  it('takes the description away again, and stops watching', async () => {
    const container = mount()
    const { node } = googleButton()
    container.append(node)
    const { stop } = guard(container, HINT_ID)
    stop()
    expect(node.getAttribute('aria-describedby')).toBeNull()

    const later = googleButton()
    container.append(later.node)
    await settle()
    expect(later.node.getAttribute('aria-describedby')).toBeNull()
  })

  it('keeps a description that is not ours when it lets go', () => {
    const container = mount()
    const { node } = googleButton()
    container.append(node)
    const { stop } = guard(container, HINT_ID)
    node.setAttribute('aria-describedby', 'something-else')
    stop()
    expect(node.getAttribute('aria-describedby')).toBe('something-else')
  })
})

describe('guardBlockedGoogleButton: Enter and Space', () => {
  it('shows the prompt instead of reaching Google, on every key event', () => {
    const container = mount()
    const { node, seen } = googleButton()
    container.append(node)
    const { onBlocked } = guard(container, HINT_ID)

    for (const key of ['Enter', ' ']) {
      for (const type of ['keydown', 'keypress', 'keyup']) {
        const event = press(node, type, key)
        expect(event.defaultPrevented).toBe(true)
      }
    }
    // Google's own handlers saw none of it.
    expect(seen).not.toHaveBeenCalled()
    // One prompt per press (the keydown), not three.
    expect(onBlocked).toHaveBeenCalledTimes(2)
  })

  it('does not ask again while the key is held', () => {
    const container = mount()
    const { node } = googleButton()
    container.append(node)
    const { onBlocked } = guard(container, HINT_ID)
    press(node, 'keydown', 'Enter')
    press(node, 'keydown', 'Enter', true)
    press(node, 'keydown', 'Enter', true)
    expect(onBlocked).toHaveBeenCalledTimes(1)
  })

  it('catches the key from anywhere in the container, not only the button', () => {
    const container = mount()
    const inner = document.createElement('div')
    const { node } = googleButton()
    inner.append(node)
    container.append(inner)
    const { onBlocked } = guard(container, HINT_ID)
    const event = press(inner, 'keydown', 'Enter')
    expect(event.defaultPrevented).toBe(true)
    expect(onBlocked).toHaveBeenCalledTimes(1)
  })

  it('lets other keys through: Tab still moves on', () => {
    const container = mount()
    const { node, seen } = googleButton()
    container.append(node)
    const { onBlocked } = guard(container, HINT_ID)
    const event = press(node, 'keydown', 'Tab')
    expect(event.defaultPrevented).toBe(false)
    expect(seen).toHaveBeenCalledTimes(1)
    expect(onBlocked).not.toHaveBeenCalled()
  })

  it('still catches the keys when there is no hint to point at', () => {
    const container = mount()
    const { node, seen } = googleButton()
    container.append(node)
    const { onBlocked } = guard(container, undefined)
    expect(node.getAttribute('aria-describedby')).toBeNull()
    press(node, 'keydown', 'Enter')
    expect(seen).not.toHaveBeenCalled()
    expect(onBlocked).toHaveBeenCalledTimes(1)
  })

  it('hands the keys back to Google once the guard is off', () => {
    const container = mount()
    const { node, seen } = googleButton()
    container.append(node)
    const { onBlocked, stop } = guard(container, HINT_ID)
    stop()
    const event = press(node, 'keydown', 'Enter')
    expect(event.defaultPrevented).toBe(false)
    expect(seen).toHaveBeenCalledTimes(1)
    expect(onBlocked).not.toHaveBeenCalled()
  })
})

describe('guardBlockedGoogleButton: click', () => {
  it('asks for the boxes on a click sent at the button itself', () => {
    // What assistive technology sends to activate a button: a click on the
    // node, not at a point, so it never touches the pointer overlay.
    const container = mount()
    const { node, seen } = googleButton()
    container.append(node)
    const { onBlocked } = guard(container, HINT_ID)

    node.click()
    expect(seen).not.toHaveBeenCalled()
    expect(onBlocked).toHaveBeenCalledTimes(1)
  })

  it('catches the click from anywhere in the container, and from inside the button', () => {
    const container = mount()
    const { node, seen } = googleButton()
    const glyph = document.createElement('span')
    node.append(glyph)
    const overlay = document.createElement('div')
    container.append(node, overlay)
    const { onBlocked } = guard(container, HINT_ID)

    const onGlyph = new MouseEvent('click', { bubbles: true, cancelable: true })
    glyph.dispatchEvent(onGlyph)
    expect(onGlyph.defaultPrevented).toBe(true)

    // The overlay over the widget has no handler of its own: its click is the
    // same one prompt.
    overlay.click()
    expect(seen).not.toHaveBeenCalled()
    expect(onBlocked).toHaveBeenCalledTimes(2)
  })

  it('does not prompt twice for one press: the keys that are held back make no click', () => {
    const container = mount()
    const { node, seen } = googleButton()
    container.append(node)
    const { onBlocked } = guard(container, HINT_ID)

    press(node, 'keydown', 'Enter')
    press(node, 'keyup', 'Enter')
    press(node, 'keydown', ' ')
    press(node, 'keyup', ' ')
    expect(onBlocked).toHaveBeenCalledTimes(2)
    expect(seen).not.toHaveBeenCalled()
    node.click()
    expect(onBlocked).toHaveBeenCalledTimes(3)
  })

  it('hands the click back to Google once the guard is off', () => {
    const container = mount()
    const { node, seen } = googleButton()
    container.append(node)
    const { onBlocked, stop } = guard(container, HINT_ID)
    stop()
    node.click()
    expect(seen).toHaveBeenCalledTimes(1)
    expect(onBlocked).not.toHaveBeenCalled()
  })
})
