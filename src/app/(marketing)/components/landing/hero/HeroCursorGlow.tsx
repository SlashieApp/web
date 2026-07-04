'use client'

import { Box } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'

import { LANDING_GREEN } from '../landingPalette'

const GLOW_SIZE = 260

/**
 * Soft green glow that trails a fine pointer inside the hero (the native
 * cursor is never replaced — pointer affordances and a11y stay intact).
 * Inert for touch devices, reduced motion, and no-JS. The rAF loop runs only
 * while the glow is active (pointer inside the hero or still fading out).
 */
export function HeroCursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const parent = glow.parentElement
    if (!parent) return

    let raf = 0
    let running = false
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let visible = false
    let settledFrames = 0

    const tick = () => {
      currentX += (targetX - currentX) * 0.12
      currentY += (targetY - currentY) * 0.12
      glow.style.opacity = visible ? '1' : '0'
      glow.style.transform = `translate3d(${currentX - GLOW_SIZE / 2}px, ${currentY - GLOW_SIZE / 2}px, 0)`

      // Stop the loop once the pointer left and the lerp has settled — no
      // perpetual rAF while the hero is idle or offscreen.
      const settled =
        Math.abs(targetX - currentX) < 0.5 && Math.abs(targetY - currentY) < 0.5
      settledFrames = !visible && settled ? settledFrames + 1 : 0
      if (settledFrames > 30) {
        running = false
        return
      }
      raf = requestAnimationFrame(tick)
    }

    const ensureRunning = () => {
      if (running) return
      running = true
      raf = requestAnimationFrame(tick)
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect()
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      visible = inside
      if (inside) {
        targetX = event.clientX - rect.left
        targetY = event.clientY - rect.top
        ensureRunning()
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      cancelAnimationFrame(raf)
      running = false
    }
  }, [])

  return (
    <Box
      ref={glowRef}
      aria-hidden
      position="absolute"
      top={0}
      left={0}
      w={`${GLOW_SIZE}px`}
      h={`${GLOW_SIZE}px`}
      borderRadius="full"
      pointerEvents="none"
      opacity={0}
      transition="opacity 0.4s ease"
      bgImage={`radial-gradient(circle, ${LANDING_GREEN.cursorGlow} 0%, transparent 65%)`}
      mixBlendMode="screen"
    />
  )
}
