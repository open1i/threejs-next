"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// 背景星尘效果
function BackgroundDust({ count = 300 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 100),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005,
      ),
      scale: Math.random() * 0.2 + 0.05,
      opacity: Math.random() * 0.5 + 0.2,
    }))
  }, [count])

  useFrame(() => {
    if (!meshRef.current) return

    particles.forEach((particle, i) => {
      particle.position.add(particle.velocity)

      // 边界检查
      if (Math.abs(particle.position.x) > 50) particle.velocity.x *= -1
      if (Math.abs(particle.position.y) > 25) particle.velocity.y *= -1
      if (Math.abs(particle.position.z) > 50) particle.velocity.z *= -1

      dummy.position.copy(particle.position)
      dummy.scale.setScalar(particle.scale)
      dummy.updateMatrix()

      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.02, 6, 6]} />
      <meshStandardMaterial color="#ff69b4" emissive="#ff1493" emissiveIntensity={0.3} transparent opacity={0.4} />
    </instancedMesh>
  )
}

export function ParticleSystem() {
  return (
    <group>
      <BackgroundDust count={200} />
    </group>
  )
}
