import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Particles = ({ count = 200 }) => {
  const mesh = useRef();
  const { mouse } = useThree();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
        ],
        size: Math.random() * 0.03 + 0.01,
      });
    }
    return temp;
  }, [count]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    particles.forEach((p, i) => {
      pos[i * 3] = p.position[0];
      pos[i * 3 + 1] = p.position[1];
      pos[i * 3 + 2] = p.position[2];
    });
    return pos;
  }, [particles, count]);

  const sizes = useMemo(() => {
    const s = new Float32Array(count);
    particles.forEach((p, i) => {
      s[i] = p.size;
    });
    return s;
  }, [particles, count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.03;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#6c5ce7"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const FloatingShape = ({ position, color, speed = 1, distort = 0.3, size = 1 }) => {
  const mesh = useRef();

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.15 * speed;
      mesh.current.rotation.z = state.clock.elapsedTime * 0.1 * speed;
    }
  });

  return (
    <Float speed={speed * 1.5} rotationIntensity={0.4} floatIntensity={1.5}>
      <mesh ref={mesh} position={position} scale={size}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.15}
          wireframe
          distort={distort}
          speed={2}
        />
      </mesh>
    </Float>
  );
};

const FloatingTorus = ({ position, color, speed = 1, size = 1 }) => {
  const mesh = useRef();

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.15 * speed;
    }
  });

  return (
    <Float speed={speed * 1.2} rotationIntensity={0.3} floatIntensity={1}>
      <mesh ref={mesh} position={position} scale={size}>
        <torusKnotGeometry args={[1, 0.3, 100, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          wireframe
        />
      </mesh>
    </Float>
  );
};

const HeroCanvas = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#6c5ce7" />
      <pointLight position={[-5, -3, 3]} intensity={0.5} color="#00d2ff" />

      <Particles count={150} />

      <FloatingShape position={[-4, 2, -2]} color="#6c5ce7" speed={0.8} size={1.2} distort={0.4} />
      <FloatingShape position={[4, -1.5, -3]} color="#00d2ff" speed={0.6} size={0.9} distort={0.3} />
      <FloatingShape position={[2, 3, -4]} color="#a855f7" speed={1} size={0.7} distort={0.5} />
      <FloatingShape position={[-3, -2, -1]} color="#6c5ce7" speed={0.7} size={0.5} distort={0.2} />

      <FloatingTorus position={[5, 1, -5]} color="#6c5ce7" speed={0.5} size={0.6} />
      <FloatingTorus position={[-5, -1, -4]} color="#00d2ff" speed={0.4} size={0.4} />
    </Canvas>
  );
};

export default HeroCanvas;
