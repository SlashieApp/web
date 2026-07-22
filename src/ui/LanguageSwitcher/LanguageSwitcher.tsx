'use client'

import { Box, HStack, Text, chakra } from '@chakra-ui/react'
import { LuGlobe } from 'react-icons/lu'

import { type AppLocale, LOCALES, LOCALE_LABELS } from '@/i18n/locales'
import { useI11n } from '@/i18n/useI11n'

import { Dropdown } from '../Dropdown'
import { IconButton } from '../IconButton'

import bag from './i11n.json'

const LanguageOptionButton = chakra('button')

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
 */
export function LanguageSwitcher({
  locale,
  onSelect,
  overlay = false,
  label,
}: LanguageSwitcherProps) {
  const t = useI11n(bag)
  const resolvedLabel = label?.trim() || t.label

  return (
    <Dropdown
      align="end"
      width="180px"
      contentLabel={resolvedLabel}
      trigger={
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
        >
          <LuGlobe size={18} aria-hidden />
        </IconButton>
      }
    >
      {({ close }) => (
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
                  close()
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
      )}
    </Dropdown>
  )
}
