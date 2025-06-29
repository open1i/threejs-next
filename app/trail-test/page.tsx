"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html, Stars } from "@react-three/drei";
import { HeartScene } from "@/components/heart-scene";
import { ParticleSystem } from "@/components/particle-system";
import { MusicPlayer } from "@/components/music-player";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, RotateCcw, Palette } from "lucide-react";

export default function RomanticHeartScene() {
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [bgIndex, setBgIndex] = useState(0);

  // 背景预设
  const backgrounds = [
    {
      name: "浪漫紫粉",
      className: "bg-gradient-to-b from-purple-900 via-pink-900 to-black",
      environment: "city" as const,
    },
    {
      name: "梦幻蓝紫",
      className: "bg-gradient-to-b from-blue-900 via-purple-900 to-black",
      environment: "lobby" as const,
    },
    {
      name: "温暖橙粉",
      className: "bg-gradient-to-b from-orange-900 via-pink-900 to-black",
      environment: "studio" as const,
    },
    {
      name: "星空黑金",
      className: "bg-gradient-to-b from-gray-950 via-zinc-950 to-black",
      environment: "apartment" as const,
    },
  ] as const;

  const currentBg = backgrounds[bgIndex];

  const switchBackground = () => {
    setBgIndex((prev) => (prev + 1) % backgrounds.length);
  };

  return (
    <div
      className={`w-full h-screen relative ${currentBg.className} transition-colors duration-500`}
    >
      {/* 控制面板 */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={switchBackground}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          title={`切换背景: ${
            backgrounds[(bgIndex + 1) % backgrounds.length].name
          }`}
        >
          <Palette className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMusicEnabled(!musicEnabled)}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          {musicEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setAutoRotate(!autoRotate)}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* 标题 */}
      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
          立体爱心轨道
        </h1>
        <p className="text-white/70">真正3D的浪漫爱心被粒子轨道环绕</p>
      </div>

      {/* 3D场景 */}
      <Canvas
        camera={{ position: [0, 0, 20], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense
          fallback={
            <Html center>
              <div className="text-white text-xl">加载中...</div>
            </Html>
          }
        >
          {/* 环境和背景 */}
          <Environment
            preset="night" // 使用简单的预设
            background={false} // 不显示环境背景
          />
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
          <fog attach="fog" args={["#000000", 30, 100]} />

          {/* 灯光系统 */}
          <ambientLight intensity={0.2} color="#ff69b4" />
          <pointLight position={[10, 10, 10]} intensity={0.8} color="#ff1493" />
          <pointLight
            position={[-10, -10, -10]}
            intensity={0.4}
            color="#ff69b4"
          />
          <spotLight
            position={[0, 15, 0]}
            angle={0.5}
            penumbra={1}
            intensity={1}
            color="#ff69b4"
            castShadow
          />

          {/* 主要场景元素 */}
          <HeartScene />
          <ParticleSystem />

          {/* 相机控制 */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={0.3}
            minDistance={10}
            maxDistance={40}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI - Math.PI / 6}
          />
        </Suspense>
      </Canvas>

      {/* 音乐播放器 */}
      <MusicPlayer enabled={musicEnabled} />
    </div>
  );
}
