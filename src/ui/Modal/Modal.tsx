'use client'

import {
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  HStack,
  Stack,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Button } from '../Button'
import { IconButton as UiIconButton } from '../IconButton/IconButton'

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
  children: ReactNode
  size?: ModalSize
  /** Secondary footer action (left). Defaults to "Cancel". */
  cancelLabel?: string
  onCancel?: () => void
  /** Primary footer action (right). */
  submitLabel?: string
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
  children,
  size = 'md',
  cancelLabel = 'Cancel',
  onCancel,
  submitLabel,
  onSubmit,
  submitLoading = false,
  submitDisabled = false,
  backLabel,
  onBack,
  hideFooter = false,
  footer,
}: ModalProps) {
  const showFooter = !hideFooter && (footer != null || submitLabel != null)

  const handleClose = () => onOpenChange(false)

  const handleCancel = () => {
    if (onCancel) onCancel()
    else handleClose()
  }

  const handleBack = () => {
    if (onBack) onBack()
    else handleCancel()
  }

  return (
    <DialogRoot
      open={open}
      onOpenChange={(details: { open: boolean }) => onOpenChange(details.open)}
      placement="center"
      motionPreset="scale"
    >
      <DialogBackdrop bg="blackAlpha.500" backdropFilter="blur(4px)" />
      <DialogPositioner p={4}>
        <DialogContent
          bg="cardBg"
          borderRadius="md"
          boxShadow="xl"
          borderWidth="1px"
          borderColor="cardBorder"
          maxW={sizeMaxW[size]}
          w="full"
          mx="auto"
          overflow="hidden"
        >
          <DialogHeader
            px={modalPaddingX}
            pt={5}
            pb={4}
            borderBottomWidth="1px"
            borderColor="cardBorder"
          >
            <HStack align="center" justify="space-between" gap={3}>
              <DialogTitle
                fontFamily="body"
                fontSize="20px"
                fontWeight={600}
                color="cardFg"
                lineHeight="short"
                flex={1}
                minW={0}
              >
                {title}
              </DialogTitle>
              <DialogCloseTrigger asChild>
                <UiIconButton aria-label="Close" variant="ghost" flexShrink={0}>
                  ×
                </UiIconButton>
              </DialogCloseTrigger>
            </HStack>
          </DialogHeader>

          <DialogBody px={modalPaddingX} py={6}>
            <Stack
              gap={6}
              fontSize="md"
              color="formLabelMuted"
              lineHeight="1.625"
            >
              {children}
            </Stack>
          </DialogBody>

          {showFooter ? (
            <DialogFooter
              px={modalPaddingX}
              py={4}
              borderTopWidth="1px"
              borderColor="cardBorder"
              gap={3}
              justifyContent="flex-end"
            >
              {footer ?? (
                <HStack gap={3} w="full" justify="flex-end">
                  {backLabel ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleBack}
                    >
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
                      type="button"
                      variant="primary"
                      onClick={onSubmit}
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
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}
