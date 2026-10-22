'use client'

import { Stack } from '@chakra-ui/react'
import {
  type ChangeEvent,
  type ReactNode,
  type RefObject,
  useRef,
  useState,
} from 'react'
import { LuCamera, LuImages } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'

import { Button } from '../Button/Button'
import { Drawer } from '../Drawer/Drawer'
import bag from './i11n.json'
import { offersCamera } from './photoSource'

/** Spread on the one photo button: it opens the choice, or the file picker. */
export type PhotoSourceTrigger = {
  ref: RefObject<HTMLButtonElement | null>
  onClick: () => void
}

export type PhotoSourcePickerProps = {
  /** The camera Take photo opens: `environment` (back, for things) or `user` (front, for a selfie). */
  camera: 'environment' | 'user'
  /** What the library picker lists. Default: any image. */
  accept?: string
  /** Several photos from the library at once (the camera takes one). */
  multiple?: boolean
  /** The photos picked or taken. Not called when the picker closes empty. */
  onFiles: (files: File[]) => void
  /** Renders the place's own button with `trigger` spread on it. */
  children: (trigger: PhotoSourceTrigger) => ReactNode
}

/**
 * SDL PhotoSourcePicker: one photo button. On a touch screen (phones and
 * tablets, checked at tap time) it opens a bottom drawer with Take photo
 * (the camera) and Choose from library; with a mouse it opens the file
 * picker straight away, as desktop browsers have no camera to offer.
 *
 * Two hidden inputs: the camera one carries `capture`, which is what makes
 * phones open the camera instead of the library. They sit outside the drawer
 * so closing it never unmounts the input that is waiting for the photo, and
 * each drawer item clicks its input inside the tap itself (browsers only
 * open a picker during a user gesture), then closes the drawer.
 */
export function PhotoSourcePicker({
  camera,
  accept = 'image/*',
  multiple = false,
  onFiles,
  children,
}: PhotoSourcePickerProps) {
  const t = useI11n(bag)
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const libraryRef = useRef<HTMLInputElement>(null)

  const pick = () => {
    if (offersCamera(window)) setOpen(true)
    else libraryRef.current?.click()
  }

  const choose = (input: HTMLInputElement | null) => {
    input?.click()
    setOpen(false)
  }

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Copy first: clearing the input empties its FileList.
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length > 0) onFiles(files)
  }

  return (
    <>
      {children({ ref: triggerRef, onClick: pick })}
      <input
        ref={libraryRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={onChange}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture={camera}
        hidden
        onChange={onChange}
      />
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title={t.title}
        placement="bottom"
        finalFocusEl={() => triggerRef.current}
      >
        <Stack gap={3}>
          <Button
            variant="secondary"
            size="lg"
            justifyContent="flex-start"
            onClick={() => choose(cameraRef.current)}
          >
            <LuCamera size={20} aria-hidden />
            {t.takePhoto}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            justifyContent="flex-start"
            onClick={() => choose(libraryRef.current)}
          >
            <LuImages size={20} aria-hidden />
            {t.chooseFromLibrary}
          </Button>
        </Stack>
      </Drawer>
    </>
  )
}
