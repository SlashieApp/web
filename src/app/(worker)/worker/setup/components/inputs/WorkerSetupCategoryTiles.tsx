'use client'

import { Grid, Stack, Text, chakra } from '@chakra-ui/react'
import type { IconType } from 'react-icons'
import {
  LuArmchair,
  LuBrush,
  LuDroplets,
  LuEllipsis,
  LuHammer,
  LuLeaf,
  LuMonitor,
  LuShoppingBag,
  LuSparkles,
  LuTruck,
  LuWrench,
  LuZap,
} from 'react-icons/lu'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'

import { WORKER_PRIMARY_CATEGORIES } from '../../helpers/workerSetupCategories'

const CATEGORY_ICONS: Record<string, IconType> = {
  handyman: LuWrench,
  'furniture-assembly': LuArmchair,
  mounting: LuMonitor,
  plumbing: LuDroplets,
  electrical: LuZap,
  carpentry: LuHammer,
  painting: LuBrush,
  cleaning: LuSparkles,
  gardening: LuLeaf,
  removals: LuTruck,
  delivery: LuShoppingBag,
  other: LuEllipsis,
}

/** Real <button> for native keyboard semantics + `type="button"`. */
const TileButton = chakra('button')

export type WorkerSetupCategoryTilesProps = {
  value: string
  onChange: (slug: string) => void
  errorText?: string
}

/**
 * Primary-trade tile grid — the first question in "Your services".
 * Single-select toggle buttons (`aria-pressed`), matching the repo's
 * RadioButton compromise: Biome's useSemanticElements rejects `role="radio"`
 * on a <button>, and a native radio set is a larger follow-up.
 */
export function WorkerSetupCategoryTiles({
  value,
  onChange,
  errorText,
}: WorkerSetupCategoryTilesProps) {
  return (
    <Stack gap={2}>
      <Grid templateColumns={{ base: '1fr 1fr', md: '1fr 1fr 1fr' }} gap={2.5}>
        {WORKER_PRIMARY_CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category.slug] ?? LuEllipsis
          const selected = category.slug === value
          return (
            <TileButton
              key={category.slug}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(category.slug)}
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              gap={2}
              p={3}
              minH="72px"
              borderRadius="lg"
              borderWidth="2px"
              borderColor={selected ? 'action.primary' : 'border.default'}
              bg={selected ? 'status.success.soft' : 'bg.surface'}
              color={selected ? 'status.success.fg' : 'text.default'}
              cursor="pointer"
              textAlign="left"
              transitionProperty="background-color, border-color, color"
              transitionDuration={sdlMotion.duration.base}
              transitionTimingFunction={sdlMotion.easing.standard}
              _hover={
                selected
                  ? undefined
                  : { borderColor: 'border.strong', bg: 'bg.subtle' }
              }
              _focusVisible={sdlFocusRing}
            >
              <Icon size={18} strokeWidth={2} aria-hidden />
              <Text fontSize="sm" fontWeight={600} lineHeight="short">
                {category.label}
              </Text>
            </TileButton>
          )
        })}
      </Grid>
      {errorText ? (
        <Text fontSize="sm" color="status.danger.fg">
          {errorText}
        </Text>
      ) : null}
    </Stack>
  )
}
