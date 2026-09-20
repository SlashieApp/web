'use client'

import { Box, HStack, Text, chakra } from '@chakra-ui/react'
import { useState, useSyncExternalStore } from 'react'
import { LuGlobe } from 'react-icons/lu'

import { type AppLocale, LOCALES, LOCALE_LABELS } from '@/i18n/locales'
import { useI11n } from '@/i18n/useI11n'

import { useDrawerClose, useInsideDrawer } from '../Drawer'
import { Dropdown, useDropdownClose } from '../Dropdown'
import { IconButton } from '../IconButton'

import bag from './i11n.json'

const LanguageOptionButton = chakra('button')

let languageOverlayRequested = false
const languageOverlayListeners = new Set<() => void>()

function subscribeLanguageOverlay(onStoreChange: () => void) {
  languageOverlayListeners.add(onStoreChange)
  return () => {
    languageOverlayListeners.delete(onStoreChange)
  }
}

function getLanguageOverlayRequest() {
  return languageOverlayRequested
}

function requestLanguageOverlay() {
  languageOverlayRequested = true
  for (const listener of languageOverlayListeners) listener()
}

function consumeLanguageOverlayRequest() {
  languageOverlayRequested = false
}

export type LanguageSwitcherProps = {
  /** Active locale (URL / provider). */
  locale: AppLocale
  /** Called when the user picks a different locale. */
  onSelect: (locale: AppLocale) => void
  /** Invert colors for dark marketing hero overlay. */
  overlay?: boolean
  /** Accessible label for the trigger. Defaults to colocated i11n. */
  label?: string
}

/**
 * Presentational language switcher. Locale persistence / routing belong in the
 * app adapter that supplies `locale` + `onSelect`.
 *
 * Always an icon that opens a dropdown. When nested in another overlay, the
 * current overlay closes and the header-hosted language dropdown stays open.
 */
export function LanguageSwitcher({
  locale,
  onSelect,
  overlay = false,
  label,
}: LanguageSwitcherProps) {
  const t = useI11n(bag)
  const resolvedLabel = label?.trim() || t.label
  const insideDrawer = useInsideDrawer()
  const closeDrawer = useDrawerClose()
  const closeDropdown = useDropdownClose()
  const isNested = insideDrawer

  const requested = useSyncExternalStore(
    subscribeLanguageOverlay,
    getLanguageOverlayRequest,
    () => false,
  )
  const [hostOpen, setHostOpen] = useState(false)
  if (requested && !isNested && !hostOpen) {
    consumeLanguageOverlayRequest()
    setHostOpen(true)
  }

  const options = (close?: () => void) => (
    <Box py={1}>
      {LOCALES.map((code) => {
        const selected = code === locale
        const meta = LOCALE_LABELS[code]
        return (
          <LanguageOptionButton
            key={code}
            type="button"
            role="menuitemradio"
            aria-checked={selected}
            w="full"
            textAlign="left"
            px={3}
            py={2}
            cursor="pointer"
            bg={selected ? 'bg.subtle' : 'transparent'}
            _hover={{ bg: 'bg.subtle' }}
            onClick={() => {
              onSelect(code)
              close?.()
            }}
          >
            <HStack justify="space-between" gap={3}>
              <Text fontSize="sm" fontWeight={selected ? 700 : 500}>
                {meta.native}
              </Text>
              <Text fontSize="xs" color="text.muted" fontWeight={600}>
                {meta.short}
              </Text>
            </HStack>
          </LanguageOptionButton>
        )
      })}
    </Box>
  )

  const trigger = (
    <IconButton
      aria-label={resolvedLabel}
      size="sm"
      variant="ghost"
      color={overlay ? 'text.onInverted' : 'text.default'}
      _hover={
        overlay
          ? { bg: 'bg.glass', color: 'text.onInverted' }
          : { bg: 'bg.subtle' }
      }
      onClick={
        isNested
          ? () => {
              requestLanguageOverlay()
              closeDropdown()
              closeDrawer()
            }
          : undefined
      }
    >
      <LuGlobe size={18} aria-hidden />
    </IconButton>
  )

  if (isNested) return trigger

  return (
    <Dropdown
      allowNested
      align="end"
      width="180px"
      mobilePlacement="bottom"
      contentLabel={resolvedLabel}
      open={hostOpen}
      onOpenChange={setHostOpen}
      trigger={trigger}
    >
      {({ close }) => options(close)}
    </Dropdown>
  )
}
