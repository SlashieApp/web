'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { BEACON_PRICES, LANDING_GREEN } from '../../landingPalette'
import { createBeaconTexture, createGlowTexture, mulberry32 } from './textures'

const PIN_BASE_SIZE = 0.42

/**
 * Glowing green location pins drifting over the living map (one Points draw
 * call) plus a handful of floating £ beacon sprites — the "quote moments" of
 * the scene. Additive blending makes the green read as the light source.
 */
export function MapPins({ pinCount }: { pinCount: number }) {
  const pointsMaterialRef = useRef<THREE.PointsMaterial>(null)
  const beaconGroupRef = useRef<THREE.Group>(null)

  const glowTexture = useMemo(() => createGlowTexture(), [])
  const beaconTextures = useMemo(
    () => BEACON_PRICES.map((price) => createBeaconTexture(price)),
    [],
  )

  useEffect(() => {
    return () => {
      glowTexture.dispose()
      for (const texture of beaconTextures) texture.dispose()
    }
  }, [glowTexture, beaconTextures])

  const pinPositions = useMemo(() => {
    const random = mulberry32(20260704)
    const positions = new Float32Array(pinCount * 3)
    for (let i = 0; i < pinCount; i++) {
      const angle = random() * Math.PI * 2
      const radius = 1 + random() * 4.4
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = 0.72 + random() * 0.5
      positions[i * 3 + 2] = Math.sin(angle) * radius
    }
    return positions
  }, [pinCount])

  const beacons = useMemo(() => {
    const random = mulberry32(4)
    return beaconTextures.map((texture, index) => {
      const angle =
        (index / beaconTextures.length) * Math.PI * 2 + random() * 0.7
      const radius = 1.6 + random() * 2.6
      return {
        texture,
        basePosition: new THREE.Vector3(
          Math.cos(angle) * radius,
          1.25 + random() * 0.5,
          Math.sin(angle) * radius,
        ),
        phase: random() * Math.PI * 2,
        speed: 0.5 + random() * 0.4,
      }
    })
  }, [beaconTextures])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Gentle collective pulse on the pin field.
    if (pointsMaterialRef.current) {
      pointsMaterialRef.current.size = PIN_BASE_SIZE + Math.sin(t * 1.4) * 0.05
      pointsMaterialRef.current.opacity = 0.78 + Math.sin(t * 0.9) * 0.1
    }

    // Per-beacon bob + drift.
    const group = beaconGroupRef.current
    if (group) {
      group.children.forEach((child, index) => {
        const beacon = beacons[index]
        if (!beacon) return
        child.position.y =
          beacon.basePosition.y +
          Math.sin(t * beacon.speed + beacon.phase) * 0.14
        child.position.x =
          beacon.basePosition.x + Math.sin(t * 0.22 + beacon.phase) * 0.1
        child.position.z =
          beacon.basePosition.z + Math.cos(t * 0.19 + beacon.phase) * 0.1
      })
    }
  })

  return (
    <group>
      <points renderOrder={1}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[pinPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={pointsMaterialRef}
          map={glowTexture}
          color={LANDING_GREEN.primary}
          size={PIN_BASE_SIZE}
          sizeAttenuation
          transparent
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <group ref={beaconGroupRef}>
        {beacons.map((beacon) => (
          <sprite
            key={beacon.phase}
            position={beacon.basePosition.toArray()}
            scale={[1.5, 0.75, 1]}
            renderOrder={2}
          >
            <spriteMaterial
              map={beacon.texture}
              transparent
              depthWrite={false}
            />
          </sprite>
        ))}
      </group>
    </group>
  )
}
