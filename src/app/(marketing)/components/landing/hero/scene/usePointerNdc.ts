'use client'

import { useThree } from '@react-three/fiber'
import { type RefObject, useEffect, useRef } from 'react'

export type PointerNdc = { x: number; y: number; active: boolean }

export type PointerNdcRef = RefObject<PointerNdc>

/**
 * Pointer position in canvas NDC space, tracked on `window` so the scene keeps
 * reacting even when the pointer is over hero copy that sits above the canvas
 * (the canvas itself is pointer-events: none so links/CTAs stay clickable).
 *
 * Call ONCE per scene (from the scene root) and pass the ref down — one window
 * listener and one getBoundingClientRect per event for the whole scene.
 */
export function usePointerNdc(): PointerNdcRef {
  const gl = useThree((state) => state.gl)
  const ndcRef = useRef<PointerNdc>({ x: 0, y: 0, active: false })

  useEffect(() => {
    const element = gl.domElement

    const onPointerMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      const inside = x >= -1.05 && x <= 1.05 && y >= -1.05 && y <= 1.05
      ndcRef.current.x = x
      ndcRef.current.y = y
      ndcRef.current.active = inside
    }

    const onPointerLeave = () => {
      ndcRef.current.active = false
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerleave', onPointerLeave)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [gl])

  return ndcRef
}
