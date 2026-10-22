'use client'

import {
  Box,
  DialogCloseTrigger,
  DialogContent,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  Flex,
  HStack,
  Image,
  Spinner,
  Stack,
  Text,
  VisuallyHidden,
  chakra,
} from '@chakra-ui/react'
import {
  type RefObject,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import { createPortal, flushSync } from 'react-dom'
import { LuCameraOff, LuSwitchCamera, LuX } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { APP_OVERLAY_Z_INDEX } from '@/theme/styles'
import { useIsBrowser } from '@/utils/useIsBrowser'

import { Button } from '../Button/Button'
import { IconButton } from '../IconButton/IconButton'
import {
  CAMERA_JPEG_QUALITY,
  type CameraFacing,
  type CameraFailure,
  type CameraPermission,
  cameraConstraints,
  cameraFailure,
  cameraFileName,
  needsSiteSettings,
  watchCameraPermission,
} from './camera'
import bag from './i11n.json'

/** Opens the camera facing `facing`. */
export type OpenCamera = (facing: CameraFacing) => Promise<MediaStream>

const openDeviceCamera: OpenCamera = async (facing) => {
  // Missing in old browsers and on pages not served over HTTPS.
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new DOMException('No camera API.', 'NotSupportedError')
  }
  return navigator.mediaDevices.getUserMedia(cameraConstraints(facing))
}

/**
 * Where the camera's picture comes from: the device's camera, unless a
 * provider hands in another source (stories use a canvas).
 */
export const CameraSourceContext = createContext<OpenCamera>(openDeviceCamera)

/** Another way to add a photo, offered when the camera can't open. */
export type CameraFallbackAction = { label: string; onSelect: () => void }

export type CameraCaptureProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The camera it starts with; the person can switch. */
  facing: CameraFacing
  /** The photo, once the person taps Use photo. The camera has closed. */
  onPhoto: (file: File) => void
  /**
   * Offered when the camera can't open, the first as the main action. Each
   * runs inside the tap (so it may open a file picker), then the camera
   * closes.
   */
  fallbackActions: CameraFallbackAction[]
}

type CameraStep = 'starting' | 'live' | 'review' | CameraFailure

/** Round dark control that reads on any picture, in both themes. */
const controlProps = {
  bg: 'bg.invertedRaised',
  color: 'text.onInverted',
  borderWidth: '1px',
  borderColor: 'border.glass',
  _hover: { bg: 'bg.invertedRaised', color: 'text.onInverted' },
  _disabled: { opacity: 0.5, cursor: 'not-allowed' },
} as const

function stopTracks(stream: MediaStream) {
  for (const track of stream.getTracks()) track.stop()
}

/**
 * Draws the frame showing in `video` at the camera's own size (never
 * mirrored) and encodes it as a JPEG. The frame is drawn before this
 * returns, so the camera may stop straight after.
 */
function takePhoto(video: HTMLVideoElement): Promise<File> {
  const takenAt = new Date()
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const context = canvas.getContext('2d')
  if (!context) return Promise.reject(new Error('No 2D canvas.'))
  context.drawImage(video, 0, 0)
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(
              new File([blob], cameraFileName(takenAt), { type: 'image/jpeg' }),
            )
          : reject(new Error('Could not encode the photo.')),
      'image/jpeg',
      CAMERA_JPEG_QUALITY,
    ),
  )
}

