'use client'

import * as THREE from 'three'

import { LANDING_GREEN } from '../../landingPalette'

/** Deterministic PRNG so the scene layout is stable across renders. */
export function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeCanvas(size: number): CanvasRenderingContext2D | null {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  return canvas.getContext('2d')
}

/** Soft white radial glow — tint via material `color` (pins, particles). */
export function createGlowTexture(): THREE.CanvasTexture {
  const size = 128
  const ctx = makeCanvas(size)
  const canvas = ctx?.canvas ?? document.createElement('canvas')
  if (ctx) {
    const half = size / 2
    const gradient = ctx.createRadialGradient(half, half, 2, half, half, half)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
    gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.32)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function traceRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.arcTo(x + width, y, x + width, y + radius, radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
  ctx.lineTo(x + radius, y + height)
  ctx.arcTo(x, y + height, x, y + height - radius, radius)
  ctx.lineTo(x, y + radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.closePath()
}

/**
 * Floating £ beacon: glowing green pill with dark-ink price text.
 * GREEN-INK RULE: the label on the green fill is ink #0A1512, never white.
 */
export function createBeaconTexture(label: string): THREE.CanvasTexture {
  const width = 256
  const height = 128
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const centerX = width / 2
    const centerY = height / 2

    const glow = ctx.createRadialGradient(
      centerX,
      centerY,
      6,
      centerX,
      centerY,
      54,
    )
    glow.addColorStop(0, 'rgba(0, 220, 130, 0.32)')
    glow.addColorStop(1, 'rgba(0, 220, 130, 0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, width, height)

    const pillWidth = 128
    const pillHeight = 54
    traceRoundedRect(
      ctx,
      centerX - pillWidth / 2,
      centerY - pillHeight / 2,
      pillWidth,
      pillHeight,
      pillHeight / 2,
    )
    ctx.fillStyle = LANDING_GREEN.primary
    ctx.fill()

    ctx.fillStyle = LANDING_GREEN.ink
    ctx.font = '700 30px Inter, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, centerX, centerY + 1)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 2
  return texture
}
