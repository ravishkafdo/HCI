import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function TestCanvas() {
  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
        
        {/* Simple red box */}
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </Canvas>
    </div>
  );
} 