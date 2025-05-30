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
    position: [0, 30, 20] as [number, number, number], // 相机位置 [x, y, z]，y值增大使相机位置更高
    lookAt: [0, 0, 0] as [number, number, number], // 相机观察点 [x, y, z]
  },
  // 花瓣配置
  petals: {
    count: 15, // 每个模型的花瓣数量，增加这个值可以增加花瓣数量
    scale: {
      min: 5.0, // 最小缩放比例，增加这个值可以增大花瓣
      max: 8.0, // 最大缩放比例，增加这个值可以增大花瓣
    },
    distribution: {
      radius: {
        min: 8, // 最小分布半径，增加这个值可以让花瓣分布更广
        max: 12, // 最大分布半径
      },
      height: 15, // 垂直分布范围，增加这个值可以让花瓣分布更高
      depth: 40, // 深度分布范围，增加这个值可以让花瓣分布更深
    },
    movement: {
      spiralSpeed: 0.2, // 螺旋运动速度
      forwardSpeed: 0.3, // 向相机移动的速度
      rotationSpeed: 0.02, // 旋转速度
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
      intensity: 4.0, // 光照强度，增加这个值可以让场景更亮
      position: [1, 1, 1] as [number, number, number], // 光源位置
    },
    ambient: {
      color: 0x404040, // 环境光颜色
      intensity: 3.0, // 环境光强度
    },
  },
  // 背景配置
  background: 0x000000, // 背景颜色
  // 动画配置
  animation: {
    duration: 10000, // 动画总时长（毫秒）
  },
};

const PETAL_MODELS = [
  "/models/flower1.obj",
  "/models/flower2.obj",
  "/models/flower3.obj",
  "/models/flower4.obj",
];

interface Petal {
  mesh: THREE.Object3D;
  scale: number;
  color: number;
  spiralAngle: number; // 螺旋角度
  spiralRadius: number; // 螺旋半径
  spiralHeight: number; // 螺旋高度
}

export default function PetalTunnel() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number>(0);
  const petalsRef = useRef<Petal[]>([]);
  const startTimeRef = useRef<number>(0);
  const [animationState, setAnimationState] = useState<'idle' | 'expanding' | 'playing' | 'fading'>('idle');

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
                  transparent: true,
                });
              }
            });

            // 创建多个花瓣实例
            for (let i = 0; i < SCENE_CONFIG.petals.count; i++) {
              const petal = object.clone();
              const scale =
                SCENE_CONFIG.petals.scale.min +
                Math.random() * (SCENE_CONFIG.petals.scale.max - SCENE_CONFIG.petals.scale.min);
              
              // 初始位置在远处
              petal.position.set(0, 0, -SCENE_CONFIG.petals.distribution.depth);
              petal.scale.setScalar(scale);
              
              // 计算螺旋参数
              const spiralAngle = Math.random() * Math.PI * 2;
              const spiralRadius = 
                SCENE_CONFIG.petals.distribution.radius.min +
                Math.random() * (SCENE_CONFIG.petals.distribution.radius.max - SCENE_CONFIG.petals.distribution.radius.min);
              const spiralHeight = (Math.random() - 0.5) * SCENE_CONFIG.petals.distribution.height;
              
              const color = SCENE_CONFIG.petals.colors[
                Math.floor(Math.random() * SCENE_CONFIG.petals.colors.length)
              ];

              loadedPetals.push({
                mesh: petal,
                scale,
                color,
                spiralAngle,
                spiralRadius,
                spiralHeight,
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
      // 自动开始动画
      setAnimationState('expanding');
      startTimeRef.current = Date.now();
    });

    // 动画循环
    function animate() {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      const currentTime = Date.now();
      const elapsedTime = currentTime - startTimeRef.current;
      const progress = Math.min(elapsedTime / SCENE_CONFIG.animation.duration, 1);

      // 更新花瓣位置
      petalsRef.current.forEach((petal) => {
        // 计算螺旋运动
        const time = elapsedTime / 1000; // 转换为秒
        const spiralAngle = petal.spiralAngle + time * SCENE_CONFIG.petals.movement.spiralSpeed;
        
        // 计算当前半径 - 从0开始逐渐增大
        const currentRadius = petal.spiralRadius * progress;
        
        // 计算当前高度 - 从0开始逐渐增大，但限制在较低的位置
        const currentHeight = petal.spiralHeight * progress * 0.5; // 减小高度变化
        
        // 计算当前深度 - 从远处向近处移动
        const currentDepth = -SCENE_CONFIG.petals.distribution.depth * (1 - progress);
        
        // 更新位置 - 使用螺旋公式
        petal.mesh.position.x = Math.cos(spiralAngle) * currentRadius;
        petal.mesh.position.y = currentHeight;
        petal.mesh.position.z = currentDepth;
        
        // 更新旋转 - 让花瓣始终面向运动方向
        petal.mesh.rotation.x = Math.atan2(currentHeight, currentDepth);
        petal.mesh.rotation.y = spiralAngle;
        petal.mesh.rotation.z = Math.atan2(currentRadius, currentDepth);
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