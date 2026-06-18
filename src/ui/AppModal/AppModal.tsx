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

export type AppModalSize = 'sm' | 'md' | 'lg'

const sizeMaxW: Record<AppModalSize, string> = {
  sm: '400px',
  md: '480px',
  lg: '560px',
}

export type AppModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  size?: AppModalSize
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

export function AppModal({
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
}: AppModalProps) {
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
      <DialogBackdrop bg="blackAlpha.600" />
      <DialogPositioner p={4}>
        <DialogContent
          colorPalette="green"
          bg="white"
          borderRadius="xl"
          boxShadow="lg"
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
            borderColor="neutral.300"
          >
            <HStack align="center" justify="space-between" gap={3}>
              <DialogTitle
                fontFamily="heading"
                fontSize="lg"
                fontWeight={800}
                color="neutral.900"
                lineHeight="short"
                letterSpacing="-0.02em"
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

          <DialogBody px={modalPaddingX} py={5}>
            <Stack gap={4}>{children}</Stack>
          </DialogBody>

          {showFooter ? (
            <DialogFooter
              px={modalPaddingX}
              py={4}
              borderTopWidth="1px"
              borderColor="neutral.300"
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
                      minH="44px"
                    >
                      {backLabel}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancel}
                      minH="44px"
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
                      minH="44px"
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
