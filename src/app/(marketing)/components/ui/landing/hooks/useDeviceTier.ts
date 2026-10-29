'use client'

import { useEffect, useState } from 'react'

/**
 * Adaptive quality tier for the landing's 3D scene.
 * - `off`: prefers-reduced-motion or no WebGL: no canvas, the still poster.
 * - `low`: two objects, lower pixel ratio.
 * - `mid` / `high`: the full scene (`high` = desktop-class hardware).
 */
export type DeviceTier = 'high' | 'mid' | 'low' | 'off'

export type TierSettings = {
  /** Device-pixel-ratio cap for the canvas. */
  dprMax: number
}

export const TIER_SETTINGS: Record<Exclude<DeviceTier, 'off'>, TierSettings> = {
  high: { dprMax: 2 },
  mid: { dprMax: 1.5 },
  low: { dprMax: 1.25 },
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
