import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "3D Model Viewer",
  description: "A Next.js application for viewing 3D models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex gap-4">
            <Link href="/" className="hover:text-gray-300">
              Home
            </Link>
            <Link href="/fbx-viewer" className="hover:text-gray-300">
              FBX Viewer
            </Link>
            <Link href="/obj-viewer" className="hover:text-gray-300">
              OBJ Viewer
            </Link>
            <Link href="/petal-tunnel" className="hover:text-gray-300">
              Petal Tunnel
            </Link>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
