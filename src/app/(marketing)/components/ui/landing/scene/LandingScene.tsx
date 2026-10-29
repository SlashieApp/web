'use client'

import { Float } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  type ComponentType,
  type MutableRefObject,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { CanvasTexture, type Group, MathUtils, NeutralToneMapping } from 'three'

import { BREAKPOINT_PX } from '@/theme/breakpoints'
import { HEADER_MIN_HEIGHT } from '@/ui/Header/shell/headerShell'

import { storyState, subscribeStory } from '../story/storyState'
import { SceneLights } from './SceneLights'
import {
  CAMERA_FOV,
  CAMERA_Z,
  COMPACT_OBJECTS,
  type CloseFit,
  PARKED_STAGE,
  PROP_REACH,
  SCENE_OBJECTS,
  type SceneObjectId,
  closeFitPx,
  fitFor,
  peekLayoutFor,
  placeProp,
  placementFor,
  poseFor,
  sceneStage,
} from './formations'
import { Boxes } from './objects/Boxes'
import { MapPin } from './objects/MapPin'
import { Toolbox } from './objects/Toolbox'
import { SCENE_COLORS } from './scenePalette'

const MODELS: Record<SceneObjectId, ComponentType> = {
  toolbox: Toolbox,
  boxes: Boxes,
  pin: MapPin,
}

/** How quickly objects glide to a new formation (higher = snappier). */
const FORMATION_LAMBDA = 2.6
/**
 * A gap this long between two frames (ms) means the scene was not drawing (no
 * transparent block was on screen), so nobody saw the props move meanwhile.
 */
const RETURN_GAP_MS = 250
/** What the scene reads off the page once a frame (see `PageProbe`). */
type PageProbe = {
  /** How the close's props are lifted, scaled or parked to stay clear of the footer. */
  close: CloseFit
}

