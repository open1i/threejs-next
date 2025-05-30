'use client';

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three-stdlib";

// 场景配置
const SCENE_CONFIG = {
  // 相机配置
  camera: {
    fov: 60, // 视场角，值越大视野越广
    near: 0.1, // 近平面距离
    far: 1000, // 远平面距离
    position: [0, 0, 10] as [number, number, number], // 相机位置 [x, y, z]
    lookAt: [0, 0, -10] as [number, number, number], // 相机观察点 [x, y, z]
  },
  // 花瓣配置
  petals: {
    count: 15, // 每个模型的花瓣数量，增加这个值可以增加花瓣数量
    scale: {
      min: 1.5, // 最小缩放比例，增加这个值可以增大花瓣
      max: 2.5, // 最大缩放比例，增加这个值可以增大花瓣
    },
    distribution: {
      radius: {
        min: 6, // 最小分布半径，增加这个值可以让花瓣分布更广
        max: 8, // 最大分布半径
      },
      height: 6, // 垂直分布范围，增加这个值可以让花瓣分布更高
      depth: 15, // 深度分布范围，增加这个值可以让花瓣分布更深
    },
    movement: {
      horizontal: 0.02, // 水平移动速度，减小这个值可以让花瓣移动更慢
      vertical: 0.02, // 垂直移动速度
      forward: -0.08, // 前进速度，减小这个值可以让花瓣移动更慢
      rotation: 0.008, // 旋转速度，减小这个值可以让花瓣旋转更慢
    },
    colors: [
      0xff69b4, // 粉色
      0xff1493, // 深粉色
      0xffb6c1, // 浅粉色
      0xffc0cb, // 粉红色
      0xff69b4, // 粉色（重复以增加权重）
      0xff1493, // 深粉色（重复以增加权重）
    ],
  },
  // 光照配置
  lighting: {
    directional: {
      color: 0xffffff, // 方向光颜色
      intensity: 3.0, // 光照强度，增加这个值可以让场景更亮
      position: [1, 1, 1] as [number, number, number], // 光源位置
    },
    ambient: {
      color: 0x404040, // 环境光颜色
      intensity: 2.5, // 环境光强度
    },
  },
  // 背景配置
  background: 0x000000, // 背景颜色
};

const PETAL_MODELS = [
  "/models/flower1.obj",
  "/models/flower2.obj",
  "/models/flower3.obj",
  "/models/flower4.obj",
];

interface Petal {
  mesh: THREE.Object3D;
  velocity: THREE.Vector3;
  rotation: THREE.Vector3;
  scale: number;
  color: number;
}

export default function PetalTunnel() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number>(0);
  const petalsRef = useRef<Petal[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(SCENE_CONFIG.background);
    sceneRef.current = scene;

    // 相机
    const camera = new THREE.PerspectiveCamera(
      SCENE_CONFIG.camera.fov,
      width / height,
      SCENE_CONFIG.camera.near,
      SCENE_CONFIG.camera.far
    );
    camera.position.set(...SCENE_CONFIG.camera.position);
    camera.lookAt(...SCENE_CONFIG.camera.lookAt);
    cameraRef.current = camera;

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 灯光
    const light = new THREE.DirectionalLight(
      SCENE_CONFIG.lighting.directional.color,
      SCENE_CONFIG.lighting.directional.intensity
    );
    light.position.set(...SCENE_CONFIG.lighting.directional.position).normalize();
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(
      SCENE_CONFIG.lighting.ambient.color,
      SCENE_CONFIG.lighting.ambient.intensity
    );
    scene.add(ambientLight);

    // 加载花瓣模型
    const loader = new OBJLoader();
    const loadedPetals: Petal[] = [];

    // 加载所有花瓣模型
    const loadPromises = PETAL_MODELS.map((modelPath) => {
      return new Promise<void>((resolve) => {
        loader.load(
          modelPath,
          (object) => {
            object.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                const color = SCENE_CONFIG.petals.colors[
                  Math.floor(Math.random() * SCENE_CONFIG.petals.colors.length)
                ];
                child.material = new THREE.MeshPhongMaterial({
                  color,
                  specular: 0x111111,
                  shininess: 100,
                  emissive: 0x000000,
                  flatShading: false,
                  side: THREE.DoubleSide,
                });
              }
            });

            // 创建多个花瓣实例
            for (let i = 0; i < SCENE_CONFIG.petals.count; i++) {
              const petal = object.clone();
              const scale =
                SCENE_CONFIG.petals.scale.min +
                Math.random() * (SCENE_CONFIG.petals.scale.max - SCENE_CONFIG.petals.scale.min);
              petal.scale.set(scale, scale, scale);

              // 随机位置
              const angle = Math.random() * Math.PI * 2;
              const radius =
                SCENE_CONFIG.petals.distribution.radius.min +
                Math.random() *
                  (SCENE_CONFIG.petals.distribution.radius.max -
                    SCENE_CONFIG.petals.distribution.radius.min);
              const x = Math.cos(angle) * radius;
              const y = (Math.random() - 0.5) * SCENE_CONFIG.petals.distribution.height;
              const z = -Math.random() * SCENE_CONFIG.petals.distribution.depth;
              petal.position.set(x, y, z);

              const color = SCENE_CONFIG.petals.colors[
                Math.floor(Math.random() * SCENE_CONFIG.petals.colors.length)
              ];

              loadedPetals.push({
                mesh: petal,
                velocity: new THREE.Vector3(
                  (Math.random() - 0.5) * SCENE_CONFIG.petals.movement.horizontal,
                  (Math.random() - 0.5) * SCENE_CONFIG.petals.movement.vertical,
                  SCENE_CONFIG.petals.movement.forward
                ),
                rotation: new THREE.Vector3(
                  Math.random() * SCENE_CONFIG.petals.movement.rotation,
                  Math.random() * SCENE_CONFIG.petals.movement.rotation,
                  Math.random() * SCENE_CONFIG.petals.movement.rotation
                ),
                scale,
                color,
              });
            }
            resolve();
          },
          undefined,
          (error) => {
            console.error("花瓣加载失败:", error);
            resolve();
          }
        );
      });
    });

    // 所有模型加载完成后
    Promise.all(loadPromises).then(() => {
      loadedPetals.forEach((petal) => scene.add(petal.mesh));
      petalsRef.current = loadedPetals;
      setLoading(false);
    });

    // 动画循环
    function animate() {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      // 更新花瓣位置和旋转
      petalsRef.current.forEach((petal) => {
        petal.mesh.position.add(petal.velocity);
        petal.mesh.rotation.x += petal.rotation.x;
        petal.mesh.rotation.y += petal.rotation.y;
        petal.mesh.rotation.z += petal.rotation.z;

        // 如果花瓣飞出视野，重置位置
        if (petal.mesh.position.z > 5) {
          const angle = Math.random() * Math.PI * 2;
          const radius =
            SCENE_CONFIG.petals.distribution.radius.min +
            Math.random() *
              (SCENE_CONFIG.petals.distribution.radius.max -
                SCENE_CONFIG.petals.distribution.radius.min);
          petal.mesh.position.set(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * SCENE_CONFIG.petals.distribution.height,
            -SCENE_CONFIG.petals.distribution.depth
          );
        }
      });

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    // 处理窗口大小变化
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
        rendererRef.current.domElement.remove();
      }
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="relative w-screen h-screen">
      <div
        ref={mountRef}
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-xl">加载中...</div>
        </div>
      )}
    </div>
  );
} 