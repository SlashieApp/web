'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuCheck, LuMapPin, LuX } from 'react-icons/lu'

import { PhoneMap } from '../PhoneMap'
import type { PhoneCopy } from '../phoneCopy'
import { DemoCard, DemoPrimary, Hotspot } from '../phoneParts'
import { enterStyle, useDemoBeat, useTypewriter } from '../useDemoBeat'

function FieldLabel({ children }: { children: string }) {
  return (
    <Text fontSize="13px" fontWeight={500} color="text.muted" mb="6px">
      {children}
    </Text>
  )
}

/** Create task: the title types itself, a pin drops, then "Post task". */
export function PostScreen({
  copy,
  active,
  intro,
}: {
  copy: PhoneCopy
  active: boolean
  intro?: boolean
}) {
  // Reduced motion rests the form un-played (the toast replaces the app bar's
  // title while it shows), with the hotspot still tappable.
  const { entered, done, trigger, reduced } = useDemoBeat(active, intro, false)
  const title = useTypewriter(copy.post.whatValue, entered, reduced)
  const typing = title.length < copy.post.whatValue.length
  const t = copy.post

  return (
    <Stack position="absolute" inset={0} gap={0} bg="bg.canvas">
      <HStack
        h="52px"
        px="16px"
        justify="space-between"
        borderBottomWidth="1px"
        borderColor="border.default"
        bg="bg.surface"
      >
        <Box color="text.default" display="inline-flex" aria-hidden>
          <LuX size={22} aria-hidden />
        </Box>
        <Text fontSize="16px" fontWeight={500} letterSpacing="-0.01em">
          {t.header}
        </Text>
        <Box w="22px" />
      </HStack>

      <Stack gap="12px" p="16px" flex={1}>
        <DemoCard style={enterStyle(entered, 0)}>
          <FieldLabel>{t.whatLabel}</FieldLabel>
          <Box
            minH="46px"
            px="12px"
            py="11px"
            borderRadius="8px"
            borderWidth="1px"
            borderColor={typing ? 'border.focus' : 'border.strong'}
            boxShadow={
              typing ? '0 0 0 1px var(--chakra-colors-border-focus)' : 'none'
            }
            bg="bg.surface"
            fontSize="15px"
            fontWeight={500}
          >
            {title}
            {typing ? (
              <Box
                as="span"
                display="inline-block"
                w="2px"
                h="17px"
                ml="1px"
                bg="text.default"
                verticalAlign="text-bottom"
              />
            ) : null}
          </Box>
        </DemoCard>

        <DemoCard style={enterStyle(entered, 1)}>
          <FieldLabel>{t.whereLabel}</FieldLabel>
          <Box
            position="relative"
            h="118px"
            borderRadius="8px"
            overflow="hidden"
            borderWidth="1px"
            borderColor="border.default"
          >
            <PhoneMap
              css={{
                '& svg': {
                  transform: 'scale(1.3)',
                  transformOrigin: '70% 85%',
                },
              }}
            />
            <Box
              position="absolute"
              left="50%"
              top="50%"
              color="accent.active"
              style={{
                transform: entered
                  ? 'translate(-50%, -100%)'
                  : 'translate(-50%, -260%)',
                opacity: entered ? 1 : 0,
                transition:
                  'transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1) 900ms, opacity 200ms ease 900ms',
              }}
            >
              <LuMapPin
                size={34}
                fill="currentColor"
                stroke="var(--chakra-colors-bg-surface)"
                aria-hidden
              />
            </Box>
          </Box>
          <HStack mt="8px" gap="6px" fontSize="14px" fontWeight={500}>
            <LuMapPin size={14} aria-hidden />
            <Text>{t.whereValue}</Text>
          </HStack>
        </DemoCard>

        <DemoCard style={enterStyle(entered, 2)}>
          <FieldLabel>{t.whenLabel}</FieldLabel>
          <HStack gap="8px">
            <Box
              px="12px"
              py="7px"
              borderRadius="full"
              bg="status.success.soft"
              borderWidth="1px"
              borderColor="status.success.border"
              color="status.success.fg"
              fontSize="13px"
              fontWeight={500}
            >
              {t.whenValue}
            </Box>
            <Box
              px="12px"
              py="7px"
              borderRadius="full"
              borderWidth="1px"
              borderColor="border.strong"
              fontSize="13px"
              fontWeight={500}
              color="text.muted"
            >
              {t.whenOther}
            </Box>
          </HStack>
        </DemoCard>

        <DemoCard style={enterStyle(entered, 3)}>
          <HStack justify="space-between">
            <FieldLabel>{t.budgetLabel}</FieldLabel>
            <Text
              fontSize="22px"
              fontWeight={600}
              fontVariantNumeric="tabular-nums"
            >
              {t.budgetValue}
            </Text>
          </HStack>
        </DemoCard>
      </Stack>

      <Box px="16px" pb="44px" style={enterStyle(entered, 4)}>
        <Hotspot
          label={t.submit}
          onPress={trigger}
          pulse={!done}
          w="full"
          borderRadius="full"
        >
          <DemoPrimary>
            {done ? <LuCheck size={18} aria-hidden /> : null}
            {done ? t.postedTitle : t.submit}
          </DemoPrimary>
        </Hotspot>
      </Box>

      {done ? (
        // The toast takes the app bar's place, over the title and the close
        // button, so it never covers a field: the bar is 52px and the toast
        // 46px, and the first field starts 16px under the bar.
        <Box
          position="absolute"
          left="8px"
          right="8px"
          top="3px"
          zIndex={3}
          data-post-toast=""
          css={{ animation: 'fade-rise 380ms cubic-bezier(0.2, 0, 0, 1) both' }}
        >
          <DemoCard
            display="flex"
            gap="10px"
            alignItems="center"
            py="6px"
            px="12px"
            bg="status.success.soft"
            borderColor="status.success.border"
          >
            <Box
              w="32px"
              h="32px"
              borderRadius="full"
              bg="action.primary"
              color="text.onGreen"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <LuCheck size={18} aria-hidden />
            </Box>
            <Stack gap={0}>
              <Text fontSize="15px" lineHeight="17px" fontWeight={500}>
                {t.postedTitle}
              </Text>
              <Text fontSize="13px" lineHeight="15px" color="text.muted">
                {t.postedBody}
              </Text>
            </Stack>
          </DemoCard>
        </Box>
      ) : null}
    </Stack>
  )
}
