'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { LANDING_GREEN, LANDING_ON_INK } from '../../landingPalette'
import { createGlowTexture, mulberry32 } from './textures'
import { usePointerNdc } from './usePointerNdc'

const MAX_LINKS = 4
const ANCHOR_SEARCH_RADIUS_SQ = 2.2 * 2.2
const NEIGHBOR_RADIUS_SQ = 1.9 * 1.9

/**
 * Local signals: a faint field of neutral particles over the map. Near the
 * cursor, green connection lines link a "customer" point to nearby "worker"
 * points — quotes arriving — and disperse smoothly as the pointer moves away.
 */
export function Signals({ particleCount }: { particleCount: number }) {
  const ndcRef = usePointerNdc()

  const glowTexture = useMemo(() => createGlowTexture(), [])
  useEffect(() => () => glowTexture.dispose(), [glowTexture])

  const particlePositions = useMemo(() => {
    const random = mulberry32(97)
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const angle = random() * Math.PI * 2
      const radius = Math.sqrt(random()) * 5.6
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = 0.2 + random() * 0.85
      positions[i * 3 + 2] = Math.sin(angle) * radius
    }
    return positions
  }, [particleCount])

  const linePositions = useMemo(() => new Float32Array(MAX_LINKS * 2 * 3), [])

  const lineGeometryRef = useRef<THREE.BufferGeometry>(null)
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null)
  const anchorSpriteRef = useRef<THREE.Sprite>(null)
  const anchorMaterialRef = useRef<THREE.SpriteMaterial>(null)

  const scratch = useMemo(
    () => ({
      raycaster: new THREE.Raycaster(),
      pointer: new THREE.Vector2(),
      groundPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      hit: new THREE.Vector3(),
      lastHit: new THREE.Vector3(Number.NaN, 0, 0),
      anchorIndex: -1,
      neighborIndices: [] as number[],
      opacity: 0,
    }),
    [],
  )

  useFrame((state, delta) => {
    const geometry = lineGeometryRef.current
    const material = lineMaterialRef.current
    if (!geometry || !material) return

    const { x, y, active } = ndcRef.current
    let targetOpacity = 0

    if (active) {
      scratch.pointer.set(x, y)
      scratch.raycaster.setFromCamera(scratch.pointer, state.camera)
      const hit = scratch.raycaster.ray.intersectPlane(
        scratch.groundPlane,
        scratch.hit,
      )

      if (hit) {
        // Re-pick anchor + neighbors only when the pointer moved meaningfully.
        const moved =
          Number.isNaN(scratch.lastHit.x) ||
          scratch.lastHit.distanceToSquared(hit) > 0.12
        if (moved) {
          scratch.lastHit.copy(hit)
          scratch.anchorIndex = -1
          let bestDistance = ANCHOR_SEARCH_RADIUS_SQ
          for (let i = 0; i < particleCount; i++) {
            const dx = particlePositions[i * 3] - hit.x
            const dz = particlePositions[i * 3 + 2] - hit.z
            const distanceSq = dx * dx + dz * dz
            if (distanceSq < bestDistance) {
              bestDistance = distanceSq
              scratch.anchorIndex = i
            }
          }

          scratch.neighborIndices.length = 0
          if (scratch.anchorIndex >= 0) {
            const ax = particlePositions[scratch.anchorIndex * 3]
            const az = particlePositions[scratch.anchorIndex * 3 + 2]
            const candidates: Array<{ index: number; distanceSq: number }> = []
            for (let i = 0; i < particleCount; i++) {
              if (i === scratch.anchorIndex) continue
              const dx = particlePositions[i * 3] - ax
              const dz = particlePositions[i * 3 + 2] - az
              const distanceSq = dx * dx + dz * dz
              if (distanceSq < NEIGHBOR_RADIUS_SQ) {
                candidates.push({ index: i, distanceSq })
              }
            }
            candidates.sort((a, b) => a.distanceSq - b.distanceSq)
            for (const candidate of candidates.slice(0, MAX_LINKS)) {
              scratch.neighborIndices.push(candidate.index)
            }
          }
        }

        if (scratch.anchorIndex >= 0 && scratch.neighborIndices.length > 0) {
          targetOpacity = 0.75
        }
      }
    }

    // Smooth appear/disperse.
    scratch.opacity +=
      (targetOpacity - scratch.opacity) * Math.min(1, delta * 5)
    material.opacity = scratch.opacity

    if (anchorMaterialRef.current) {
      anchorMaterialRef.current.opacity = scratch.opacity * 0.9
    }

    if (scratch.anchorIndex >= 0) {
      const ax = particlePositions[scratch.anchorIndex * 3]
      const ay = particlePositions[scratch.anchorIndex * 3 + 1]
      const az = particlePositions[scratch.anchorIndex * 3 + 2]

      if (anchorSpriteRef.current) {
        anchorSpriteRef.current.position.set(ax, ay, az)
      }

      for (let i = 0; i < MAX_LINKS; i++) {
        const neighborIndex = scratch.neighborIndices[i] ?? scratch.anchorIndex
        const offset = i * 6
        linePositions[offset] = ax
        linePositions[offset + 1] = ay
        linePositions[offset + 2] = az
        linePositions[offset + 3] = particlePositions[neighborIndex * 3]
        linePositions[offset + 4] = particlePositions[neighborIndex * 3 + 1]
        linePositions[offset + 5] = particlePositions[neighborIndex * 3 + 2]
      }
      const attribute = geometry.getAttribute(
        'position',
      ) as THREE.BufferAttribute
      attribute.needsUpdate = true
    }
  })

  return (
    <group>
      <points renderOrder={0}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          map={glowTexture}
          color={LANDING_ON_INK.muted}
          size={0.085}
          sizeAttenuation
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments renderOrder={2} frustumCulled={false}>
        <bufferGeometry ref={lineGeometryRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMaterialRef}
          color={LANDING_GREEN.accent}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      <sprite ref={anchorSpriteRef} scale={[0.5, 0.5, 1]} renderOrder={3}>
        <spriteMaterial
          ref={anchorMaterialRef}
          map={glowTexture}
          color={LANDING_GREEN.primary}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  )
}
