'use client'

import { HStack, type StackProps } from '@chakra-ui/react'
import { useRef } from 'react'

import { useKeepFocusClearOfBar } from '../focusClearance'

/** The attribute a drawer's body looks for to keep focus clear of the pinned bar. */
export const DRAWER_BAR_ATTR = 'data-drawer-bar'

export type DrawerBarProps = StackProps

/**
 * The bar of a form that lives in a Drawer's body and submits (Cancel and
 * Save): the last child of the form's `FormStack`, so the last field is
 * `formSpace.bodyToAction` (20) above the buttons, and pinned to the bottom of
 * the drawer while the body scrolls. It has no line and no padding above, and
 * 16 below the buttons, like the drawer's own footer. The buttons keep their
 * places, right-aligned and `inlineGap` (12) apart; the caller makes them
 * `size="form"` (48).
 *
 * Open the drawer with `endsInBar` so the body adds no padding under the bar:
 * with it the buttons would rest 24 higher at the end of the scroll than while
 * the bar is pinned.
 *
 * The bar is pinned over the foot of the body's scroll, so the body keeps a
 * control that takes keyboard focus above it: the bar carries `data-drawer-bar`,
 * and a body that holds one has `scroll-padding-bottom` of `pinnedBarClearance`
 * (the bar and the 20 the last field keeps from it), except while focus is in
 * the bar itself, so pressing Save does not scroll the body. A tall control that
 * is only partly under the bar when it takes focus (a textarea, the keyboard
 * up) is scrolled clear too: the padding alone does not move a partly visible
 * control (`useKeepFocusClearOfBar`).
 */
export function DrawerBar(props: DrawerBarProps) {
  const barRef = useRef<HTMLDivElement>(null)
  useKeepFocusClearOfBar(barRef)
  return (
    <HStack
      ref={barRef}
      {...{ [DRAWER_BAR_ATTR]: '' }}
      gap="form.inlineGap"
      justify="flex-end"
      position="sticky"
      bottom={0}
      zIndex={1}
      bg="bg.surface"
      pb={4}
      {...props}
    />
  )
}
