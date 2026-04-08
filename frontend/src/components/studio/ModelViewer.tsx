"use client";
"use no memo";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Float } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";
import { useStudioStore } from "@/store/useStudioStore";

function GarmentModel() {
  const { garmentColor } = useStudioStore();
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group>
        {/* T-Shirt body */}
        <mesh ref={meshRef} position={[0, 0, 0]} castShadow>
          <boxGeometry args={[2.2, 2.8, 0.15]} />
          <meshStandardMaterial color={garmentColor} roughness={0.7} />
        </mesh>
        {/* Left sleeve */}
        <mesh position={[-1.6, 0.6, 0]} rotation={[0, 0, -0.4]} castShadow>
          <boxGeometry args={[1, 0.7, 0.12]} />
          <meshStandardMaterial color={garmentColor} roughness={0.7} />
        </mesh>
        {/* Right sleeve */}
        <mesh position={[1.6, 0.6, 0]} rotation={[0, 0, 0.4]} castShadow>
          <boxGeometry args={[1, 0.7, 0.12]} />
          <meshStandardMaterial color={garmentColor} roughness={0.7} />
        </mesh>
        {/* Collar */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.18, 32, 1, true]} />
          <meshStandardMaterial color={garmentColor} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </Float>
  );
}

function SceneLoader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#1A1A1A" wireframe />
    </mesh>
  );
}

export function ModelViewer() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        shadows
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-5, 3, -2]} intensity={0.5} color="#00E5FF" />
        <pointLight position={[0, -3, 3]} intensity={0.3} color="#F5C842" />

        <Suspense fallback={<SceneLoader />}>
          <GarmentModel />
          <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={8} blur={2} far={4} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          autoRotate
          autoRotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}