const CLOSE_AT_REST: CloseFit = { lift: 0, scale: 1, parked: false }

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
  probe,
}: {
  id: SceneObjectId
  compact: boolean
  index: number
  shadow: CanvasTexture
  probe: MutableRefObject<PageProbe>
}) {
  const ref = useRef<Group>(null)
  const turnRef = useRef<Group>(null)
  const shadowRef = useRef<Group>(null)
  const placed = useRef(false)
  const lastFrameAt = useRef(0)
  const Model = MODELS[id]

  useFrame((state, delta) => {
    const group = ref.current
    const turn = turnRef.current
    const shade = shadowRef.current
    if (!group || !turn || !shade) return
    const now = performance.now()
    const wasHidden = now - lastFrameAt.current > RETURN_GAP_MS
    lastFrameAt.current = now
    // The hero's props wait off the edges once the hero is out of view, and the
    // close's where the footer leaves them no room (`closeFitPx`).
    const stage = sceneStage(storyState.stage, storyState.heroInView)
    const closing = stage === 'cta'
    const close = closing ? probe.current.close : CLOSE_AT_REST
    const shown = closing && close.parked ? PARKED_STAGE : stage
    const target = poseFor(id, shown, compact, state.size.height)
    const rest = poseFor(id, shown, compact, state.size.height, false)
    const { width, height, factor } = state.viewport
    // Sizes follow the viewport height (perspective camera), so keep wide
    // formations from crowding the centre on less-wide windows.
    const fit = fitFor(compact, width / height)
    const scale = target.s * fit * close.scale
    // A gentle drift tied to scroll, out of phase per object.
    const drift =
      Math.sin(window.scrollY / window.innerHeight + index * 1.7) * 0.12
    // Where a prop appears is held in px: a prop nearer the camera, which the
    // perspective pushes outward, is held at the same line. Its reach (the
    // hammer and the shadow included) is in px at its depth too.
    const near = CAMERA_Z / (CAMERA_Z - target.z)
    const restNear = CAMERA_Z / (CAMERA_Z - rest.z)
    const reach = PROP_REACH[id]
    const px = factor * near * scale
    const restPx = factor * restNear * rest.s * fit * close.scale
    const viewportPx = state.size.width
    // Wide screens keep the whole prop inside the page column's rails (the hero
    // and the close) or in the strip beside the phone (the acts), shrunk to fit
    // or waiting off the edge where that is too narrow; phones let it only peek
    // in from the edge (clear of the text) or not at all where that would be a
    // sliver; and the formation that waits under the opaque panels is parked
    // off the edges.
    const placement = placeProp({
      xPx: target.x * viewportPx * near,
      halfPx: reach.halfWidth * px,
      restHalfPx: reach.halfWidth * restPx,
      viewportPx,
      heightPx: state.size.height,
      placement: placementFor(shown, compact),
      layout: peekLayoutFor(shown),
    })
    const x = placement.x / near / factor
    const finalScale = scale * placement.fit
    // The close's props stay clear of the opaque footer, which would slice them
    // (`PageProbe` works out how far to lift them, together).
    const lift = closing && !close.parked ? close.lift : 0
    const y = (target.y + lift / (state.size.height * near)) * height + drift
    // Off the screen's edge there is nothing to see move.
    const offScreen =
      placementFor(shown, compact) === 'parked' ||
      Math.abs(placement.x) > viewportPx / 2
    if (!placed.current || (wasHidden && offScreen)) {
      // First frame, or back from a stretch the scene was not drawn (the
      // props' place is off the edges, so they should not cross the screen to
      // get there): start in place (the poster underneath shows the same).
      group.position.set(x, y, target.z)
      turn.rotation.set(target.rx, target.ry, target.rz)
      turn.scale.setScalar(finalScale)
      shade.scale.setScalar(finalScale)
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
    const nextScale = damp(turn.scale.x, finalScale)
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

/**
 * Reads the footer's top edge once a frame, while the close is the stage (the
 * only formation that has to keep clear of it), and works out how to lift,
 * scale or park the close's props together (`closeFitPx`), so no prop reads the
 * page itself. It is mounted before the props, so its fit is current when they
 * read it. The footer is looked up the first time it is needed.
 */
function PageProbe({
  probe,
  ids,
  compact,
}: {
  probe: MutableRefObject<PageProbe>
  ids: readonly SceneObjectId[]
  compact: boolean
}) {
  const footer = useRef<Element | null>(null)
  useFrame((state) => {
    if (storyState.stage !== 'cta') return
    if (!footer.current?.isConnected) {
      footer.current = document.querySelector('footer')
    }
    const top = footer.current?.getBoundingClientRect().top
    const widthPx = state.size.width
    probe.current.close = closeFitPx({
      ids,
      compact,
      widthPx,
      heightPx: state.size.height,
      footerTopPx: top === undefined || top >= state.size.height ? null : top,
      headerPx: Number.parseFloat(
        widthPx >= BREAKPOINT_PX.md
          ? HEADER_MIN_HEIGHT.md
          : HEADER_MIN_HEIGHT.base,
      ),
    })
  })
  return null
}

/**
 * Keeps the scene drawing only while a prop can be seen. The canvas draws on
 * demand (`frameloop="demand"`); while a transparent block of the page is on
 * screen this asks for the next frame each frame, and when none is (the opaque
 * panels hide the scene) it stops, so the GPU and the battery are not spent on
 * what nobody can see. A pointer move or a scroll that brings a block back
 * starts it again: the ref callback on the node below subscribes to the story
 * state for as long as the scene is mounted, and asks for a frame whenever the
 * scene can be seen.
 */
function FrameDriver() {
  const invalidate = useThree((state) => state.invalidate)
  const watch = useCallback(
    (node: Group | null) => {
      if (!node) return
      const ask = () => {
        if (storyState.sceneVisible) invalidate()
      }
      ask()
      return subscribeStory(ask)
    },
    [invalidate],
  )
  useFrame(() => {
    if (storyState.sceneVisible) invalidate()
  })
  return <group ref={watch} />
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
  const probe = useRef<PageProbe>({ close: CLOSE_AT_REST })
  const ids = compact ? COMPACT_OBJECTS : SCENE_OBJECTS
  return (
    <>
      <SceneLights />
      <FrameDriver />
      <PageProbe probe={probe} ids={ids} compact={compact} />
      <ReadySignal onReady={onReady} />
      <PointerRig>
        {ids.map((id, index) => (
          <SceneObject
            key={id}
            id={id}
            compact={compact}
            index={index}
            shadow={shadow}
            probe={probe}
          />
        ))}
      </PointerRig>
    </>
  )
}

export type LandingSceneProps = {
  /** Two small objects instead of three (phones, portrait, low-end). */
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
      // Draws only while a prop can be seen (`FrameDriver`).
      frameloop="demand"
      dpr={[1, dprMax]}
      camera={{ position: [0, 0, CAMERA_Z], fov: CAMERA_FOV }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
      onCreated={({ gl }) => {
        // Khronos PBR Neutral keeps the brand green saturated (ACES greys it).
        gl.toneMapping = NeutralToneMapping
      }}
      aria-hidden
    >
      <SceneContents compact={compact} onReady={onReady} />
    </Canvas>
  )
}
