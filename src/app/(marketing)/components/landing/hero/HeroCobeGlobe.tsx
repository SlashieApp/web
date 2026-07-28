'use client'

import { Box, Text } from '@chakra-ui/react'
import createGlobe, { type Globe } from 'cobe'
import { useCallback, useRef, useState } from 'react'

import { useDeviceTier } from '../hooks/useDeviceTier'
import {
  HERO_GLOBE_BASE_COLOR,
  HERO_GLOBE_GLOW_COLOR,
  HERO_GLOBE_MARKERS,
  HERO_GLOBE_MARKER_COLOR,
} from './heroGlobeMarkers'

export type HeroGlobeLabel = {
  id: string
  label: string
}

type HeroCobeGlobeProps = {
  labels: readonly HeroGlobeLabel[]
}

const ROTATION_SPEED = 0.0028

/**
 * Right-pane COBE WebGL globe: dark ink sphere, brand-green task pins, and
 * floating HTML labels anchored via COBE CSS vars (`--cobe-{id}` /
 * `--cobe-visible-{id}`). Skips WebGL when the device tier is `off`
 * (reduced-motion / no-WebGL); pauses auto-rotate on weak tiers.
 *
 * Canvas is mounted into a host div (not a React-owned `<canvas>`) so COBE’s
 * wrapper DOM surgery does not fight React reconciliation on remount.
 */
export function HeroCobeGlobe({ labels }: HeroCobeGlobeProps) {
  const tier = useDeviceTier()
  const [ready, setReady] = useState(false)

  const globeRef = useRef<Globe | null>(null)
  const phiRef = useRef(0.4)
  const rafRef = useRef(0)
  const rotateRef = useRef(false)
  const onScreenRef = useRef(true)
  const sizeRef = useRef({ width: 0, height: 0 })
  const hostRef = useRef<HTMLDivElement | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null)

  const allowGlobe = tier != null && tier !== 'off'
  rotateRef.current = tier === 'mid' || tier === 'high'

  const stopLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [])

  const destroyGlobe = useCallback(() => {
    stopLoop()
    globeRef.current?.destroy()
    globeRef.current = null
    sizeRef.current = { width: 0, height: 0 }
    if (hostRef.current) hostRef.current.replaceChildren()
    setReady(false)
  }, [stopLoop])

  const startLoop = useCallback(() => {
    stopLoop()
    const globe = globeRef.current
    if (!globe) return

    // Weak / reduced-motion tiers: one static frame (createGlobe already
    // rendered once; this refresh keeps anchors aligned after layout).
    if (!rotateRef.current) {
      globe.update({ phi: phiRef.current })
      return
    }

    const tick = () => {
      const current = globeRef.current
      if (!current) return
      if (onScreenRef.current) {
        phiRef.current += ROTATION_SPEED
        current.update({ phi: phiRef.current })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [stopLoop])

  const mountGlobe = useCallback(
    (host: HTMLDivElement, width: number, height: number) => {
      destroyGlobe()
      if (width < 2 || height < 2) return

      const canvas = document.createElement('canvas')
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      canvas.style.display = 'block'
      host.replaceChildren(canvas)

      const dpr =
        tier === 'high'
          ? Math.min(window.devicePixelRatio || 1, 2)
          : Math.min(window.devicePixelRatio || 1, 1.5)

      sizeRef.current = { width, height }
      const globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width,
        height,
        phi: phiRef.current,
        theta: 0.18,
        dark: 1,
        diffuse: 1.15,
        mapSamples: tier === 'high' ? 18_000 : tier === 'mid' ? 12_000 : 8_000,
        mapBrightness: 3.2,
        mapBaseBrightness: 0.04,
        baseColor: HERO_GLOBE_BASE_COLOR,
        markerColor: HERO_GLOBE_MARKER_COLOR,
        glowColor: HERO_GLOBE_GLOW_COLOR,
        scale: 1.05,
        markerElevation: 0.02,
        markers: HERO_GLOBE_MARKERS.map((marker) => ({
          id: marker.id,
          location: [...marker.location] as [number, number],
          size: marker.size,
          color: HERO_GLOBE_MARKER_COLOR,
        })),
      })

      globeRef.current = globe
      setReady(true)
      startLoop()
    },
    [destroyGlobe, startLoop, tier],
  )

  const onHostRef = useCallback(
    (host: HTMLDivElement | null) => {
      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null
      hostRef.current = host

      if (!host || !allowGlobe) {
        destroyGlobe()
        return
      }

      const measureAndMount = () => {
        const width = Math.max(1, Math.floor(host.clientWidth))
        const height = Math.max(1, Math.floor(host.clientHeight))
        const prev = sizeRef.current
        if (
          globeRef.current &&
          prev.width === width &&
          prev.height === height
        ) {
          return
        }
        if (globeRef.current && prev.width > 0) {
          sizeRef.current = { width, height }
          globeRef.current.update({ width, height, phi: phiRef.current })
          return
        }
        mountGlobe(host, width, height)
      }

      measureAndMount()
      const observer = new ResizeObserver(measureAndMount)
      observer.observe(host)
      resizeObserverRef.current = observer
    },
    [allowGlobe, destroyGlobe, mountGlobe],
  )

  const onWrapperRef = useCallback((node: HTMLDivElement | null) => {
    intersectionObserverRef.current?.disconnect()
    intersectionObserverRef.current = null
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreenRef.current = entry?.isIntersecting ?? true
      },
      { rootMargin: '120px 0px' },
    )
    observer.observe(node)
    intersectionObserverRef.current = observer
  }, [])

  const labelById = new Map(labels.map((item) => [item.id, item.label]))

  return (
    <Box
      ref={onWrapperRef}
      position="absolute"
      inset={0}
      aria-hidden
      pointerEvents="none"
      opacity={allowGlobe && ready ? 1 : 0}
      transition="opacity 0.6s cubic-bezier(0.2, 0, 0, 1)"
      css={{
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
      }}
    >
      {allowGlobe ? (
        <Box ref={onHostRef} position="absolute" inset={0} />
      ) : null}

      {allowGlobe
        ? HERO_GLOBE_MARKERS.map((marker) => {
            const caption = labelById.get(marker.id)
            if (!caption) return null
            return (
              <Text
                key={marker.id}
                position="absolute"
                pointerEvents="none"
                whiteSpace="nowrap"
                fontSize={{ base: 'xs', md: 'sm' }}
                fontWeight={500}
                letterSpacing="0.01em"
                color="text.onInverted"
                textShadow="0 1px 10px rgba(12, 19, 16, 0.95), 0 0 2px rgba(12, 19, 16, 0.9)"
                css={{
                  positionAnchor: `--cobe-${marker.id}`,
                  bottom: 'anchor(top)',
                  left: 'anchor(center)',
                  translate: '-50% -0.55rem',
                  // COBE sets `--cobe-visible-{id}` when facing the camera;
                  // unset falls back to 0 so labels hide behind the globe.
                  opacity: `var(--cobe-visible-${marker.id}, 0)`,
                  transition: 'opacity 0.25s ease',
                  '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                  },
                }}
              >
                {caption}
              </Text>
            )
          })
        : null}
    </Box>
  )
}
