'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

import type { PointerNdcRef } from './usePointerNdc'

const BASE_POSITION = new THREE.Vector3(0, 4.1, 6.6)
const LOOK_TARGET = new THREE.Vector3(0, 0.25, -0.6)

/**
 * Smooth camera glide over the map: slow autonomous drift plus a gentle
 * pointer parallax, both exponentially damped so motion stays elegant.
 * Time accumulates from frame deltas (not clock.elapsedTime, which resets
 * when the frameloop pauses offscreen — the drift would snap on re-entry).
 */
export function CameraRig({ ndcRef }: { ndcRef: PointerNdcRef }) {
  const desired = useMemo(() => new THREE.Vector3(), [])
  const timeRef = useRef(0)

  useFrame((state, delta) => {
    timeRef.current += delta
    const t = timeRef.current
    const pointer = ndcRef.current
    const pointerX = pointer?.active ? pointer.x : 0
    const pointerY = pointer?.active ? pointer.y : 0

    desired.set(
      BASE_POSITION.x + Math.sin(t * 0.11) * 0.45 + pointerX * 0.55,
      BASE_POSITION.y + Math.sin(t * 0.08) * 0.18 - pointerY * 0.3,
      BASE_POSITION.z + Math.cos(t * 0.09) * 0.3,
    )

    const damping = 1 - Math.exp(-delta * 2.4)
    state.camera.position.lerp(desired, damping)
    state.camera.lookAt(LOOK_TARGET)
  })

  return null
}
