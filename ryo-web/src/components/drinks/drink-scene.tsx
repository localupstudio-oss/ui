"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox } from "@react-three/drei"
import * as THREE from "three"

import type { DrinkVisual } from "@/content/menu"

type P = [number, number]
type GlassDef = {
  shell: P[]
  liquid: P[]
  foam?: P[]
  rim: { y: number; r: number }
  surface: { y: number; r: number }
  stem?: { top: number; r: number; foot: number }
  ice: { y0: number; r: number; max: number }
  height: number
}

/** Profili dei bicchieri (ruotati con LatheGeometry), modellati sulle foto dei drink di RYO. */
const GLASSES: Record<DrinkVisual["glass"], GlassDef> = {
  rocks: {
    shell: [[0, 0], [0.92, 0], [0.98, 0.05], [1.05, 1.95], [0.99, 1.97], [0.92, 0.32], [0.86, 0.26], [0, 0.26]],
    liquid: [[0, 0.27], [0.85, 0.27], [0.91, 0.33], [0.955, 1.3], [0, 1.3]],
    rim: { y: 1.96, r: 1.02 },
    surface: { y: 1.3, r: 0.95 },
    ice: { y0: 0.3, r: 0.85, max: 2 },
    height: 1.97,
  },
  highball: {
    shell: [[0, 0], [0.62, 0], [0.66, 0.05], [0.7, 3.0], [0.65, 3.02], [0.6, 0.28], [0, 0.25]],
    liquid: [[0, 0.26], [0.59, 0.26], [0.645, 2.55], [0, 2.55]],
    rim: { y: 3.0, r: 0.68 },
    surface: { y: 2.55, r: 0.64 },
    ice: { y0: 0.3, r: 0.6, max: 3 },
    height: 3.02,
  },
  coupe: {
    shell: [[0, 1.55], [0.15, 1.56], [0.6, 1.75], [0.95, 2.1], [1.05, 2.35], [1.0, 2.36], [0.9, 2.12], [0.55, 1.8], [0.12, 1.62], [0, 1.61]],
    liquid: [[0, 1.63], [0.12, 1.64], [0.55, 1.82], [0.86, 2.1], [0.93, 2.24], [0, 2.24]],
    rim: { y: 2.35, r: 1.03 },
    surface: { y: 2.24, r: 0.93 },
    stem: { top: 1.56, r: 0.05, foot: 0.6 },
    ice: { y0: 1.7, r: 0.5, max: 0 },
    height: 2.36,
  },
  goblet: {
    shell: [[0, 1.2], [0.3, 1.22], [0.7, 1.45], [0.88, 1.9], [0.85, 2.45], [0.8, 2.47], [0.82, 1.92], [0.65, 1.5], [0.28, 1.28], [0, 1.27]],
    liquid: [[0, 1.29], [0.27, 1.3], [0.62, 1.52], [0.79, 1.92], [0.8, 2.15], [0, 2.15]],
    foam: [[0, 2.14], [0.8, 2.14], [0.815, 2.28], [0.6, 2.35], [0, 2.37]],
    rim: { y: 2.46, r: 0.83 },
    surface: { y: 2.3, r: 0.78 },
    stem: { top: 1.22, r: 0.06, foot: 0.55 },
    ice: { y0: 1.4, r: 0.5, max: 0 },
    height: 2.47,
  },
  stem: {
    shell: [[0, 1.3], [0.25, 1.32], [0.55, 1.5], [0.68, 1.85], [0.62, 2.35], [0.57, 2.37], [0.63, 1.87], [0.51, 1.54], [0.24, 1.37], [0, 1.36]],
    liquid: [[0, 1.38], [0.23, 1.39], [0.48, 1.55], [0.6, 1.87], [0.6, 2.05], [0, 2.05]],
    rim: { y: 2.36, r: 0.6 },
    surface: { y: 2.05, r: 0.6 },
    stem: { top: 1.32, r: 0.07, foot: 0.5 },
    ice: { y0: 1.5, r: 0.4, max: 0 },
    height: 2.37,
  },
}

const lathe = (pts: P[]) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 96)

type SceneProps = {
  drinkId: string
  visual: DrinkVisual
  active: boolean
  reduceMotion: boolean
  /** Etichette HTML (fuori dal canvas) da agganciare a punti 3D attorno al bicchiere. */
  labels?: React.RefObject<(HTMLElement | null)[]>
  labelCount?: number
}

const MODEL_Y = -1.35
const modelScale = (g: GlassDef) => Math.min(2.35 / g.height, 1.25)

