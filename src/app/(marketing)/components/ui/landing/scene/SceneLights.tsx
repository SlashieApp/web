'use client'

import { SCENE_COLORS } from './scenePalette'

/**
 * The landing scene's light rig (the object stories use it too): soft, neutral
 * light for matte flat-shaded props, a white-to-zinc sky and ground, one key
 * light from the upper right and a faint fill. No environment map, so nothing
 * is built or fetched for reflections the props don't have.
 */
export function SceneLights() {
  return (
    <>
      <hemisphereLight
        args={[SCENE_COLORS.white, SCENE_COLORS.neutral300, 2]}
      />
      <directionalLight position={[4, 6, 8]} intensity={1.5} />
      <directionalLight position={[-5, -2, 4]} intensity={0.4} />
    </>
  )
}
