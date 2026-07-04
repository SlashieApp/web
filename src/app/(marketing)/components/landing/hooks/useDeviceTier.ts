'use client'

import { useEffect, useState } from 'react'

/**
 * Adaptive quality tier for the WebGL hero.
 * - `off`: prefers-reduced-motion or no WebGL — render the static poster only.
 * - `low` / `mid` / `high`: scale particle counts, mesh density, DPR and bloom.
 */
export type DeviceTier = 'high' | 'mid' | 'low' | 'off'

export type TierSettings = {
  /** DPR cap passed to the R3F canvas. */
  dprMax: number
  /** Signal-particle count. */
  particles: number
  /** Small map-pin count (single Points draw call). */
  pins: number
  /** Terrain plane segments per axis. */
  terrainSegments: number
  /** Full-screen UnrealBloomPass (high tier only). */
  bloom: boolean
  antialias: boolean
}

export const TIER_SETTINGS: Record<Exclude<DeviceTier, 'off'>, TierSettings> = {
  high: {
    dprMax: 2,
    particles: 1400,
    pins: 26,
    terrainSegments: 160,
    bloom: true,
    antialias: true,
  },
  mid: {
    dprMax: 1.5,
    particles: 700,
    pins: 18,
    terrainSegments: 110,
    bloom: false,
    antialias: true,
  },
  low: {
    dprMax: 1.25,
    particles: 320,
    pins: 12,
    terrainSegments: 72,
    bloom: false,
    antialias: false,
  },
}

function supportsWebgl(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') ??
        canvas.getContext('webgl') ??
        canvas.getContext('experimental-webgl'),
    )
  } catch {
    return false
  }
}

export function detectDeviceTier(): DeviceTier {
  if (typeof window === 'undefined') return 'off'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return 'off'
  if (!supportsWebgl()) return 'off'

  const cores = navigator.hardwareConcurrency ?? 4
  const memory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches

  if (!coarsePointer && cores >= 8 && memory >= 8) return 'high'
  if (cores >= 4 && memory >= 4) return 'mid'
  return 'low'
}

/** `null` until measured on the client (the canvas mounts only after that). */
export function useDeviceTier(): DeviceTier | null {
  const [tier, setTier] = useState<DeviceTier | null>(null)
  useEffect(() => {
    setTier(detectDeviceTier())
  }, [])
  return tier
}
