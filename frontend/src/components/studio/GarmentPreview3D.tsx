"use client";
import React, { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Float,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import { useStudioStore } from "@/store/useStudioStore";

// ── Realistic Fabric Material ──
function FabricMaterial({ color }: { color: string }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.8}
      metalness={0.05}
      side={THREE.DoubleSide}
    />
  );
}

// ── Improved T-Shirt Model (Organic Shapes) ──
function TShirtModel({ color }: { color: string }) {
  return (
    <group>
      {/* Main Body - Slightly curved cylinder */}
      <mesh castShadow position={[0, -0.2, 0]}>
        <cylinderGeometry args={[1.1, 1.2, 2.5, 32, 1, false]} />
        <FabricMaterial color={color} />
      </mesh>

      {/* Shoulders / Top */}
      <mesh castShadow position={[0, 1.05, 0]}>
        <sphereGeometry args={[1.11, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <FabricMaterial color={color} />
      </mesh>

      {/* Left Sleeve */}
      <mesh castShadow position={[-1.3, 0.7, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.35, 0.45, 1.2, 32]} />
        <FabricMaterial color={color} />
      </mesh>

      {/* Right Sleeve */}
      <mesh castShadow position={[1.3, 0.7, 0]} rotation={[0, 0, 0.6]}>
        <cylinderGeometry args={[0.35, 0.45, 1.2, 32]} />
        <FabricMaterial color={color} />
      </mesh>

      {/* Collar Ring */}
      <mesh castShadow position={[0, 1.35, 0]}>
        <torusGeometry args={[0.42, 0.06, 16, 64]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    </group>
  );
}

// ── Improved Hoodie Model ──
function HoodieModel({ color }: { color: string }) {
  return (
    <group>
      {/* Oversized Body */}
      <mesh castShadow position={[0, -0.1, 0]}>
        <cylinderGeometry args={[1.2, 1.3, 2.8, 32]} />
        <FabricMaterial color={color} />
      </mesh>

      {/* Long Left Sleeve */}
      <mesh castShadow position={[-1.5, 0.3, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.4, 0.5, 2.0, 32]} />
        <FabricMaterial color={color} />
      </mesh>

      {/* Long Right Sleeve */}
      <mesh castShadow position={[1.5, 0.3, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.4, 0.5, 2.0, 32]} />
        <FabricMaterial color={color} />
      </mesh>

      {/* The Hood - Compressed sphere */}
      <mesh castShadow position={[0, 1.6, -0.2]} scale={[1.2, 1.4, 1.1]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <FabricMaterial color={color} />
      </mesh>

      {/* Kangaroo Pocket */}
      <mesh castShadow position={[0, -0.6, 1.1]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.1]} />
        <FabricMaterial color={color} />
      </mesh>
    </group>
  );
}

function GarmentSwitcher() {
  const { currentGarment, garmentColor } = useStudioStore();

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <Suspense fallback={null}>
        {currentGarment.id === "hoodie" || currentGarment.id === "crewneck" ? (
          <HoodieModel color={garmentColor} />
        ) : currentGarment.id === "tshirt" ? (
          <TShirtModel color={garmentColor} />
        ) : (
          /* Fallback for others - simplified body */
          <TShirtModel color={garmentColor} />
        )}
      </Suspense>
    </Float>
  );
}

export function GarmentPreview3D() {
  return (
    <div className="w-full h-full relative group">
      {/* Studio Lighting Label */}
      <div className="absolute bottom-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-[10px] text-white font-bold tracking-widest uppercase">
        Real-time Engine
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={35} />

        {/* Lights */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <spotLight
          position={[0, 5, 2]}
          angle={0.5}
          penumbra={1}
          intensity={2}
          castShadow
          shadow-mapSize={1024}
        />
        <directionalLight
          position={[-5, 5, -5]}
          intensity={0.5}
          color="#00E5FF"
        />

        <GarmentSwitcher />

        <ContactShadows
          position={[0, -2.8, 0]}
          opacity={0.4}
          scale={12}
          blur={2}
          far={10}
        />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={4}
          maxDistance={12}
          autoRotate={true}
          autoRotateSpeed={0.5}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
