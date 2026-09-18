'use client'

import { chakra } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { sdlFocusRing, sdlMotion } from '@/theme/styles'

import { Button } from '../Button/Button'
import { useOpenFeedbackDialog } from './FeedbackDialogProvider'
import bag from './i11n.json'

export type FeedbackTriggerVariant = 'footer' | 'footerMeta' | 'nav' | 'button'

export type FeedbackTriggerProps = {
  variant?: FeedbackTriggerVariant
  /** Called after the trigger opens the dialog (e.g. close a parent menu). */
  onOpened?: () => void
}

const FooterLinkButton = chakra('button')

const footerLinkProps = {
  display: 'inline-flex',
  alignItems: 'center',
  textAlign: 'left' as const,
  bg: 'transparent',
  border: 0,
  p: 0,
  cursor: 'pointer',
  fontFamily: 'inherit',
  lineHeight: 'inherit',
  outline: 'none',
  transitionProperty: 'color, background-color',
  transitionDuration: sdlMotion.duration.moderate,
  transitionTimingFunction: sdlMotion.easing.standard,
  _focusVisible: sdlFocusRing,
}

/**
 * Presentational trigger that opens the dialog from {@link FeedbackDialogProvider}.
 */
export function FeedbackTrigger({
  variant = 'button',
  onOpened,
}: FeedbackTriggerProps) {
  const t = useI11n(bag)
  const openDialog = useOpenFeedbackDialog()

  const onClick = () => {
    openDialog()
    onOpened?.()
  }

  if (variant === 'footer') {
    return (
      <FooterLinkButton
        type="button"
        onClick={onClick}
        {...footerLinkProps}
        fontWeight={600}
        fontSize="sm"
        color="text.default"
        _hover={{ color: 'text.link' }}
      >
        {t.trigger}
      </FooterLinkButton>
    )
  }

  if (variant === 'footerMeta') {
    return (
      <FooterLinkButton
        type="button"
        onClick={onClick}
        {...footerLinkProps}
        fontSize="sm"
        color="text.muted"
        _hover={{ color: 'text.link' }}
      >
        {t.trigger}
      </FooterLinkButton>
    )
  }

  if (variant === 'nav') {
    return (
      <Button
        type="button"
        variant="ghost"
        justifyContent="flex-start"
        w="full"
        h="auto"
        minH="44px"
        px={3}
        py={2}
        borderRadius="md"
        fontSize="sm"
        fontWeight={600}
        color="text.default"
        onClick={onClick}
      >
        {t.triggerMenu}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      aria-label={t.triggerAria}
    >
      {t.trigger}
    </Button>
  )
}
