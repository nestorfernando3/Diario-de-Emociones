import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 500, mouse }) {
    const mesh = useRef();
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        return pos;
    }, [count]);

    const colors = useMemo(() => {
        const cols = new Float32Array(count * 3);
        const palette = [
            [0.39, 0.4, 0.95],   // indigo
            [0.55, 0.36, 0.96],  // purple
            [0.66, 0.33, 0.97],  // violet
            [0.93, 0.29, 0.6],   // pink
            [0.06, 0.72, 0.84],  // cyan
        ];
        for (let i = 0; i < count; i++) {
            const c = palette[Math.floor(Math.random() * palette.length)];
            cols[i * 3] = c[0];
            cols[i * 3 + 1] = c[1];
            cols[i * 3 + 2] = c[2];
        }
        return cols;
    }, [count]);

    const sizes = useMemo(() => {
        const s = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            s[i] = Math.random() * 3 + 1;
        }
        return s;
    }, [count]);

    useFrame((state) => {
        if (!mesh.current) return;
        const time = state.clock.elapsedTime;
        const positions = mesh.current.geometry.attributes.position.array;
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3 + 1] += Math.sin(time * 0.3 + i * 0.1) * 0.003;
            positions[i3] += Math.cos(time * 0.2 + i * 0.05) * 0.002;
        }
        mesh.current.geometry.attributes.position.needsUpdate = true;
        mesh.current.rotation.y = time * 0.02;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={2.5}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

function CentralOrb() {
    const meshRef = useRef();
    const glowRef = useRef();

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (meshRef.current) {
            meshRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.1);
            meshRef.current.rotation.x = t * 0.1;
            meshRef.current.rotation.z = t * 0.15;
        }
        if (glowRef.current) {
            glowRef.current.scale.setScalar(1.5 + Math.sin(t * 0.5) * 0.2);
            glowRef.current.material.opacity = 0.15 + Math.sin(t * 0.7) * 0.05;
        }
    });

    return (
        <group>
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[1.5, 3]} />
                <meshStandardMaterial
                    color="#6366f1"
                    emissive="#4338ca"
                    emissiveIntensity={0.5}
                    wireframe
                    transparent
                    opacity={0.6}
                />
            </mesh>
            <mesh ref={glowRef}>
                <sphereGeometry args={[2, 32, 32]} />
                <meshBasicMaterial
                    color="#818cf8"
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
}

export default function EmotionOrb() {
    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <Canvas
                camera={{ position: [0, 0, 8], fov: 60 }}
                style={{ background: '#0a0a1a' }}
                gl={{ antialias: true, alpha: false }}
            >
                <ambientLight intensity={0.3} />
                <pointLight position={[5, 5, 5]} intensity={1} color="#818cf8" />
                <pointLight position={[-5, -5, 3]} intensity={0.5} color="#ec4899" />
                <CentralOrb />
                <Particles />
            </Canvas>
        </div>
    );
}
