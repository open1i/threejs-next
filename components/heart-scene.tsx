"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Float, Sparkles, Points, PointMaterial } from "@react-three/drei";
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
      size: Math.random() * 0.4 + 0.2,
    }));
  }, [particleCount, height, speed]);

  useFrame((state) => {
    if (!meshRef.current) return;

    particles.forEach((particle, i) => {
      // 更新角度
      particle.angle += particle.speed * 0.01;

      // 椭圆轨道计算
      const x = (radius + particle.radiusOffset) * Math.cos(particle.angle);
      const z =
        (radius + particle.radiusOffset) * Math.sin(particle.angle) * 0.8; // 椭圆效果
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
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  );
}

// 上升的爱心粒子
function RisingHearts() {
  const count = 50;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * -20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += 0.03;
      if (positions[i * 3 + 1] > 10) {
        positions[i * 3 + 1] = -10;
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        color="#ff69b4"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </Points>
  );
}

// 光晕效果
function Glow() {
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.rotation.z += 0.001;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      glowRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <mesh ref={glowRef} position={[0, 0, -0.5]}>
      <planeGeometry args={[15, 15]} />
      <meshBasicMaterial
        color="#ff1493"
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
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
          emissive: new THREE.Color("#ff1493").multiplyScalar(0.5),
          sheenColor: new THREE.Color("#ffffff"),
          sheen: 1.0,
        });
      }
    });
  }, [obj]);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.08 + 1;
      meshRef.current.scale.setScalar(pulse * 0.12); //修改大小
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive
        object={obj}
        rotation={[0, Math.PI / 2, 0]}
        position={[0, -40, 0]} //修改位置
      />
    </group>
  );
}

export function HeartScene() {
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

      {/* 光晕效果 */}
      {/* <Glow /> */}

      {/* 上升的爱心粒子 */}
      <RisingHearts />

      {/* 主爱心 */}
      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <MainHeart />
      </Float>

      {/* 多层粒子轨道 - 增大轨道半径 */}
      <ParticleOrbit
        radius={8} // 最内层轨道
        height={1.5}
        particleCount={200}
        speed={0.2}
        color="#ffc0cb"
      />
      <ParticleOrbit
        radius={11} // 第二层
        height={2}
        particleCount={180}
        speed={0.15}
        color="#ff69b4"
      />
      <ParticleOrbit
        radius={14} // 第三层
        height={2.5}
        particleCount={160}
        speed={0.1}
        color="#ff1493"
      />
      <ParticleOrbit
        radius={9.5} // 反向旋转的内层
        height={1.8}
        particleCount={190}
        speed={-0.15}
        color="#ffb6c1"
      />
      <ParticleOrbit
        radius={12.5} // 反向旋转的外层
        height={2.2}
        particleCount={170}
        speed={-0.1}
        color="#db7093"
      />

      {/* 装饰光环 - 增加发光效果 */}
      {/* <Float speed={0.3} rotationIntensity={0.05} floatIntensity={0.1}>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[12, 0.2, 16, 100]} />
          <meshStandardMaterial 
            color="#ff69b4" 
            emissive="#ff1493" 
            emissiveIntensity={0.8} 
            transparent 
            opacity={0.5}
          />
        </mesh>
      </Float> */}
    </group>
  );
}
