import { expect, waitFor } from 'storybook/test'

/**
 * Story-only: resolves once every `Reveal` under `root` has finished moving
 * (open and at rest, or folded away and gone). Measure after it: a gap read
 * mid-slide is not the gap.
 */
export async function revealsSettled(root: HTMLElement) {
  await waitFor(() =>
    expect(root.querySelectorAll('[data-reveal-at-rest="false"]').length).toBe(
      0,
    ),
  )
}