/** Canvas della Drink List 3D (caricato solo lato client, vedi drink-list.tsx). */
export default function DrinkScene({ drinkId, visual, active, reduceMotion, labels, labelCount = 0 }: SceneProps) {
  return (
    <Canvas frameloop={active ? "always" : "never"} dpr={[1, 1.75]} camera={{ position: [0, 0.6, 7.2], fov: 30 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.35} />
      <spotLight position={[3, 6, 4]} angle={0.45} penumbra={1} intensity={70} color="#ffd9a0" />
      <pointLight position={[-3, 1.5, -2]} intensity={14} color="#3fae4f" />
      <pointLight position={[3, -1, 2]} intensity={6} color="#e5672a" />

      <DrinkModel key={drinkId} visual={visual} reduceMotion={reduceMotion} />
      {labels && labelCount > 0 && <LabelProjector def={GLASSES[visual.glass]} count={labelCount} labels={labels} />}

      {/* Bicchieri rotondi: l'ombra non cambia ruotando, la calcoliamo una volta per drink */}
      <ContactShadows key={`shadow-${drinkId}`} frames={40} position={[0, -1.35, 0]} opacity={0.6} scale={7} blur={2.6} far={3} color="#000" />

      {/* Riflessi verde/arancio della giungla, senza file HDR esterni */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} color="#f6cf7a" position={[0, 4, -4]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={2} color="#e5672a" position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[6, 1.5, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#3fae4f" position={[5, 1, 0]} rotation-y={-Math.PI / 2} scale={[6, 1.5, 1]} />
        <Lightformer form="ring" intensity={2} color="#ffffff" position={[3, 3, 3]} scale={1.6} />
      </Environment>

      <OrbitControls enablePan={false} enableZoom={false} autoRotate={!reduceMotion} autoRotateSpeed={1.1} minPolarAngle={Math.PI / 3.4} maxPolarAngle={Math.PI / 1.85} />
    </Canvas>
  )
}

function DrinkModel({ visual, reduceMotion }: { visual: DrinkVisual; reduceMotion: boolean }) {
  const g = GLASSES[visual.glass]
  const scale = modelScale(g)
  const group = useRef<THREE.Group>(null)

  // Ingresso: il bicchiere "atterra" ruotando quando cambi drink.
  useFrame((_, dt) => {
    const o = group.current
    if (!o) return
    const s = THREE.MathUtils.damp(o.scale.x, scale, reduceMotion ? 50 : 6, dt)
    o.scale.setScalar(s)
    o.rotation.y = THREE.MathUtils.damp(o.rotation.y, 0, reduceMotion ? 50 : 4, dt)
  })

  const shell = useMemo(() => lathe(g.shell), [g])
  const liquid = useMemo(() => lathe(g.liquid), [g])
  const foam = useMemo(() => (g.foam ? lathe(g.foam) : null), [g])
  const glassMat = (
    <meshPhysicalMaterial transparent opacity={0.22} roughness={0.03} metalness={0.1} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={2.2} color="#f6f1e4" side={THREE.DoubleSide} depthWrite={false} />
  )

  return (
    <group ref={group} position={[0, MODEL_Y, 0]} scale={0.001} rotation-y={-1.4}>
      <mesh geometry={shell}>{glassMat}</mesh>
      {g.stem && (
        <>
          <mesh position={[0, (g.stem.top + 0.05) / 2, 0]}>
            <cylinderGeometry args={[g.stem.r, g.stem.r * 1.4, g.stem.top - 0.05, 24]} />
            {visual.stemColor ? <meshPhysicalMaterial color={visual.stemColor} roughness={0.1} clearcoat={1} transparent opacity={0.85} /> : glassMat}
          </mesh>
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[g.stem.foot, g.stem.foot, 0.06, 48]} />
            {visual.stemColor ? <meshPhysicalMaterial color={visual.stemColor} roughness={0.1} clearcoat={1} transparent opacity={0.8} /> : glassMat}
          </mesh>
        </>
      )}

      <mesh geometry={liquid}>
        <meshPhysicalMaterial color={visual.liquid} transparent opacity={0.88} roughness={0.15} clearcoat={1} envMapIntensity={1.2} emissive={visual.liquid} emissiveIntensity={0.35} />
      </mesh>
      {foam && (
        <mesh geometry={foam}>
          <meshStandardMaterial color="#f3e6cc" roughness={0.9} />
        </mesh>
      )}

      <Ice def={g} kind={visual.ice} reduceMotion={reduceMotion} />
      <Garnish def={g} kind={visual.garnish} />
      {visual.smoke && <Smoke def={g} reduceMotion={reduceMotion} />}

    </group>
  )
}

function Ice({ def, kind, reduceMotion }: { def: GlassDef; kind: DrinkVisual["ice"]; reduceMotion: boolean }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current || reduceMotion) return
    ref.current.children.forEach((c, i) => (c.position.y = c.userData.y + Math.sin(clock.elapsedTime * 1.1 + i * 2) * 0.02))
  })
  if (kind === "none" || def.ice.max === 0) return null

  const cubes =
    kind === "block"
      ? [{ s: def.ice.r * 1.1, x: 0, y: def.ice.y0 + def.ice.r * 0.55 + 0.03, ry: 0.4 }]
      : Array.from({ length: def.ice.max }, (_, i) => ({ s: def.ice.r * 0.78, x: (i % 2 ? 1 : -1) * def.ice.r * 0.18, y: def.ice.y0 + def.ice.r * 0.4 + i * def.ice.r * 0.8, ry: i * 0.7 }))

  return (
    <group ref={ref}>
      {cubes.map((c, i) => (
        <RoundedBox key={i} args={[c.s, c.s, c.s]} radius={c.s * 0.12} smoothness={4} position={[c.x, c.y, 0]} rotation={[0.12, c.ry, 0.08]} userData={{ y: c.y }}>
          <meshPhysicalMaterial transparent opacity={0.32} roughness={0.08} clearcoat={1} envMapIntensity={2.4} color="#f4fbff" depthWrite={false} />
        </RoundedBox>
      ))}
    </group>
  )
}

