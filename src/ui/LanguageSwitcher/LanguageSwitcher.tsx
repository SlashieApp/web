'use client'

import {
  Box,
  DialogBackdrop,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  HStack,
  Stack,
  Text,
  VisuallyHidden,
  chakra,
} from '@chakra-ui/react'
import { createPortal } from 'react-dom'
import { LuCheck } from 'react-icons/lu'

import { type AppLocale, LOCALES, LOCALE_LABELS } from '@/i18n/locales'
import { useI11n } from '@/i18n/useI11n'
import {
  APP_OVERLAY_Z_INDEX,
  overlayDescriptionStyle,
  sdlMotion,
} from '@/theme/styles'
import { useIsBrowser } from '@/utils/useIsBrowser'

import { IconButton } from '../IconButton'

import bag from './i11n.json'

const LanguageOptionLabel = chakra('label')

export type LanguageSwitcherProps = {
  /** Active locale (URL / provider). */
  locale: AppLocale
  /** Called when the user picks a locale. */
  onSelect: (locale: AppLocale) => void
  /** Full-page locale list visibility. The account menu owns the trigger. */
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Presentational language list. A full-page modal of locales — no nav trigger.
 * Locale persistence and routing belong in the app adapter.
 */
export function LanguageSwitcher({
  locale,
  onSelect,
  open,
  onOpenChange,
}: LanguageSwitcherProps) {
  const t = useI11n(bag)
  const isBrowser = useIsBrowser()

  const overlay = (
    <>
      <DialogBackdrop
        bg="bg.overlay"
        position="fixed"
        inset="0"
        zIndex={APP_OVERLAY_Z_INDEX}
      />
      <DialogPositioner
        p={0}
        position="fixed"
        inset="0"
        zIndex={APP_OVERLAY_Z_INDEX}
      >
        <DialogContent
          bg="bg.surface"
          color="text.default"
          w="100vw"
          maxW="100vw"
          h="100dvh"
          maxH="100dvh"
          m={0}
          borderRadius={0}
          borderWidth={0}
          boxShadow="none"
          display="flex"
          flexDirection="column"
          overflow="hidden"
          transitionProperty="opacity, transform"
          transitionDuration={sdlMotion.duration.moderate}
          transitionTimingFunction={sdlMotion.easing.standard}
        >
          {/* The title block of a dialog (Foundations-Form-Spacing): the
              description is `formSpace.titleToSubtitle` (8) under the title
              and the list is `headerToBody` (24) under the description, with
              no rule between them. The 44px close button is taller than the
              title, so its margins (-8) take it out of the row's height and
              the row's top padding (8) puts the title back where a 44px row
              had it: the description is 8 under the title text, not 8 under a
              row with slack. */}
          <DialogHeader px={{ base: 4, md: 8 }} pt={5} pb={0} flexShrink={0}>
            <Stack gap="form.titleToSubtitle" maxW="560px" mx="auto" w="full">
              <HStack align="center" justify="space-between" gap={3} pt={2}>
                <DialogTitle
                  fontFamily="body"
                  fontSize="xl"
                  fontWeight={500}
                  letterSpacing="-0.015em"
                  color="text.default"
                  lineHeight="28px"
                >
                  {t.title}
                </DialogTitle>
                <IconButton
                  aria-label={t.close}
                  variant="ghost"
                  my={-2}
                  onClick={() => onOpenChange(false)}
                >
                  ×
                </IconButton>
              </HStack>
              <DialogDescription {...overlayDescriptionStyle}>
                {t.description}
              </DialogDescription>
            </Stack>
          </DialogHeader>

          <DialogBody
            px={{ base: 4, md: 8 }}
            pt="form.headerToBody"
            pb={8}
            overflowY="auto"
          >
            <Stack maxW="560px" mx="auto" w="full">
              <Stack
                as="fieldset"
                border="0"
                m={0}
                p={0}
                minW={0}
                gap="form.alternativesGap"
              >
                <VisuallyHidden as="legend">{t.listLabel}</VisuallyHidden>
                {LOCALES.map((code) => {
                  const selected = code === locale
                  const meta = LOCALE_LABELS[code]
                  return (
                    <LanguageOptionLabel
                      key={code}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={3}
                      w="full"
                      textAlign="left"
                      minH="56px"
                      px={4}
                      py={3}
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor={
                        selected ? 'accent.active' : 'border.default'
                      }
                      bg={selected ? 'status.success.soft' : 'bg.surface'}
                      cursor="pointer"
                      _hover={{
                        bg: selected ? 'status.success.soft' : 'bg.subtle',
                      }}
                      _focusWithin={{
                        outline: '2px solid',
                        outlineColor: 'border.focus',
                        outlineOffset: '2px',
                      }}
                    >
                      <Stack gap={0} align="flex-start" flex={1} minW={0}>
                        <Text fontSize="md" fontWeight={selected ? 600 : 500}>
                          {meta.native}
                        </Text>
                        <Text fontSize="sm" color="text.muted" fontWeight={500}>
                          {meta.short}
                        </Text>
                      </Stack>
                      <HStack gap={2} flexShrink={0}>
                        {selected ? (
                          <Box color="status.success.fg" aria-hidden>
                            <LuCheck size={18} />
                          </Box>
                        ) : null}
                        <chakra.input
                          type="radio"
                          name="slashie-locale"
                          value={code}
                          checked={selected}
                          onChange={() => {
                            onSelect(code)
                            onOpenChange(false)
                          }}
                          boxSize="18px"
                          cursor="pointer"
                        />
                      </HStack>
                    </LanguageOptionLabel>
                  )
                })}
              </Stack>
            </Stack>
          </DialogBody>
        </DialogContent>
      </DialogPositioner>
    </>
  )

  if (!open || !isBrowser) return null

  return (
    <DialogRoot
      open
      onOpenChange={(details: { open: boolean }) => onOpenChange(details.open)}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      {createPortal(overlay, document.body)}
    </DialogRoot>
  )
}
