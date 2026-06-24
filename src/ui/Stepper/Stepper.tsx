'use client'

import {
  Box,
  HStack,
  Icon,
  Stack,
  type StackProps,
  Text,
  chakra,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuCheck, LuChevronDown, LuChevronRight } from 'react-icons/lu'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'

export type StepperSubStep = {
  id: string
  label: string
}

export type StepperStep = {
  id: string
  label: string
  subSteps?: StepperSubStep[]
}

export type StepperProps = {
  /** Ordered major steps; each may contain sub-steps. */
  steps: StepperStep[]
  /** Active sub-step id (or step id when a step has no sub-steps). */
  activeSubStepId: string
  /** Completed sub-step ids. */
  completedSubStepIds?: ReadonlySet<string> | readonly string[]
  /** Returns whether a sub-step is navigable. Defaults to always unlocked. */
  isSubStepUnlocked?: (id: string) => boolean
  /** Navigate to a sub-step. */
  onSelectSubStep?: (id: string) => void
} & Omit<StackProps, 'children' | 'onSelect'>

/**
 * SDL vertical Stepper. References semantic roles only.
 *
 * GREEN-INK: the active step badge is an `action.primary` (green) fill, so its
 * glyph uses `text.onGreen` ink — never white. Status of each step (active /
 * complete / upcoming) is conveyed by shape + icon (number, check tick, dot)
 * as well as color, so meaning never rests on color alone.
 */
function StepNumber({
  active,
  complete,
  children,
}: {
  active: boolean
  complete: boolean
  children: ReactNode
}) {
  return (
    <Box
      boxSize="28px"
      borderRadius="full"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize="sm"
      fontWeight={700}
      flexShrink={0}
      // GREEN-INK: active green fill pairs with `text.onGreen` ink, never white.
      bg={
        active
          ? 'action.primary'
          : complete
            ? 'status.success.soft'
            : 'transparent'
      }
      color={
        active ? 'text.onGreen' : complete ? 'status.success.fg' : 'text.muted'
      }
      borderWidth={active || complete ? '0' : '1px'}
      borderColor="border.strong"
      transitionProperty="background-color, color, border-color"
      transitionDuration={sdlMotion.duration.moderate}
      transitionTimingFunction={sdlMotion.easing.standard}
    >
      {complete && !active ? (
        <Icon as={LuCheck} boxSize="14px" aria-hidden />
      ) : (
        children
      )}
    </Box>
  )
}

function SubStepDot({
  active,
  complete,
}: {
  active: boolean
  complete: boolean
}) {
  return (
    <Box
      boxSize="10px"
      borderRadius="full"
      flexShrink={0}
      aria-hidden
      bg={
        active
          ? 'action.primary'
          : complete
            ? 'status.success.solid'
            : 'transparent'
      }
      borderWidth={active || complete ? '0' : '2px'}
      borderColor="border.strong"
      transitionProperty="background-color, border-color"
      transitionDuration={sdlMotion.duration.moderate}
      transitionTimingFunction={sdlMotion.easing.standard}
    />
  )
}

/** Universal vertical stepper with collapsible sub-steps for the active group. */
export function Stepper({
  steps,
  activeSubStepId,
  completedSubStepIds,
  isSubStepUnlocked,
  onSelectSubStep,
  ...rest
}: StepperProps) {
  const completed =
    completedSubStepIds instanceof Set
      ? completedSubStepIds
      : new Set(completedSubStepIds ?? [])

  let activeMajorIndex = 0
  for (let i = 0; i < steps.length; i += 1) {
    const ids = steps[i].subSteps?.map((sub) => sub.id) ?? [steps[i].id]
    if (ids.includes(activeSubStepId)) {
      activeMajorIndex = i
      break
    }
  }

  return (
    <Stack as="nav" gap={1} w="full" {...rest}>
      {steps.map((major, majorIdx) => {
        const isActiveMajor = majorIdx === activeMajorIndex
        const isCompleteMajor = majorIdx < activeMajorIndex
        const subSteps = major.subSteps ?? []

        return (
          <Box key={major.id} w="full">
            <HStack gap={3} align="center" py={2}>
              <StepNumber active={isActiveMajor} complete={isCompleteMajor}>
                {majorIdx + 1}
              </StepNumber>
              <Text
                flex={1}
                fontSize="sm"
                fontWeight={isActiveMajor ? 700 : 600}
                color={isActiveMajor ? 'text.default' : 'text.muted'}
                aria-current={isActiveMajor ? 'step' : undefined}
              >
                {major.label}
              </Text>
              {subSteps.length > 0 ? (
                <Icon
                  as={isActiveMajor ? LuChevronDown : LuChevronRight}
                  boxSize="18px"
                  aria-hidden
                  color={isActiveMajor ? 'status.success.fg' : 'text.muted'}
                />
              ) : null}
            </HStack>

            {isActiveMajor && subSteps.length > 0 ? (
              <Stack
                gap={0}
                pl="14px"
                ml="13px"
                borderLeftWidth="2px"
                borderColor="status.success.solid"
                pb={2}
              >
                {subSteps.map((sub) => {
                  const isActiveSub = sub.id === activeSubStepId
                  const isComplete = completed.has(sub.id)
                  const unlocked = isSubStepUnlocked?.(sub.id) ?? true

                  return (
                    <chakra.button
                      key={sub.id}
                      type="button"
                      display="flex"
                      alignItems="center"
                      gap={3}
                      w="full"
                      textAlign="left"
                      // >=44px touch target for the navigable sub-step row.
                      minH="44px"
                      px={1}
                      borderRadius="md"
                      bg="transparent"
                      cursor={unlocked ? 'pointer' : 'not-allowed'}
                      opacity={unlocked ? 1 : 0.45}
                      disabled={!unlocked}
                      aria-current={isActiveSub ? 'step' : undefined}
                      transitionProperty="background-color, color"
                      transitionDuration={sdlMotion.duration.moderate}
                      transitionTimingFunction={sdlMotion.easing.standard}
                      _hover={unlocked ? { bg: 'bg.subtle' } : undefined}
                      _focusVisible={sdlFocusRing}
                      _disabled={{ cursor: 'not-allowed' }}
                      onClick={() => {
                        if (unlocked) onSelectSubStep?.(sub.id)
                      }}
                    >
                      <SubStepDot active={isActiveSub} complete={isComplete} />
                      <Text
                        fontSize="sm"
                        fontWeight={isActiveSub ? 600 : 500}
                        color={isActiveSub ? 'text.link' : 'text.muted'}
                      >
                        {sub.label}
                      </Text>
                    </chakra.button>
                  )
                })}
              </Stack>
            ) : null}
          </Box>
        )
      })}
    </Stack>
  )
}