function Garnish({ def, kind }: { def: GlassDef; kind: DrinkVisual["garnish"] }) {
  const leaf = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.bezierCurveTo(0.35, 0.25, 0.35, 0.8, 0, 1.15)
    s.bezierCurveTo(-0.35, 0.8, -0.35, 0.25, 0, 0)
    return s
  }, [])
  const { rim, surface } = def

  switch (kind) {
    case "orange": // mezza ruota d'arancia appoggiata sul bordo
      return (
        <group position={[rim.r * 0.78, rim.y - 0.02, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.42, 0.42, 0.07, 40, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#f08a24" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.001, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.075, 40, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#ffc163" roughness={0.6} emissive="#a3420b" emissiveIntensity={0.15} />
          </mesh>
        </group>
      )
    case "twist":
      return (
        <mesh position={[rim.r * 0.7, rim.y + 0.02, 0]} rotation={[Math.PI / 2.4, 0, 0.4]}>
          <torusGeometry args={[0.3, 0.06, 16, 48, Math.PI * 1.35]} />
          <meshStandardMaterial color="#f08a24" roughness={0.45} emissive="#a3420b" emissiveIntensity={0.25} />
        </mesh>
      )
    case "leaf":
      return (
        <mesh position={[rim.r * 0.55, rim.y - 0.25, 0.1]} rotation={[0.3, 0.4, -0.5]}>
          <extrudeGeometry args={[leaf, { depth: 0.02, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 }]} />
          <meshStandardMaterial color="#9b5a2a" roughness={0.7} side={THREE.DoubleSide} transparent opacity={0.9} />
        </mesh>
      )
    case "cherry":
      return (
        <group position={[0.1, surface.y + 0.12, 0.15]}>
          <mesh>
            <sphereGeometry args={[0.17, 32, 32]} />
            <meshPhysicalMaterial color="#6d0617" roughness={0.15} clearcoat={1} />
          </mesh>
          <mesh position={[0.06, 0.3, 0]} rotation={[0, 0, -0.25]}>
            <cylinderGeometry args={[0.012, 0.016, 0.5, 8]} />
            <meshStandardMaterial color="#4a3018" />
          </mesh>
        </group>
      )
    case "pepper":
      return (
        <group position={[0, surface.y + 0.02, 0]}>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2 + i
            const r = surface.r * (0.25 + (i % 3) * 0.18)
            return (
              <mesh key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r]}>
                <sphereGeometry args={[0.045, 16, 16]} />
                <meshStandardMaterial color="#c2304f" roughness={0.5} />
              </mesh>
            )
          })}
        </group>
      )
    default:
      return null
  }
}

/** Fumo leggero che sale dal drink (es. Smoked Velvet). */
function Smoke({ def, reduceMotion }: { def: GlassDef; reduceMotion: boolean }) {
  const ref = useRef<THREE.Group>(null)
  const puffs = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ x: Math.sin(i * 2.3) * 0.4, z: Math.cos(i * 1.7) * 0.4, phase: i / 14 })), [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.children.forEach((m, i) => {
      const t = reduceMotion ? puffs[i].phase : (clock.elapsedTime * 0.18 + puffs[i].phase) % 1
      m.position.set(puffs[i].x * (1 + t), def.rim.y + t * 1.8, puffs[i].z * (1 + t))
      m.scale.setScalar(0.25 + t * 0.6)
      ;((m as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.16 * Math.sin(t * Math.PI)
    })
  })
  return (
    <group ref={ref}>
      {puffs.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial color="#d9d4c8" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Proietta punti 3D attorno al bicchiere sullo schermo e muove le etichette HTML
 * direttamente via style (nessun re-render React). Quelle dietro al bicchiere si attenuano.
 */
function LabelProjector({ def, count, labels }: { def: GlassDef; count: number; labels: React.RefObject<(HTMLElement | null)[]> }) {
  const anchors = useMemo(() => {
    const s = modelScale(def)
    const r = (Math.max(def.rim.r, 0.8) + 0.85) * s
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + 0.6
      return new THREE.Vector3(Math.cos(a) * r, MODEL_Y + def.height * (0.35 + (i % 3) * 0.22) * s, Math.sin(a) * r)
    })
  }, [def, count])
  const v = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera, size }) => {
    const centerDist = camera.position.length()
    anchors.forEach((p, i) => {
      const el = labels.current?.[i]
      if (!el) return
      v.copy(p).project(camera)
      const x = ((v.x + 1) / 2) * size.width
      const y = ((1 - v.y) / 2) * size.height
      const behind = camera.position.distanceTo(p) > centerDist
      el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
      el.style.opacity = behind ? "0.3" : "1"
      el.style.zIndex = behind ? "0" : "2"
    })
  })
  return null
}
