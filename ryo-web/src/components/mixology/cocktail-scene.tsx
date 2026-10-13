"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { ContactShadows, Environment, Float, Lightformer, OrbitControls, RoundedBox } from "@react-three/drei"
import * as THREE from "three"

import type { Garnish } from "@/content/mixology"

type SceneProps = { liquidColor: string; garnish: Garnish["kind"]; active: boolean; reduceMotion: boolean }

/** Canvas 3D del Mixology Lab. Caricato solo lato client (vedi mixology-lab.tsx). */
export default function CocktailScene({ liquidColor, garnish, active, reduceMotion }: SceneProps) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 2]}
      camera={{ position: [0, 1.7, 5.4], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      shadows={false}
    >
      <ambientLight intensity={0.25} />
      <spotLight position={[3, 6, 3]} angle={0.4} penumbra={1} intensity={60} color="#ffd9a0" />
      <pointLight position={[-3, 2, -2]} intensity={12} color="#3fae4f" />

      <group position={[0, -0.95, 0]}>
        <Float speed={reduceMotion ? 0 : 1.4} rotationIntensity={0.15} floatIntensity={0.25}>
          <Glass />
          <Liquid color={liquidColor} />
          <Ice reduceMotion={reduceMotion} />
          <GarnishMesh kind={garnish} key={garnish} />
        </Float>
        <ContactShadows position={[0, -0.01, 0]} opacity={0.55} scale={6} blur={2.6} far={2.5} color="#000" />
      </group>

      {/* Riflessi "ottone e luci calde" senza file HDR esterni */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} color="#f1d796" position={[0, 4, -4]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#e5672a" position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[6, 1.5, 1]} />
        <Lightformer form="ring" intensity={2} color="#ffffff" position={[4, 2, 2]} scale={2} />
        <Lightformer form="rect" intensity={0.8} color="#237a2e" position={[0, -3, 3]} scale={[8, 2, 1]} />
      </Environment>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={!reduceMotion}
        autoRotateSpeed={0.9}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 1.9}
      />
    </Canvas>
  )
}

/** Bicchiere old fashioned: profilo ruotato (LatheGeometry) con fondo spesso. */
function Glass() {
  const geometry = useMemo(() => {
    const p = [
      [0, 0], [0.92, 0], [0.98, 0.05], [1.05, 1.95], [0.99, 1.97], [0.92, 0.32], [0.86, 0.26], [0, 0.26],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(p, 96)
  }, [])
  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        transparent
        opacity={0.22}
        roughness={0.03}
        metalness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.04}
        envMapIntensity={2.2}
        color="#f6f1e4"
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

/** Liquido: il colore sfuma verso quello del mix selezionato. */
function Liquid({ color }: { color: string }) {
  const mat = useRef<THREE.MeshPhysicalMaterial>(null)
  const target = useMemo(() => new THREE.Color(color), [color])
  const geometry = useMemo(() => {
    const p = [[0, 0.27], [0.85, 0.27], [0.91, 0.33], [0.955, 1.3], [0, 1.3]].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(p, 96)
  }, [])

  useFrame((_, dt) => {
    if (!mat.current) return
    mat.current.color.lerp(target, Math.min(1, dt * 2.5))
    mat.current.emissive.lerp(target, Math.min(1, dt * 2.5))
  })

  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        ref={mat}
        color={color}
        transparent
        opacity={0.88}
        roughness={0.15}
        clearcoat={1}
        envMapIntensity={1.2}
        emissive={color}
        emissiveIntensity={0.35}
      />
    </mesh>
  )
}

function Ice({ reduceMotion }: { reduceMotion: boolean }) {
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!group.current || reduceMotion) return
    group.current.children.forEach((c, i) => {
      c.position.y = 1.08 + Math.sin(clock.elapsedTime * 1.2 + i * 2) * 0.03
      c.rotation.y += 0.002 * (i + 1)
    })
  })
  const cubes = [
    { p: [-0.22, 1.08, 0.12], r: [0.3, 0.6, 0.1] },
    { p: [0.28, 1.08, -0.15], r: [0.1, 1.2, 0.35] },
  ] as const
  return (
    <group ref={group}>
      {cubes.map((c, i) => (
        <RoundedBox key={i} args={[0.55, 0.55, 0.55]} radius={0.08} smoothness={4} position={c.p as unknown as THREE.Vector3Tuple} rotation={c.r as unknown as THREE.Vector3Tuple}>
          <meshPhysicalMaterial transparent opacity={0.35} roughness={0.1} clearcoat={1} envMapIntensity={2} color="#f4fbff" depthWrite={false} />
        </RoundedBox>
      ))}
    </group>
  )
}

/** Guarnizione: entra in scena con un "pop" elastico a ogni cambio. */
function GarnishMesh({ kind }: { kind: Garnish["kind"] }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!ref.current) return
    const s = THREE.MathUtils.damp(ref.current.scale.x, 1, 6, dt)
    ref.current.scale.setScalar(s)
  })

  const leafShape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.bezierCurveTo(0.35, 0.25, 0.35, 0.8, 0, 1.15)
    s.bezierCurveTo(-0.35, 0.8, -0.35, 0.25, 0, 0)
    return s
  }, [])

  return (
    <group ref={ref} scale={0.001}>
      {kind === "orange" && (
        <mesh position={[0.72, 1.95, 0]} rotation={[Math.PI / 2.4, 0, 0.4]}>
          <torusGeometry args={[0.32, 0.07, 16, 48, Math.PI * 1.35]} />
          <meshStandardMaterial color="#f08a24" roughness={0.45} emissive="#a3420b" emissiveIntensity={0.25} />
        </mesh>
      )}
      {kind === "leaf" && (
        <mesh position={[0.55, 1.75, 0.1]} rotation={[0.3, 0.4, -0.5]}>
          <extrudeGeometry args={[leafShape, { depth: 0.02, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 }]} />
          <meshStandardMaterial color="#2f8f3e" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
      {kind === "cherry" && (
        <group position={[0.1, 1.42, 0.2]}>
          <mesh>
            <sphereGeometry args={[0.17, 32, 32]} />
            <meshPhysicalMaterial color="#6d0617" roughness={0.15} clearcoat={1} />
          </mesh>
          <mesh position={[0.06, 0.32, 0]} rotation={[0, 0, -0.25]}>
            <cylinderGeometry args={[0.012, 0.016, 0.5, 8]} />
            <meshStandardMaterial color="#4a3018" />
          </mesh>
        </group>
      )}
      {kind === "pepper" &&
        Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.45 * ((i % 3) / 3 + 0.4), 1.32, Math.sin(a) * 0.45 * ((i % 2) / 2 + 0.5)]}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshStandardMaterial color="#e2577a" roughness={0.5} />
            </mesh>
          )
        })}
    </group>
  )
}
