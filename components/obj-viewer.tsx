"use client"

import { Canvas } from "@react-three/fiber"
import { 
  OrbitControls, 
  Html,
  useProgress,
  Environment,
  ContactShadows,
  Preload
} from "@react-three/drei"
import { Suspense, useState, useEffect } from "react"
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

function LoadingScreen() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="bg-black/50 text-white px-4 py-2 rounded-lg">
        Loading... {progress.toFixed(0)}%
      </div>
    </Html>
  )
}

function Scene({ autoRotate }: { autoRotate: boolean }) {
  return (
    <>
      <Environment preset="city" />
      <Model />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={autoRotate}
        autoRotateSpeed={2}
        minDistance={2}
        maxDistance={10}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <Preload all />
    </>
  )
}

function Model() {
  const obj = useLoader(OBJLoader, '/models/heart/Love+OBJ/Love.obj')
  
  useEffect(() => {
    // 在 useEffect 中处理材质更新
    obj.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#ff69b4'),
          metalness: 0.2,
          roughness: 0.2,
          clearcoat: 0.8,
          clearcoatRoughness: 0.2,
          emissive: new THREE.Color('#ff1493').multiplyScalar(0.2),
        })
      }
    })
  }, [obj])

  return (
    <group>
      <primitive 
        object={obj} 
        scale={0.02}
        position={[0, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <ContactShadows
        position={[0, -1, 0]}
        opacity={0.65}
        scale={10}
        blur={1}
        far={10}
      />
    </group>
  )
}

export default function ObjViewer() {
  const [autoRotate, setAutoRotate] = useState(true)

  return (
    <div className="relative w-screen h-screen">
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <button 
          className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white"
          onClick={() => setAutoRotate(!autoRotate)}
        >
          {autoRotate ? "停止旋转" : "开始旋转"}
        </button>
      </div>

      <Canvas
        camera={{
          fov: 45,
          near: 0.1,
          far: 1000,
          position: [5, 2, 5]
        }}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace
        }}
      >
        <color attach="background" args={['#1a1a1a']} />
        <Suspense fallback={<LoadingScreen />}>
          <Scene autoRotate={autoRotate} />
        </Suspense>
      </Canvas>
    </div>
  )
} 