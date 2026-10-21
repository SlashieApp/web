'use client'

import type { SystemStyleObject } from '@chakra-ui/react'
import { type ChangeEvent, useRef } from 'react'

/** Phones and tablets: no hover, and a finger as the main pointer. */
const TOUCH_SCREEN_MQ = '@media (hover: none) and (pointer: coarse)'

/**
 * Hidden by default, so a mouse or trackpad never meets it (`display: none`
 * also keeps it out of the tab order); shown where the screen is touch.
 * `data-touch-only` lets Storybook's Touch toolbar show it on a desktop.
 */
const touchOnlyTriggerProps = {
  display: 'none',
  css: {
    [TOUCH_SCREEN_MQ]: { display: 'inline-flex' },
  } satisfies SystemStyleObject,
  'data-touch-only': '',
} as const

export type TakePhotoOptions = {
  /** `environment` opens the back camera (for things), `user` the front one (for a selfie). */
  capture: 'environment' | 'user'
  /** The photo taken. Not called when the camera closes without one. */
  onFiles: (files: File[]) => void
}

/**
 * A Take photo control that opens the device camera, on phones and tablets
 * only. Spread `triggerProps` on the button, call `open` from its click, and
 * render `<input {...inputProps} />` beside it. Pass the same handler the
 * regular file picker uses as `onFiles`, so a photo from the camera is checked
 * and uploaded the same way.
 */
export function useTakePhoto({ capture, onFiles }: TakePhotoOptions) {
  const inputRef = useRef<HTMLInputElement>(null)

  return {
    open: () => inputRef.current?.click(),
    triggerProps: touchOnlyTriggerProps,
    inputProps: {
      ref: inputRef,
      type: 'file',
      accept: 'image/*',
      capture,
      hidden: true,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        // Copy first: clearing the input empties its FileList.
        const files = Array.from(event.target.files ?? [])
        event.target.value = ''
        if (files.length > 0) onFiles(files)
      },
    },
  } as const
}
