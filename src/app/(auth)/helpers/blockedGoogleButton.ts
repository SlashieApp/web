/**
 * Google's sign-in button while sign-up still needs the consent boxes (FE-481).
 *
 * The widget is Google's: its button is an in-page `div[role="button"]` that
 * Google draws a moment after the script loads (and may redraw), and its own
 * key handler opens the sign-in. We do not swap it for one of ours, so while it
 * is blocked we do two things to it from outside:
 *
 * - `aria-describedby` goes on that role="button" node itself, pointing at the
 *   hint that says why it does nothing yet. A MutationObserver puts it back on
 *   a button that arrives or is redrawn later. (A description on a wrapper
 *   div, or on the container, is not read for the focused button.)
 * - Enter and Space are caught in the capture phase on the container, before
 *   they reach Google's handler: the keys show the same prompt a click on the
 *   pointer overlay does, instead of opening the sign-in with the boxes
 *   unticked.
 *
 * Returns a cleanup that takes both away (the boxes are ticked, or it unmounts).
 */

/** The activation keys of a button: Enter and Space. */
export function isActivationKey(event: KeyboardEvent): boolean {
  return (
    event.key === 'Enter' ||
    event.key === ' ' ||
    event.key === 'Spacebar' ||
    event.code === 'Space'
  )
}

export function guardBlockedGoogleButton(
  container: HTMLElement,
  options: { describedBy?: string; onBlocked: () => void },
): () => void {
  const { describedBy, onBlocked } = options
  const described = new Set<Element>()

  const describe = () => {
    if (!describedBy) return
    for (const button of container.querySelectorAll('[role="button"]')) {
      // Only write when it differs: the observer sees attribute writes too.
      if (button.getAttribute('aria-describedby') !== describedBy) {
        button.setAttribute('aria-describedby', describedBy)
      }
      described.add(button)
    }
  }
  describe()
  const observer = new MutationObserver(describe)
  observer.observe(container, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['role'],
  })

  // keydown asks for the boxes once per press; keypress and keyup are held back
  // too, because a button may activate on either (Space does on keyup).
  const onKey = (event: KeyboardEvent) => {
    if (!isActivationKey(event)) return
    event.preventDefault()
    event.stopPropagation()
    if (event.type === 'keydown' && !event.repeat) onBlocked()
  }
  const keyEvents = ['keydown', 'keypress', 'keyup'] as const
  for (const type of keyEvents) container.addEventListener(type, onKey, true)

  return () => {
    observer.disconnect()
    for (const type of keyEvents) {
      container.removeEventListener(type, onKey, true)
    }
    for (const button of described) {
      if (button.getAttribute('aria-describedby') === describedBy) {
        button.removeAttribute('aria-describedby')
      }
    }
  }
}
