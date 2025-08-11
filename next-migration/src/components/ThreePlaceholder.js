import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function SpinningCube() {
  return (
    <mesh rotation={[0.4, 0.6, 0]}>
      <boxGeometry args={[1,1,1]} />
      <meshStandardMaterial wireframe color="black" />
    </mesh>
  );
}

export default function ThreePlaceholder() {
  return (
    <div style={{ width: 300, height: 300 }}>
      <Canvas camera={{ position: [2.5, 2.5, 2.5] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5,5,5]} intensity={0.8} />
        <Suspense fallback={null}>
          <SpinningCube />
        </Suspense>
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
