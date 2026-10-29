'use client'

import {
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  HStack,
  Stack,
  chakra,
} from '@chakra-ui/react'
import type { FormEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { LuX } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import {
  APP_OVERLAY_Z_INDEX,
  overlayDescriptionStyle,
  sdlMotion,
} from '@/theme/styles'
import { useIsBrowser } from '@/utils/useIsBrowser'

import { Button } from '../Button'
import { IconButton as UiIconButton } from '../IconButton/IconButton'
import bag from './i11n.json'

/**
 * SDL Modal. A centred dialog built on Chakra/Ark `Dialog`, so it keeps a focus
 * trap, ESC-to-close, scrim click-away, and `prefers-reduced-motion` awareness
 * for free. Visuals reference SDL semantic roles only.
 *
 * SDL guarantees:
 * - Surface/border/text via roles (`bg.surface`, `border.default`, `text.*`).
 * - Close control is a >=44px `IconButton` that keeps its `aria-label` + focus ring.
 * - Footer primary action is `Button` (44px, green-ink, visible focus).
 * - Transitions use `sdlMotion`; the scrim/content animation honours reduced motion.
 *
 * Form spacing (FE-481, wiki Foundations-Form-Spacing): the header is the title,
 * then the optional `description` `formSpace.titleToSubtitle` (8) under it, and
 * the first field sits `formSpace.headerToBody` (24) below the header block.
 * The body ends so the last field is `formSpace.bodyToAction` (20) above the
 * buttons. The footer bar has no dividing line and the header has none either:
 * a rule inside those 24 would crowd them. The header and the bar stay put
 * (`scrollBehavior="inside"`): a tall body scrolls between them, so the buttons
 * are always reachable.
 *
 * `size` keeps its legacy `sm | md | lg` names; `description` is new and
 * optional. With `onSubmit`, the body and footer are a form, so Enter in a
 * field submits.
 */

const modalPaddingX = { base: 5, md: 6 } as const

export type ModalSize = 'sm' | 'md' | 'lg'

const sizeMaxW: Record<ModalSize, string> = {
  sm: '400px',
  md: '480px',
  lg: '560px',
}

export type ModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Muted line under the title (8 below it): the intro, not body copy. */
  description?: ReactNode
  children: ReactNode
  size?: ModalSize
  /** Secondary footer action (left). Defaults to "Cancel". */
  cancelLabel?: string
  onCancel?: () => void
  /** Primary footer action (right). */
  submitLabel?: string
  /** `danger` is the red button, for an action that cancels or removes. */
  submitVariant?: 'primary' | 'danger'
  onSubmit?: () => void
  submitLoading?: boolean
  submitDisabled?: boolean
  /** When set, shows a back-style secondary action instead of cancel. */
  backLabel?: string
  onBack?: () => void
  /** Hide default footer (use for custom footers in children). */
  hideFooter?: boolean
  footer?: ReactNode
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
  cancelLabel = 'Cancel',
  onCancel,
  submitLabel,
  submitVariant = 'primary',
  onSubmit,
  submitLoading = false,
  submitDisabled = false,
  backLabel,
  onBack,
  hideFooter = false,
  footer,
}: ModalProps) {
  const t = useI11n(bag)
  const showFooter = !hideFooter && (footer != null || submitLabel != null)
  const isBrowser = useIsBrowser()

  const handleClose = () => onOpenChange(false)

  const handleCancel = () => {
    if (onCancel) onCancel()
    else handleClose()
  }

  const handleBack = () => {
    if (onBack) onBack()
    else handleCancel()
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!submitDisabled && !submitLoading) onSubmit?.()
  }

  const bodyAndFooter = (
    <>
      <DialogBody
        px={modalPaddingX}
        pt="form.headerToBody"
        pb={showFooter ? 'form.bodyToAction' : 6}
      >
        <Stack gap={6} fontSize="md" color="text.muted" lineHeight="1.625">
          {children}
        </Stack>
      </DialogBody>

      {showFooter ? (
        <DialogFooter
          px={modalPaddingX}
          pt={0}
          pb={4}
          flexShrink={0}
          gap={3}
          justifyContent="flex-end"
        >
          {footer ?? (
            <HStack gap={3} w="full" justify="flex-end">
              {backLabel ? (
                <Button type="button" variant="secondary" onClick={handleBack}>
                  {backLabel}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                >
                  {cancelLabel}
                </Button>
              )}
              {submitLabel ? (
                <Button
                  type={onSubmit ? 'submit' : 'button'}
                  variant={submitVariant}
                  loading={submitLoading}
                  disabled={submitDisabled}
                  minW="120px"
                >
                  {submitLabel}
                </Button>
              ) : null}
            </HStack>
          )}
        </DialogFooter>
      ) : null}
    </>
  )

  const overlay = (
    <>
      {/* Scrim: dim + blur the canvas behind the dialog, using the SDL
          `bg.overlay` ink wash (not pure black). Fixed + high z-index so
          Header / map / dock dim even if a parent has overflow/transform. */}
      <DialogBackdrop
        bg="bg.overlay"
        backdropFilter="blur(4px)"
        position="fixed"
        inset="0"
        zIndex={APP_OVERLAY_Z_INDEX}
      />
      <DialogPositioner
        p={4}
        position="fixed"
        inset="0"
        zIndex={APP_OVERLAY_Z_INDEX}
      >
        <DialogContent
          bg="bg.surface"
          borderRadius="lg"
          boxShadow="e5"
          borderWidth="1px"
          borderColor="border.default"
          maxW={sizeMaxW[size]}
          maxH="full"
          w="full"
          mx="auto"
          overflow="hidden"
          transitionProperty="opacity, transform"
          transitionDuration={sdlMotion.duration.moderate}
          transitionTimingFunction={sdlMotion.easing.standard}
        >
          <DialogHeader px={modalPaddingX} pt={5} pb={0}>
            <Stack gap="form.titleToSubtitle" w="full">
              <HStack align="center" justify="space-between" gap={3}>
                <DialogTitle
                  fontFamily="body"
                  fontSize="20px"
                  fontWeight={500}
                  letterSpacing="-0.015em"
                  color="text.default"
                  lineHeight="short"
                  flex={1}
                  minW={0}
                >
                  {title}
                </DialogTitle>
                <DialogCloseTrigger asChild>
                  <UiIconButton
                    aria-label={t.close}
                    variant="ghost"
                    flexShrink={0}
                  >
                    <LuX size={20} strokeWidth={2} aria-hidden />
                  </UiIconButton>
                </DialogCloseTrigger>
              </HStack>
              {description ? (
                <DialogDescription {...overlayDescriptionStyle}>
                  {description}
                </DialogDescription>
              ) : null}
            </Stack>
          </DialogHeader>

          {onSubmit ? (
            <chakra.form display="contents" noValidate onSubmit={handleSubmit}>
              {bodyAndFooter}
            </chakra.form>
          ) : (
            bodyAndFooter
          )}
        </DialogContent>
      </DialogPositioner>
    </>
  )

  return (
    <DialogRoot
      open={open}
      onOpenChange={(details: { open: boolean }) => onOpenChange(details.open)}
      placement="center"
      motionPreset="scale"
      scrollBehavior="inside"
    >
      {isBrowser ? createPortal(overlay, document.body) : overlay}
    </DialogRoot>
  )
}
