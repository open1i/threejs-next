'use client';

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FBXLoader, OrbitControls } from "three-stdlib";

const MODEL_PATH = "/models/flower-1.fbx";

export default function FbxViewer() {
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

    // 创建加载管理器
    const loadingManager = new THREE.LoadingManager(
      () => {
        console.log("加载完成");
      },
      (url, loaded, total) => {
        console.log(`正在加载: ${url}, 进度: ${(loaded / total) * 100}%`);
      }
    );

    // 创建FBX加载器
    const loader = new FBXLoader(loadingManager);

    // 加载模型
    loader.load(
      MODEL_PATH,
      (object) => {
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.material) {
              const materials = Array.isArray(child.material)
                ? child.material
                : [child.material];

              materials.forEach((material) => {
                if (material.map) {
                  material.map.name = material.map.name.split("\\").pop();
                }
                if (material.normalMap) {
                  material.normalMap.name = material.normalMap.name
                    .split("\\")
                    .pop();
                }
              });
            }
          }
        });

        object.scale.set(0.1, 0.1, 0.1);
        scene.add(object);
        animate();
      },
      undefined,
      (error) => {
        console.error("FBX 加载失败:", error);
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