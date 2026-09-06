'use client'

import { Box, Text } from '@chakra-ui/react'
import { useCallback, useRef } from 'react'

import { useTaskBrowseData } from '@/app/(task)/context/TaskBrowseProvider'
import { useI11n } from '@/i18n/useI11n'
import { useColorMode } from '@/ui/color-mode'
import { whenElementHasLayout } from '@/utils/whenElementHasLayout'

import {
  type WorkersAreaMapController,
  createWorkersAreaMapController,
} from '../helpers/workersAreaMap'
import bag from '../i11n.json'

export const WORKERS_MAP_H = {
  base: '200px',
  md: '360px',
  lg: '380px',
} as const

/**
 * Banner map for /workers: frames the submitted search area and highlights
 * the radius disc. Camera follows area/radius changes after the map is ready.
 */
export function WorkersAreaMap() {
  const t = useI11n(bag)
  const { colorMode } = useColorMode()
  const {
    searchCenterLat,
    searchCenterLng,
    radiusMiles,
    markMapReadyForQuery,
  } = useTaskBrowseData()
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim()
  const markReadyRef = useRef(markMapReadyForQuery)
  markReadyRef.current = markMapReadyForQuery

  const controllerRef = useRef<WorkersAreaMapController | null>(null)
  const areaRef = useRef({
    lat: searchCenterLat,
    lng: searchCenterLng,
    miles: radiusMiles,
    themeMode: colorMode,
  })
  areaRef.current = {
    lat: searchCenterLat,
    lng: searchCenterLng,
    miles: radiusMiles,
    themeMode: colorMode,
  }

  const lastAreaKeyRef = useRef<string | null>(null)
  const areaKey = `${searchCenterLat.toFixed(5)}|${searchCenterLng.toFixed(5)}|${radiusMiles}|${colorMode}`
  if (lastAreaKeyRef.current !== areaKey) {
    lastAreaKeyRef.current = areaKey
    const controller = controllerRef.current
    if (controller) {
      controller.setThemeMode(colorMode)
      controller.setArea(searchCenterLat, searchCenterLng, radiusMiles)
    }
  }

  const onContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      controllerRef.current?.destroy()
      controllerRef.current = null
      if (!node || !accessToken) return

      const cancelLayout = whenElementHasLayout(node, () => {
        const area = areaRef.current
        controllerRef.current = createWorkersAreaMapController({
          container: node,
          accessToken,
          lat: area.lat,
          lng: area.lng,
          radiusMiles: area.miles,
          themeMode: area.themeMode === 'dark' ? 'dark' : 'light',
          onMapReady: () => markReadyRef.current(true),
        })
      })

      return () => {
        cancelLayout()
        controllerRef.current?.destroy()
        controllerRef.current = null
      }
    },
    [accessToken],
  )

  if (!accessToken) {
    return (
      <Box
        w="full"
        h={WORKERS_MAP_H}
        bg="bg.subtle"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={4}
      >
        <Text fontSize="sm" color="text.muted" textAlign="center">
          {t.mapUnavailable}
        </Text>
      </Box>
    )
  }

  return (
    <Box
      ref={onContainerRef}
      role="img"
      aria-label={t.mapAriaLabel}
      w="full"
      h={WORKERS_MAP_H}
      bg="bg.subtle"
    />
  )
}
