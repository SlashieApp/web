'use client'

import { HStack, type StackProps } from '@chakra-ui/react'

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
 */
export function DrawerBar(props: DrawerBarProps) {
  return (
    <HStack
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
