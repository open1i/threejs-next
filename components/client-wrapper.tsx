"use client"

import dynamic from 'next/dynamic'

const ObjViewer = dynamic(() => import('./obj-viewer'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="text-2xl text-gray-600">Loading viewer...</div>
    </div>
  )
})

export default function ClientWrapper() {
  return <ObjViewer />
} 