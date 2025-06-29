"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

// 粒子轨道组件
function ParticleOrbit({
  radius = 8,
  height = 3,
  particleCount = 200,
  speed = 1,
  color = "#ff69b4",
}: {
  radius?: number;
  height?: number;
  particleCount?: number;
  speed?: number;
  color?: string;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 粒子轨道数据
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      angle: (i / particleCount) * Math.PI * 2,
      radiusOffset: (Math.random() - 0.5) * 2,
      heightOffset: (Math.random() - 0.5) * height,
      speed: speed + (Math.random() - 0.5) * 0.5,
      size: Math.random() * 0.3 + 0.1,
    }));
  }, [particleCount, height, speed]);

  useFrame((state) => {
    if (!meshRef.current) return;

    particles.forEach((particle, i) => {
      // 更新角度
      particle.angle += particle.speed * 0.01;

      // 椭圆轨道计算
      const x = (radius + particle.radiusOffset) * Math.cos(particle.angle);
      const z = (radius + particle.radiusOffset) * Math.sin(particle.angle) * 0.6;
      const y = particle.heightOffset + Math.sin(particle.angle * 3) * 0.5;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(particle.size);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </instancedMesh>
  );
}

// 主爱心组件
function MainHeart() {
  const meshRef = useRef<THREE.Group>(null);
  const obj = useLoader(OBJLoader, "/models/heart/Love+OBJ/Love.obj");

  useEffect(() => {
    obj.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color("#ff69b4"),
          metalness: 0.3,
          roughness: 0.2,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          emissive: new THREE.Color("#ff1493").multiplyScalar(0.3),
          sheenColor: new THREE.Color("#ffffff"),
          sheen: 1.0,
        });
      }
    });
  }, [obj]);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.08 + 1;
      meshRef.current.scale.setScalar(pulse * 0.05);
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive
        object={obj}
        rotation={[0, Math.PI / 2, 0]}
        position={[0, 0, 0]}
      />
    </group>
  );
}

export function HeartTrailScene() {
  return (
    <group>
      {/* 背景星星 */}
      <Sparkles
        count={200}
        scale={20}
        size={2}
        speed={0.3}
        color="#ffffff"
        opacity={0.5}
      />

      {/* 主爱心 */}
      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <MainHeart />
      </Float>

      {/* 多层粒子轨道 */}
      <ParticleOrbit
        radius={6}
        height={2}
        particleCount={150}
        speed={1}
        color="#ffc0cb"
      />
      <ParticleOrbit
        radius={8}
        height={3}
        particleCount={120}
        speed={0.8}
        color="#ff69b4"
      />
      <ParticleOrbit
        radius={10}
        height={4}
        particleCount={100}
        speed={0.6}
        color="#ff1493"
      />

      {/* 环境光照 */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
    </group>
  );
}
