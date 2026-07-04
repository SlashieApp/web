'use client'

import { Effects } from '@react-three/drei'
import { type ThreeElement, extend } from '@react-three/fiber'
import * as THREE from 'three'
import { UnrealBloomPass } from 'three-stdlib'

declare module '@react-three/fiber' {
  interface ThreeElements {
    unrealBloomPass: ThreeElement<typeof UnrealBloomPass>
  }
}

extend({ UnrealBloomPass })

/**
 * Full-screen bloom, high tier only. Threshold is set so the ink terrain stays
 * matte and only the green pins/beacons glow — green as the light source.
 */
const BLOOM_RESOLUTION = new THREE.Vector2(256, 256)

export function HeroBloom() {
  return (
    <Effects>
      {/* args: (resolution, strength, radius, threshold) */}
      <unrealBloomPass args={[BLOOM_RESOLUTION, 0.55, 0.72, 0.5]} />
    </Effects>
  )
}
