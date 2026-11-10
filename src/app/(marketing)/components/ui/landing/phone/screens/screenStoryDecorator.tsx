import { Box } from '@chakra-ui/react'
import type { Decorator } from '@storybook/nextjs-vite'
import { expect, waitFor } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { PHONE_CROP_H, PhoneCrop, PhoneFrame } from '../PhoneFrame'

const { demoLabel } = messages.en.landing.phone

/**
 * Story-only: a demo screen in the phone the landing shows it in, on the white
 * page. The pinned phone (300px) by default; with `compact` in the story's
 * args, the cropped phone of the inline steps, in a well as wide as the page
 * column gives it: 358px on a 390px phone, 288px on the narrowest (320px).
 */
export const withDemoPhone: Decorator = (Story, { args }) =>
  args.compact ? (
    <Box bg="bg.surface" maxW="358px">
      <PhoneCrop label={demoLabel}>
        <Story />
      </PhoneCrop>
    </Box>
  ) : (
    <Box p={{ base: 4, md: 8 }} bg="bg.surface" display="inline-block">
      <PhoneFrame label={demoLabel} nominalWidth={300} w="300px">
        <Story />
      </PhoneFrame>
    </Box>
  )

/**
 * Story-only: what a `compact` screen owes the cropped phone, as a list of
 * what breaks it (empty when it fits). No text is under 11px, every button is
 * whole inside the well, and so is each of `whole` (the words the screen must
 * show: what its beat adds).
 */
function cropFaults(well: HTMLElement, whole: readonly string[]): string[] {
  const box = well.getBoundingClientRect()
  const faults: string[] = []
  const inside = (el: Element, name: string) => {
    const rect = el.getBoundingClientRect()
    if (
      rect.top < box.top ||
      rect.bottom > box.bottom ||
      rect.left < box.left ||
      rect.right > box.right
    ) {
      faults.push(
        `"${name}" is cut by the well (bottom ${Math.round(rect.bottom - box.top)} of ${PHONE_CROP_H})`,
      )
    }
  }
  for (const button of well.querySelectorAll('button')) {
    inside(button, button.getAttribute('aria-label') ?? 'button')
  }
  const seen = new Set<string>()
  const words = document.createTreeWalker(well, NodeFilter.SHOW_TEXT)
  while (words.nextNode()) {
    const text = words.currentNode.textContent?.trim()
    const el = words.currentNode.parentElement
    // The status bar's icons carry svg titles, which are not drawn.
    if (!text || !el || el.closest('title')) continue
    const size = Number.parseFloat(getComputedStyle(el).fontSize)
    if (size < 11) faults.push(`"${text}" is ${size}px`)
    if (whole.includes(text)) {
      seen.add(text)
      inside(el, text)
    }
  }
  for (const text of whole) {
    if (!seen.has(text)) faults.push(`"${text}" is not on the screen`)
  }
  return faults
}

/**
 * Story-only: the cropped phone is a 340px well with the phone drawn at 1:1,
 * and the `compact` screen in it fits (`cropFaults`), once its entrance and
 * its beat have settled.
 */
export async function expectFitsTheCrop(
  canvasElement: HTMLElement,
  whole: readonly string[] = [],
) {
  const well = canvasElement.querySelector<HTMLElement>('figure')
  const phone = well?.querySelector<HTMLElement>('[data-phone-crop]')
  if (!well || !phone) throw new Error('The cropped phone is missing')
  await expect(Math.round(well.getBoundingClientRect().height)).toBe(
    PHONE_CROP_H,
  )
  await expect(getComputedStyle(phone).transform).toBe('none')
  await waitFor(() => expect(cropFaults(well, whole)).toEqual([]), {
    timeout: 4000,
  })
}