/** One visit to the camera; mounted while the dialog is open. */
function CameraSession({
  facing: initialFacing,
  onPhoto,
  fallbackActions,
  close,
  mainRef,
  closeRef,
}: Omit<CameraCaptureProps, 'open' | 'onOpenChange'> & {
  close: () => void
  /** The step's main control: Take photo, Use photo, Allow camera or the first fallback. */
  mainRef: RefObject<HTMLButtonElement | null>
  closeRef: RefObject<HTMLButtonElement | null>
}) {
  const t = useI11n(bag)
  const openCamera = useContext(CameraSourceContext)
  const [facing, setFacing] = useState(initialFacing)
  const [step, setStep] = useState<CameraStep>('starting')
  const [photo, setPhoto] = useState<File | null>(null)
  const [permission, setPermission] = useState<CameraPermission>('unknown')
  const [askedAgain, setAskedAgain] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // The camera runs while the viewfinder is on screen: it opens as the video
  // mounts (again after Retake, or for the other camera after Switch camera),
  // and every track stops as it goes (a shot, closing, unmounting).
  const viewfinderRef = useCallback(
    (video: HTMLVideoElement | null) => {
      if (!video) return
      videoRef.current = video
      let stream: MediaStream | null = null
      let gone = false
      openCamera(facing).then(
        (opened) => {
          if (gone) return stopTracks(opened)
          stream = opened
          video.srcObject = opened
          // Some in-app browsers won't play even a muted video by itself:
          // offer the fallbacks instead of starting forever.
          video.play().catch((error: unknown) => {
            const refused =
              error instanceof Error && error.name === 'NotAllowedError'
            if (refused && !gone) setStep('unavailable')
          })
        },
        (error: unknown) => {
          if (!gone) setStep(cameraFailure(error))
        },
      )
      return () => {
        gone = true
        videoRef.current = null
        video.srcObject = null
        if (stream) stopTracks(stream)
      }
    },
    [facing, openCamera],
  )

  // The review shows the JPEG itself; its URL lasts as long as the image.
  const photoRef = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img || !photo) return
      const url = URL.createObjectURL(photo)
      img.src = url
      return () => URL.revokeObjectURL(url)
    },
    [photo],
  )

  // Opens the camera again from the blocked screen. The viewfinder mounts
  // before this returns, so the camera is asked for inside a tap, and focus
  // moves to the shutter by hand: the focus trap only follows a focused
  // control that is removed on its own, not one that goes with its screen.
  const reopen = useCallback(() => {
    flushSync(() => setStep('starting'))
    mainRef.current?.focus()
  }, [mainRef])

  // While the blocked screen is up, the camera permission picks its message,
  // and the camera opens straight away if it becomes allowed (in the site
  // settings, say). Only a change opens it: a permission that was already
  // allowed would otherwise loop when the camera still fails for another reason.
  const blockedRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return
      return watchCameraPermission(navigator.permissions, (state, changed) => {
        setPermission(state)
        if (changed && state === 'granted') reopen()
      })
    },
    [reopen],
  )

  // Allow camera asks the browser again, and it prompts if it still can.
  const allowCamera = () => {
    setAskedAgain(true)
    reopen()
  }

  const retake = () => {
    setPhoto(null)
    setStep('starting')
  }

  const shoot = () => {
    const video = videoRef.current
    if (step !== 'live' || !video) return
    const shot = takePhoto(video)
    setStep('review')
    shot.then(setPhoto, retake)
  }

  const switchCamera = () => {
    if (step !== 'live') return
    setStep('starting')
    setFacing((current) => (current === 'user' ? 'environment' : 'user'))
  }

  const keepPhoto = () => {
    if (!photo) return
    onPhoto(photo)
    close()
  }

  const viewing = step === 'starting' || step === 'live'
  const failed = step === 'blocked' || step === 'busy' || step === 'unavailable'
  const failure = !failed
    ? ''
    : step === 'blocked' && needsSiteSettings(permission, askedAgain)
      ? t.failures.blockedInSettings
      : t.failures[step]
  const status = failed
    ? failure
    : { starting: t.starting, live: t.ready, review: photo ? t.taken : '' }[
        step
      ]

  return (
    <>
      <DialogTitle srOnly>{t.title}</DialogTitle>
      <VisuallyHidden aria-live="polite" aria-atomic="true">
        {status}
      </VisuallyHidden>

      <DialogCloseTrigger asChild>
        <IconButton
          ref={closeRef}
          aria-label={t.close}
          position="absolute"
          top="calc(12px + env(safe-area-inset-top, 0px))"
          insetEnd={3}
          zIndex={1}
          {...controlProps}
        >
          <LuX size={20} strokeWidth={2} aria-hidden />
        </IconButton>
      </DialogCloseTrigger>

      <Flex position="absolute" inset={0} align="center" justify="center">
        {viewing ? (
          <chakra.video
            ref={viewfinderRef}
            autoPlay
            muted
            playsInline
            onPlaying={() => setStep('live')}
            w="full"
            h="full"
            objectFit="contain"
            // A selfie preview reads like a mirror; the photo itself isn't flipped.
            transform={facing === 'user' ? 'scaleX(-1)' : undefined}
          />
        ) : null}
        {step === 'starting' ? (
          <Stack position="absolute" align="center" gap={3}>
            <Spinner size="lg" color="text.onInverted" aria-hidden />
            <Text fontWeight={600}>{t.starting}</Text>
          </Stack>
        ) : null}
        {step === 'review' ? (
          photo ? (
            <Image
              ref={photoRef}
              alt={t.photoAlt}
              maxW="full"
              maxH="full"
              objectFit="contain"
            />
          ) : (
            <Spinner size="lg" color="text.onInverted" aria-hidden />
          )
        ) : null}
        {failed ? (
          <Stack
            ref={step === 'blocked' ? blockedRef : undefined}
            align="center"
            gap={5}
            px={6}
            maxW="sm"
            textAlign="center"
          >
            <LuCameraOff size={40} aria-hidden />
            <Text fontWeight={600}>{failure}</Text>
            <Stack w="full" gap={3}>
              {step === 'blocked' ? (
                <Button ref={mainRef} size="lg" onClick={allowCamera}>
                  {t.allowCamera}
                </Button>
              ) : null}
              {fallbackActions.map((action, index) => {
                // Allow camera is the main action when it is there.
                const main = step !== 'blocked' && index === 0
                return (
                  <Button
                    key={action.label}
                    ref={main ? mainRef : undefined}
                    variant={main ? 'primary' : 'secondary'}
                    size="lg"
                    onClick={() => {
                      action.onSelect()
                      close()
                    }}
                  >
                    {action.label}
                  </Button>
                )
              })}
            </Stack>
          </Stack>
        ) : null}
      </Flex>

      {/* Always mounted, so a focused control here is removed on its own and
          the focus trap moves focus to the next step's main control. */}
      <HStack
        position="absolute"
        insetX={0}
        bottom={0}
        justify="center"
        gap={viewing ? 8 : 3}
        px={4}
        pb="calc(24px + env(safe-area-inset-bottom, 0px))"
      >
        {viewing ? (
          <>
            {/* Balances the switch button so the shutter sits centred. */}
            <Box boxSize="44px" />
            <IconButton
              ref={mainRef}
              aria-label={t.shutter}
              aria-disabled={step !== 'live' || undefined}
              onClick={shoot}
              boxSize="72px"
              p={1}
              bg="transparent"
              borderWidth="4px"
              borderColor="text.onInverted"
              _hover={{ bg: 'transparent' }}
              _disabled={controlProps._disabled}
            >
              <Box boxSize="full" borderRadius="full" bg="text.onInverted" />
            </IconButton>
            <IconButton
              aria-label={t.switchCamera}
              aria-disabled={step !== 'live' || undefined}
              onClick={switchCamera}
              {...controlProps}
            >
              <LuSwitchCamera size={20} aria-hidden />
            </IconButton>
          </>
        ) : null}
        {step === 'review' ? (
          <>
            <Button variant="secondary" size="lg" onClick={retake}>
              {t.retake}
            </Button>
            <Button
              ref={mainRef}
              size="lg"
              aria-disabled={!photo || undefined}
              onClick={keepPhoto}
            >
              {t.usePhoto}
            </Button>
          </>
        ) : null}
      </HStack>
    </>
  )
}

