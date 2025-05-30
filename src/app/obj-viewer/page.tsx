'use client';

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader, OrbitControls } from "three-stdlib";

const MODEL_PATH = "/models/flower1.obj";

export default function ObjViewer() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const width = mountRef.current?.clientWidth || window.innerWidth;
    const height = mountRef.current?.clientHeight || window.innerHeight;

    // 场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // 相机
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 100, 300);

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current?.appendChild(renderer.domElement);

    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 灯光
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // 加载管理器
    const loadingManager = new THREE.LoadingManager();

    // 创建OBJ加载器
    const loader = new OBJLoader(loadingManager);

    loader.load(
      MODEL_PATH,
      (object) => {
        // 处理材质
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({
              color: 0x2194ce,
              specular: 0x111111,
              shininess: 100,
              emissive: 0x000000,
              flatShading: false,
              side: THREE.DoubleSide,
            });
          }
        });

        // 自动调整模型大小和位置
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 200 / maxDim;
        object.scale.setScalar(scale);
        object.position.sub(center.multiplyScalar(scale));

        scene.add(object);
        animate();
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("OBJ加载失败:", error);
      }
    );

    // 动画循环
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    // 清理
    return () => {
      controls.dispose();
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
    />
  );
} 