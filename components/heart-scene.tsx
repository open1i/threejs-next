"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import * as THREE from "three"

// 创建真正立体的3D心形几何体
function create3DHeartGeometry() {
  const geometry = new THREE.BufferGeometry()
  const vertices = []
  const indices = []
  const normals = []
  const uvs = []

  const uSegments = 64
  const vSegments = 32

  // 3D心形参数方程
  for (let i = 0; i <= vSegments; i++) {
    const v = i / vSegments
    const phi = v * Math.PI * 2

    for (let j = 0; j <= uSegments; j++) {
      const u = j / uSegments
      const theta = u * Math.PI * 2

      // 更饱满的心形参数方程
      const x = 16 * Math.pow(Math.sin(theta), 3)
      const y = 13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta)
      
      // 增加深度和体积感
      const scale = (1 + Math.cos(phi)) * 0.5 // 控制体积的缩放因子
      const depth = 4 // 控制心形的厚度
      
      // 使用极坐标计算更自然的3D形状
      const r = Math.sqrt(x * x + y * y)
      const angle = Math.atan2(y, x)
      
      // 计算z坐标，使心形更加饱满
      const z = depth * (
        Math.sin(phi) * (1 - Math.abs(theta - Math.PI) / Math.PI) + 
        Math.cos(phi * 2) * 0.5
      ) * Math.exp(-r / 20)

      // 应用缩放并调整整体大小
      vertices.push(x * 0.15, y * 0.15, z * 0.15)

      // 计算法向量
      const normal = new THREE.Vector3(x, y, z).normalize()
      normals.push(normal.x, normal.y, normal.z)

      uvs.push(u, v)
    }
  }

  // 创建面
  for (let i = 0; i < vSegments; i++) {
    for (let j = 0; j < uSegments; j++) {
      const a = i * (uSegments + 1) + j
      const b = a + uSegments + 1
      const c = a + 1
      const d = b + 1

      indices.push(a, b, c)
      indices.push(b, d, c)
    }
  }

  geometry.setIndex(indices)
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
  geometry.computeVertexNormals()

  return geometry
}

// 粒子轨道组件
function ParticleOrbit({
  radius = 8,
  height = 3,
  particleCount = 200,
  speed = 1,
  color = "#ff69b4",
}: {
  radius?: number
  height?: number
  particleCount?: number
  speed?: number
  color?: string
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // 粒子轨道数据
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      angle: (i / particleCount) * Math.PI * 2,
      radiusOffset: (Math.random() - 0.5) * 2,
      heightOffset: (Math.random() - 0.5) * height,
      speed: speed + (Math.random() - 0.5) * 0.5,
      size: Math.random() * 0.3 + 0.1,
    }))
  }, [particleCount, height, speed])

  useFrame((state) => {
    if (!meshRef.current) return

    particles.forEach((particle, i) => {
      // 更新角度
      particle.angle += particle.speed * 0.01

      // 椭圆轨道计算
      const x = (radius + particle.radiusOffset) * Math.cos(particle.angle)
      const z = (radius + particle.radiusOffset) * Math.sin(particle.angle) * 0.6 // 椭圆效果
      const y = particle.heightOffset + Math.sin(particle.angle * 3) * 0.5

      dummy.position.set(x, y, z)
      dummy.scale.setScalar(particle.size)
      dummy.updateMatrix()

      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.8} />
    </instancedMesh>
  )
}

// 主爱心组件
function MainHeart() {
  const meshRef = useRef<THREE.Mesh>(null)
  const heartGeometry = useMemo(() => create3DHeartGeometry(), [])

  useFrame((state) => {
    if (meshRef.current) {
      // 轻微的脉动效果
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.08 + 1
      meshRef.current.scale.setScalar(pulse)

      // 缓慢自转展示立体感
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  return (
    <mesh ref={meshRef} geometry={heartGeometry}>
      <meshStandardMaterial
        color="#ff69b4"
        emissive="#ff1493"
        emissiveIntensity={0.15}
        roughness={0.2}
        metalness={0.3}
        transparent
        opacity={0.95}
      />
    </mesh>
  )
}

export function HeartScene() {
  return (
    <group>
      {/* 主爱心 */}
      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <MainHeart />
      </Float>

      {/* 多层粒子轨道 */}
      <ParticleOrbit radius={6} height={2} particleCount={150} speed={1} color="#ff69b4" />
      <ParticleOrbit radius={8} height={3} particleCount={120} speed={0.8} color="#ff1493" />
      <ParticleOrbit radius={10} height={4} particleCount={100} speed={0.6} color="#ff69b4" />

      {/* 反向轨道增加层次感 */}
      <ParticleOrbit radius={7} height={2.5} particleCount={80} speed={-0.7} color="#ffb6c1" />
      <ParticleOrbit radius={9} height={3.5} particleCount={60} speed={-0.5} color="#ff69b4" />

      {/* 装饰光环 */}
      <Float speed={0.3} rotationIntensity={0.05} floatIntensity={0.1}>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[12, 0.1, 8, 64]} />
          <meshStandardMaterial color="#ff69b4" emissive="#ff1493" emissiveIntensity={0.3} transparent opacity={0.3} />
        </mesh>
      </Float>
    </group>
  )
}
