import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, useTexture } from '@react-three/drei';


function EarthMesh() {
  const meshRef = useRef();
  
  // Load realistic earth textures
  const [colorMap, normalMap, specularMap] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png',
    'https://unpkg.com/three-globe/example/img/earth-water.png'
  ]);

  // Rotate the earth slightly for a dynamic feel
  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.0005;
  });

  return (
    <group>
      {/* Lighting for the earth */}
      <ambientLight intensity={4.5} color="#ffffff" />
      <directionalLight position={[10, 10, 5]} intensity={4} color="#ffffff" />
      <directionalLight position={[-10, 0, -5]} intensity={2.5} color="#ffffff" />
      
      {/* Base Earth */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          roughnessMap={specularMap}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
}

function Globe() {
  return (
    <div className="w-full h-full relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1e293b] via-[#0f172a] to-[#020617]">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
            <EarthMesh />
            
            {/* Stars background */}
            <Stars
              radius={100}
              depth={50}
              count={5000}
              factor={4}
              saturation={0}
              fade
              speed={1}
            />
          </Float>
        </Suspense>
        
        <OrbitControls
          enableZoom={true}
          enableRotate={true}
          zoomSpeed={0.6}
          rotateSpeed={0.8}
          minDistance={2.6}
          maxDistance={15}
          autoRotate={true}
          autoRotateSpeed={0.3}
        />
      </Canvas>
      
      {/* Overlay gradient for better visual integration */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent pointer-events-none opacity-80" />
    </div>
  );
}

export default Globe;