/**
 * SDL CameraCapture. A full-screen camera in the page, for browsers that
 * ignore a file input's `capture` and show a library instead (Arc, Samsung
 * Internet, in-app browsers). Built on Chakra/Ark `Dialog` like
 * `ImagePreview`, so the focus trap, Escape and focus return come for free.
 *
 * - Starting camera…, then the viewfinder with Take photo, Switch camera
 *   and Close camera. The selfie preview is mirrored, the photo is not.
 * - A shot stops the camera and shows the photo with Retake and Use photo;
 *   Use photo hands over one JPEG `File` at the camera's full size.
 * - Every track stops whenever the viewfinder goes: after a shot, on Switch
 *   camera (before the other camera opens), on close and on unmount.
 * - Blocked: Allow camera asks the browser again, from the tap. Where the
 *   browser says it won't ask (the camera permission is `denied`) the screen
 *   explains how to allow it in the site settings instead, and the camera
 *   opens as soon as the permission becomes allowed. `fallbackActions` stay.
 * - In use or no camera: a short reason and `fallbackActions`.
 */
export function CameraCapture({
  open,
  onOpenChange,
  ...session
}: CameraCaptureProps) {
  const isBrowser = useIsBrowser()
  const mainRef = useRef<HTMLButtonElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  const overlay = (
    <DialogPositioner position="fixed" inset="0" zIndex={APP_OVERLAY_Z_INDEX}>
      <DialogContent
        bg="bg.invertedSurface"
        color="text.onInverted"
        w="100dvw"
        h="100dvh"
        maxW="none"
        m={0}
        borderRadius={0}
        boxShadow="none"
        overflow="hidden"
      >
        <CameraSession
          {...session}
          close={() => onOpenChange(false)}
          mainRef={mainRef}
          closeRef={closeRef}
        />
      </DialogContent>
    </DialogPositioner>
  )

  return (
    <DialogRoot
      open={open}
      onOpenChange={(details: { open: boolean }) => onOpenChange(details.open)}
      size="full"
      // No exit animation: closing unmounts the session, and the camera
      // stops, at once.
      motionPreset="none"
      lazyMount
      unmountOnExit
      // Focus starts on the step's main control, and the focus trap asks
      // again whenever the focused control goes with its step.
      initialFocusEl={() => mainRef.current ?? closeRef.current}
    >
      {isBrowser ? createPortal(overlay, document.body) : overlay}
    </DialogRoot>
  )
}
