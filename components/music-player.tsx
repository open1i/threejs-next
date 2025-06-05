"use client"

import { useEffect, useRef } from "react"

interface MusicPlayerProps {
  enabled: boolean
}

export function MusicPlayer({ enabled }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      if (enabled) {
        audioRef.current.play().catch(() => {
          // 处理自动播放被阻止的情况
          console.log("音频播放被浏览器阻止")
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [enabled])

  return (
    <audio ref={audioRef} loop preload="auto" style={{ display: "none" }}>
      {/* 这里可以添加音频文件，由于演示环境限制，暂时注释 */}
      {/* <source src="/audio/romantic-music.mp3" type="audio/mpeg" /> */}
      您的浏览器不支持音频播放。
    </audio>
  )
}
