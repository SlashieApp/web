'use client'

import { Canvas } from '@react-three/fiber'

import { type DeviceTier, TIER_SETTINGS } from '../hooks/useDeviceTier'
import { LANDING_INK } from '../landingPalette'
import { CameraRig } from './scene/CameraRig'
import { LivingMap } from './scene/LivingMap'
import { MapPins } from './scene/Pins'
import { Signals } from './scene/Signals'
import { usePointerNdc } from './scene/usePointerNdc'

export type HeroCanvasProps = {
  tier: Exclude<DeviceTier, 'off'>
  /** Render loop runs only while the hero is on screen. */
  active: boolean
  onReady?: () => void
}

/** One pointer tracker for the whole scene; the ref is passed down. */
function SceneContents({ tier }: { tier: Exclude<DeviceTier, 'off'> }) {
  const settings = TIER_SETTINGS[tier]
  const ndcRef = usePointerNdc()

  return (
    <>
      <CameraRig ndcRef={ndcRef} />
      <LivingMap segments={settings.terrainSegments} />
      <MapPins pinCount={settings.pins} />
      <Signals particleCount={settings.particles} ndcRef={ndcRef} />
    </>
  )
}

/**
 * The living-map WebGL scene. Loaded via `next/dynamic` (ssr: false) so three.js
 * never enters the server bundle or blocks first paint; the static poster
 * underneath carries the brand until this fades in.
 *
 * `flat` disables ACES tone mapping so built-in materials (pins, beacons,
 * lines) and the raw terrain shader share one color pipeline and the brand
 * green reaches the screen unshifted. Glow comes from additive sprite
 * textures rather than a bloom pass: the composer bypasses three's output
 * color management (washed inks), and sprite glow reads identically at a
 * fraction of the cost.
 */
export default function HeroCanvas({ tier, active, onReady }: HeroCanvasProps) {
  const settings = TIER_SETTINGS[tier]

  return (
    <Canvas
      flat
      dpr={[1, settings.dprMax]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 4.1, 6.6], fov: 42, near: 0.1, far: 40 }}
      gl={{
        antialias: settings.antialias,
        powerPreference: 'high-performance',
        alpha: false,
      }}
      onCreated={() => onReady?.()}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <color attach="background" args={[LANDING_INK.canvas]} />
      <fog attach="fog" args={[LANDING_INK.canvas, 8.5, 16]} />
      <SceneContents tier={tier} />
    </Canvas>
  )
}
