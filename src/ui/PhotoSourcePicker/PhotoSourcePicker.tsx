'use client'

import { Stack } from '@chakra-ui/react'
import {
  type ChangeEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useRef,
  useState,
} from 'react'
import { LuCamera, LuImages } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'

import { Button } from '../Button/Button'
import { CameraCapture } from '../CameraCapture/CameraCapture'
import { Drawer, useCloseFromItem } from '../Drawer/Drawer'
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
 * and Choose from library; with a mouse it opens the file picker straight
 * away, as desktop browsers have no camera to offer.
 *
 * Take photo always opens our own camera (`CameraCapture`) over the drawer,
 * which closes once the camera has: some browsers (Arc, Samsung Internet,
 * in-app browsers) ignore an input's `capture` and show a library instead.
 *
 * Two hidden inputs: the library one, and one with `capture` that the
 * camera offers as "Use your browser's camera" when it can't open. They sit
 * outside the drawer and the camera so closing those never unmounts the
 * input that is waiting for the photo, and each action clicks its input
 * inside the tap itself (browsers only open a picker during a user gesture).
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
  const [cameraOpen, setCameraOpen] = useState(false)
  const closeUnderCamera = useCloseFromItem(
    useCallback(() => setOpen(false), []),
  )
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

  const takePhoto = () => {
    setCameraOpen(true)
    closeUnderCamera()
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
            onClick={takePhoto}
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
      <CameraCapture
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        facing={camera}
        onPhoto={(file) => onFiles([file])}
        fallbackActions={[
          {
            label: t.useBrowserCamera,
            onSelect: () => cameraRef.current?.click(),
          },
          {
            label: t.chooseFromLibrary,
            onSelect: () => libraryRef.current?.click(),
          },
        ]}
      />
    </>
  )
}
