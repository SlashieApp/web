'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { LuCheck, LuLocateFixed, LuSearch } from 'react-icons/lu'

import { useTaskBrowseData } from '@/app/(task)/context/TaskBrowseProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlEyebrow, sdlFigure, sdlFocusRing } from '@/theme/styles'
import { Button, Input, Slider } from '@ui'

import { useWorkerSearch } from '../../context/WorkerSearchProvider'
import {
  kmToMilesRounded,
  milesToKmRounded,
} from '../../helpers/workerSearchHelpers'
import bag from '../../i11n.json'

export const WORKERS_FILTER_LABEL = sdlEyebrow

export function WorkersAreaInput() {
  const t = useI11n(bag)
  const {
    areaLocationInput,
    setAreaLocationInput,
    commitAreaLocationSearch,
    requestUseMyLocation,
  } = useTaskBrowseData()

  return (
    <Input
      pill
      startElement={
        <Box as="span" aria-hidden display="inline-flex">
          <LuSearch size={18} strokeWidth={2} />
        </Box>
      }
      endElement={
        <Button
          type="button"
          aria-label={t.useMyLocation}
          title={t.useMyLocation}
          display="flex"
          alignItems="center"
          justifyContent="center"
          minW={0}
          w={8}
          h={8}
          px={0}
          py={0}
          variant="ghost"
          color="text.muted"
          _hover={{ bg: 'bg.subtle', color: 'text.default' }}
          _focusVisible={sdlFocusRing}
          onClick={() => {
            void requestUseMyLocation()
          }}
        >
          <LuLocateFixed size={18} strokeWidth={2} aria-hidden />
        </Button>
      }
      value={areaLocationInput}
      placeholder={t.areaPlaceholder}
      type="search"
      inputMode="search"
      autoComplete="off"
      aria-label={t.areaAriaLabel}
      onChange={(e: ChangeEvent<HTMLInputElement>) =>
        setAreaLocationInput(e.target.value)
      }
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return
        e.preventDefault()
        commitAreaLocationSearch()
      }}
      onBlur={commitAreaLocationSearch}
    />
  )
}

/**
 * The skills and name search. In the filters drawer it is a labelled field of a
 * form, so it is `controlHeight` tall (`asField`, 48); in the search bar it is
 * the bar's own search, which keeps the 44px touch target.
 */
export function WorkersSkillsInput({ asField = false }: { asField?: boolean }) {
  const t = useI11n(bag)
  const { workerSearchInput, setWorkerSearchInput } = useWorkerSearch()

  return (
    <Input
      pill
      rootProps={asField ? { minH: 'form.controlHeight' } : undefined}
      startElement={
        <Box as="span" aria-hidden display="inline-flex">
          <LuSearch size={18} strokeWidth={2} />
        </Box>
      }
      value={workerSearchInput}
      placeholder={t.skillsPlaceholder}
      type="search"
      inputMode="search"
      autoComplete="off"
      aria-label={t.skillsAriaLabel}
      onChange={(e: ChangeEvent<HTMLInputElement>) =>
        setWorkerSearchInput(e.target.value)
      }
    />
  )
}

export function WorkersDistanceControl({
  layout,
}: {
  layout: 'inline' | 'block'
}) {
  const t = useI11n(bag)
  const { radiusMiles, setRadiusMiles } = useTaskBrowseData()
  const radiusKm = milesToKmRounded(radiusMiles)
  const valueLabel = formatMessage(t.distanceValue, { km: String(radiusKm) })

  const slider = (
    <Slider
      min={1}
      max={80}
      step={1}
      value={[radiusKm]}
      aria-label={[t.distanceLabel]}
      onValueChange={(d) => {
        const next = d.value[0]
        if (typeof next === 'number') setRadiusMiles(kmToMilesRounded(next))
      }}
    />
  )

  if (layout === 'inline') {
    return (
      <HStack gap={2} flex="0 1 200px" minW="140px" maxW="220px" align="center">
        <Text
          fontSize="sm"
          {...sdlFigure}
          color="text.link"
          whiteSpace="nowrap"
          flexShrink={0}
        >
          {valueLabel}
        </Text>
        <Box flex={1} minW="72px">
          {slider}
        </Box>
      </HStack>
    )
  }

  return (
    <Stack gap="form.labelToControl">
      {/* The label and the value share the label's 16px line and centre on
          it, so the row is one label tall and the 8 under it is measured from
          the label. */}
      <HStack justify="space-between" align="center">
        <Text {...WORKERS_FILTER_LABEL} mb={0}>
          {t.distanceLabel}
        </Text>
        <Text fontSize="sm" lineHeight="16px" {...sdlFigure} color="text.link">
          {valueLabel}
        </Text>
      </HStack>
      {slider}
    </Stack>
  )
}

export function WorkersVerifiedToggle() {
  const t = useI11n(bag)
  const { verifiedOnly, setVerifiedOnly } = useWorkerSearch()

  return (
    <Button
      type="button"
      size="sm"
      variant={verifiedOnly ? 'primary' : 'secondary'}
      borderRadius="full"
      flexShrink={0}
      aria-pressed={verifiedOnly}
      onClick={() => setVerifiedOnly(!verifiedOnly)}
    >
      {verifiedOnly ? (
        <Box as="span" display="inline-flex" aria-hidden>
          <LuCheck size={14} strokeWidth={3} />
        </Box>
      ) : null}
      {t.verifiedOnly}
    </Button>
  )
}
