import Image from "next/image";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">3D Model Viewer</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">FBX Viewer</h2>
          <p className="text-gray-600 mb-4">
            View and interact with FBX 3D models. Supports complex animations and materials.
          </p>
          <a
            href="/fbx-viewer"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Open FBX Viewer
          </a>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">OBJ Viewer</h2>
          <p className="text-gray-600 mb-4">
            View and interact with OBJ 3D models. Perfect for static models with custom materials.
          </p>
          <a
            href="/obj-viewer"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Open OBJ Viewer
          </a>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Petal Tunnel</h2>
          <p className="text-gray-600 mb-4">
            Experience a magical journey through a tunnel of floating rose petals. A romantic and immersive 3D experience.
          </p>
          <a
            href="/petal-tunnel"
            className="inline-block bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700 transition-colors"
          >
            Enter Petal Tunnel
          </a>
        </div>
      </div>
    </div>
  );
}
