'use client'

import {
  Box,
  type BoxProps,
  HStack,
  type HTMLChakraProps,
  Text,
  type TextProps,
  chakra,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import {
  LuCalendar,
  LuMessageSquare,
  LuPlus,
  LuSearch,
  LuStar,
  LuUser,
} from 'react-icons/lu'

import { sdlElevation, sdlFocusRing } from '@/theme/styles'

export type PhoneNavCopy = {
  search: string
  myTasks: string
  postTask: string
  messages: string
  account: string
}

export type PhoneTab = keyof PhoneNavCopy

/**
 * The app's real bottom bar (Search · My tasks · Post task · Messages ·
 * Account), drawn as a picture: it's decoration inside the demo, not links.
 * As in the app after the tone refresh: the active tab's icon and label are
 * ink, the others `text.subtle`, and the green Post button is the only green.
 */
export function PhoneTabBar({
  copy,
  active,
  unread = 0,
}: {
  copy: PhoneNavCopy
  active: PhoneTab
  unread?: number
}) {
  const items: { key: PhoneTab; icon: ReactNode }[] = [
    { key: 'search', icon: <LuSearch size={20} /> },
    { key: 'myTasks', icon: <LuCalendar size={20} /> },
    { key: 'postTask', icon: <LuPlus size={22} strokeWidth={2.5} /> },
    { key: 'messages', icon: <LuMessageSquare size={20} /> },
    { key: 'account', icon: <LuUser size={20} /> },
  ]
  return (
    <HStack
      position="absolute"
      left="10px"
      right="10px"
      bottom="26px"
      zIndex={4}
      px={2}
      py="6px"
      gap={0}
      justify="space-between"
      borderRadius="16px"
      bg="bg.surface"
      boxShadow={sdlElevation.e3}
      aria-hidden
    >
      {items.map(({ key, icon }) => {
        const isActive = key === active
        if (key === 'postTask') {
          return (
            <Box
              key={key}
              flex={1}
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap="2px"
            >
              <Box
                w="48px"
                h="48px"
                mt="-22px"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="action.primary"
                color="text.onGreen"
                boxShadow={sdlElevation.e2}
              >
                {icon}
              </Box>
              <Text fontSize="10px" fontWeight={500} color="text.default">
                {copy[key]}
              </Text>
            </Box>
          )
        }
        return (
          <Box
            key={key}
            flex={1}
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="2px"
            py="2px"
            color={isActive ? 'text.default' : 'text.subtle'}
          >
            <Box position="relative" display="inline-flex">
              {icon}
              {key === 'messages' && unread > 0 ? (
                <Box
                  position="absolute"
                  top="-5px"
                  right="-9px"
                  minW="16px"
                  h="16px"
                  px="4px"
                  borderRadius="full"
                  bg="status.success.solid"
                  color="text.onGreen"
                  fontSize="9px"
                  fontWeight={600}
                  fontVariantNumeric="tabular-nums"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {unread}
                </Box>
              ) : null}
            </Box>
            <Text fontSize="10px" fontWeight={500} color="inherit">
              {copy[key]}
            </Text>
          </Box>
        )
      })}
    </HStack>
  )
}

const HotspotButton = chakra('button')

/**
 * The screen's one tappable beat. A real button (keyboard and screen
 * readers work); the pulsing ring says "tap me" until the beat has played. The
 * ring is a line, so it is green 600 (green 400 is for fills) and it takes the
 * button's corners.
 */
export function Hotspot({
  label,
  onPress,
  pulse,
  children,
  ...props
}: Omit<HTMLChakraProps<'button'>, 'onClick' | 'children'> & {
  label: string
  onPress: () => void
  pulse: boolean
  children: ReactNode
}) {
  return (
    <HotspotButton
      type="button"
      aria-label={label}
      onClick={onPress}
      position="relative"
      display="block"
      textAlign="inherit"
      cursor="pointer"
      bg="transparent"
      p={0}
      borderRadius="12px"
      _focusVisible={sdlFocusRing}
      css={{ touchAction: 'manipulation' }}
      {...props}
    >
      {children}
      {pulse ? (
        <Box
          position="absolute"
          inset="-6px"
          borderRadius="inherit"
          borderWidth="2px"
          borderColor="accent.active"
          pointerEvents="none"
          animation="tap-pulse 1.6s cubic-bezier(0.2, 0, 0, 1) infinite"
          aria-hidden
        />
      ) : null}
    </HotspotButton>
  )
}

/** Initials avatar (demo people have no photos): a neutral disc, not mint. */
export function InitialAvatar({
  initials,
  size = 40,
}: {
  initials: string
  size?: number
}) {
  return (
    <Box
      w={`${size}px`}
      h={`${size}px`}
      flexShrink={0}
      borderRadius="full"
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border.default"
      color="text.default"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize={`${Math.round(size * 0.36)}px`}
      fontWeight={500}
      aria-hidden
    >
      {initials}
    </Box>
  )
}

/** Five stars, `filled` of them solid. */
export function Stars({
  filled,
  size = 14,
}: { filled: number; size?: number }) {
  return (
    <HStack gap="2px" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <Box
          key={n}
          color={n <= filled ? 'status.warning.solid' : 'border.strong'}
          display="inline-flex"
        >
          <LuStar
            size={size}
            fill={n <= filled ? 'currentColor' : 'none'}
            strokeWidth={2}
          />
        </Box>
      ))}
    </HStack>
  )
}

/** Small grey chip, like the task detail meta chips. */
export function MetaChip({ children, ...props }: TextProps) {
  return (
    <Text
      as="span"
      display="inline-flex"
      alignItems="center"
      gap="4px"
      px="10px"
      py="5px"
      borderRadius="full"
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      fontSize="12px"
      fontWeight={500}
      color="text.default"
      {...props}
    >
      {children}
    </Text>
  )
}

/** White card surface used across the demo screens: 12 corners, a hairline and `e1`. */
export function DemoCard({ children, ...props }: BoxProps) {
  return (
    <Box
      bg="bg.surface"
      borderRadius="12px"
      borderWidth="1px"
      borderColor="border.default"
      boxShadow={sdlElevation.e1}
      p="14px"
      {...props}
    >
      {children}
    </Box>
  )
}

/**
 * Green primary button look: a pill with an ink label (inside the demo it's a
 * picture or a Hotspot).
 */
export function DemoPrimary({ children, ...props }: BoxProps) {
  return (
    <Box
      h="48px"
      borderRadius="full"
      bg="action.primary"
      color="text.onGreen"
      fontSize="15px"
      fontWeight={500}
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap="6px"
      {...props}
    >
      {children}
    </Box>
  )
}
