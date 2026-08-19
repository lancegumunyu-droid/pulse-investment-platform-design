'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Line, Sparkles } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function PulseLine() {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.z = state.clock.elapsedTime * 0.06
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.08
  })
  const points = Array.from({ length: 18 }, (_, index) => {
    const x = (index - 9) * 0.42
    const y = Math.sin(index * 0.7) * 0.12 + (index === 8 || index === 9 ? 0.75 : 0)
    return new THREE.Vector3(x, y, 0)
  })
  return (
    <group ref={ref}>
      <Line points={points} color="#f59e0b" lineWidth={1.5} transparent opacity={0.7} />
      <mesh position={[0, 0.22, -0.1]} rotation={[0.2, -0.2, 0.1]}>
        <torusGeometry args={[1.2, 0.008, 16, 96]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.28} />
      </mesh>
    </group>
  )
}

export function HeroScene() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-80 [mask-image:linear-gradient(to_bottom,black,transparent_86%)]">
      <Canvas camera={{ position: [0, 0, 7], fov: 46 }} dpr={[1, 1.4]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.3} />
        <Float speed={0.6} rotationIntensity={0.15} floatIntensity={0.35}>
          <PulseLine />
        </Float>
        <Sparkles count={42} scale={[7, 3.8, 2]} size={1.5} speed={0.18} color="#f59e0b" opacity={0.3} />
      </Canvas>
    </div>
  )
}
