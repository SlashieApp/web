'use client'

import { Environment, Float, Lightformer } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { type ComponentType, useMemo, useRef } from 'react'
import { CanvasTexture, type Group, MathUtils, NeutralToneMapping } from 'three'

import { storyState } from '../story/storyState'
import {
  COMPACT_OBJECTS,
  SCENE_OBJECTS,
  type SceneObjectId,
  poseFor,
} from './formations'
import { Boxes } from './objects/Boxes'
import { MapPin } from './objects/MapPin'
import { MopBucket } from './objects/MopBucket'
import { PaintRoller } from './objects/PaintRoller'
import { Screwdriver } from './objects/Screwdriver'
import { Toolbox } from './objects/Toolbox'
import { SCENE_COLORS } from './scenePalette'

const MODELS: Record<SceneObjectId, ComponentType> = {
  toolbox: Toolbox,
  bucket: MopBucket,
  boxes: Boxes,
  roller: PaintRoller,
  screwdriver: Screwdriver,
  pin: MapPin,
}

/** How quickly objects glide to a new formation (higher = snappier). */
const FORMATION_LAMBDA = 2.6
/** Wide formations are tuned at 16:10; narrower windows shrink the objects. */
const WIDE_ASPECT = 1.6

function useBlobShadowTexture(): CanvasTexture {
  const texture = useMemo(() => {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const gradient = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2,
      )
      gradient.addColorStop(0, 'rgba(255,255,255,1)')
      gradient.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, size, size)
    }
    return new CanvasTexture(canvas)
  }, [])
  return texture
}

function SceneObject({
  id,
  compact,
  index,
  shadow,
}: {
  id: SceneObjectId
  compact: boolean
  index: number
  shadow: CanvasTexture
}) {
  const ref = useRef<Group>(null)
  const turnRef = useRef<Group>(null)
  const shadowRef = useRef<Group>(null)
  const placed = useRef(false)
  const Model = MODELS[id]

  useFrame((state, delta) => {
    const group = ref.current
    const turn = turnRef.current
    const shade = shadowRef.current
    if (!group || !turn || !shade) return
    const target = poseFor(id, storyState.stage, compact)
    const { width, height } = state.viewport
    // Sizes follow the viewport height (perspective camera), so keep wide
    // formations from crowding the centre on less-wide windows.
    const fit = compact ? 1 : Math.min(1, width / height / WIDE_ASPECT)
    const scale = target.s * fit
    // A gentle drift tied to scroll, out of phase per object.
    const drift =
      Math.sin(window.scrollY / window.innerHeight + index * 1.7) * 0.12
    const x = target.x * width
    const y = target.y * height + drift
    if (!placed.current) {
      // First frame: start in place (the poster underneath shows the same).
      group.position.set(x, y, target.z)
      turn.rotation.set(target.rx, target.ry, target.rz)
      turn.scale.setScalar(scale)
      shade.scale.setScalar(scale)
      placed.current = true
      return
    }
    const step = Math.min(delta, 0.1)
    const damp = (from: number, to: number) =>
      MathUtils.damp(from, to, FORMATION_LAMBDA, step)
    group.position.set(
      damp(group.position.x, x),
      damp(group.position.y, y),
      damp(group.position.z, target.z),
    )
    turn.rotation.set(
      damp(turn.rotation.x, target.rx),
      damp(turn.rotation.y, target.ry),
      damp(turn.rotation.z, target.rz),
    )
    const nextScale = damp(turn.scale.x, scale)
    turn.scale.setScalar(nextScale)
    shade.scale.setScalar(nextScale)
  })

  // Position on the outer group; rotation and scale on the inner one, so the
  // blob shadow stays level under the object instead of turning with it.
  return (
    <group ref={ref}>
      <group ref={turnRef}>
        <Float
          speed={1.2 + index * 0.15}
          rotationIntensity={0.35}
          floatIntensity={0.7}
          floatingRange={[-0.06, 0.06]}
        >
          <Model />
        </Float>
      </group>
      <group ref={shadowRef}>
        <mesh position={[0, -1, -0.3]} scale={[1.5, 0.36, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={shadow}
            color={SCENE_COLORS.shadow}
            transparent
            opacity={0.16}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  )
}

/** Tilts the whole scene a touch toward the cursor. */
function PointerRig({ children }: { children: React.ReactNode }) {
  const ref = useRef<Group>(null)
  useFrame((_, delta) => {
    const group = ref.current
    if (!group) return
    const step = Math.min(delta, 0.1)
    group.rotation.x = MathUtils.damp(
      group.rotation.x,
      storyState.pointerY * 0.06,
      3,
      step,
    )
    group.rotation.y = MathUtils.damp(
      group.rotation.y,
      storyState.pointerX * 0.1,
      3,
      step,
    )
  })
  return <group ref={ref}>{children}</group>
}

/** Calls `onReady` once two frames have drawn (shaders compiled, objects up). */
function ReadySignal({ onReady }: { onReady?: () => void }) {
  const frames = useRef(0)
  useFrame(() => {
    frames.current += 1
    if (frames.current === 2) onReady?.()
  })
  return null
}

function SceneContents({
  compact,
  onReady,
}: {
  compact: boolean
  onReady?: () => void
}) {
  const shadow = useBlobShadowTexture()
  const ids = compact ? COMPACT_OBJECTS : SCENE_OBJECTS
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 8]} intensity={1.5} />
      <directionalLight position={[-5, -2, 4]} intensity={0.35} />
      {/* Studio reflections for the glossy plastic. Built from lightformers,
          so no HDR file is fetched. */}
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[0, 5, 4]}
          scale={[10, 4, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.1}
          position={[-6, 0, 2]}
          rotation-y={Math.PI / 2}
          scale={[6, 6, 1]}
          color="#E7FBF0"
        />
        <Lightformer
          form="rect"
          intensity={0.8}
          position={[6, -1, 2]}
          rotation-y={-Math.PI / 2}
          scale={[6, 6, 1]}
        />
        <Lightformer
          form="circle"
          intensity={1.4}
          position={[2, 3, 6]}
          scale={1.5}
        />
      </Environment>
      <ReadySignal onReady={onReady} />
      <PointerRig>
        {ids.map((id, index) => (
          <SceneObject
            key={id}
            id={id}
            compact={compact}
            index={index}
            shadow={shadow}
          />
        ))}
      </PointerRig>
    </>
  )
}

export type LandingSceneProps = {
  /** Three small objects instead of six (phones, portrait, low-end). */
  compact: boolean
  dprMax: number
  /** Fires once the scene has drawn (to fade out the hero poster). */
  onReady?: () => void
}

/** The floating 3D objects behind the landing story. Client-only. */
export default function LandingScene({
  compact,
  dprMax,
  onReady,
}: LandingSceneProps) {
  return (
    <Canvas
      dpr={[1, dprMax]}
      camera={{ position: [0, 0, 12], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
      onCreated={({ gl }) => {
        // Khronos PBR Neutral keeps the SDL greens saturated (ACES greys them).
        gl.toneMapping = NeutralToneMapping
      }}
      aria-hidden
    >
      <SceneContents compact={compact} onReady={onReady} />
    </Canvas>
  )
}
