import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

const EMOTIONS = [
    { name: 'Alegría', emoji: '😊', color: '#fbbf24', position: [0, 2.2, 0] },
    { name: 'Tristeza', emoji: '😢', color: '#3b82f6', position: [2, 0.7, 0] },
    { name: 'Enojo', emoji: '😠', color: '#ef4444', position: [1.2, -1.8, 0] },
    { name: 'Miedo', emoji: '😨', color: '#7c3aed', position: [-1.2, -1.8, 0] },
    { name: 'Sorpresa', emoji: '😮', color: '#f97316', position: [-2, 0.7, 0] },
    { name: 'Asco', emoji: '🤢', color: '#84cc16', position: [2.5, -0.5, 0.5] },
    { name: 'Calma', emoji: '😌', color: '#34d399', position: [-2.5, -0.5, 0.5] },
    { name: 'Amor', emoji: '💕', color: '#ec4899', position: [0, -0.3, 1] },
];

function EmotionSphere({ emotion, onSelect, isSelected }) {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);
    const color = new THREE.Color(emotion.color);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.elapsedTime;
        const targetScale = isSelected ? 1.4 : hovered ? 1.2 : 1;
        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    });

    return (
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
            <group position={emotion.position}>
                <mesh
                    ref={meshRef}
                    onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
                    onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'default'; }}
                    onClick={(e) => { e.stopPropagation(); onSelect(emotion); }}
                >
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <meshStandardMaterial
                        color={emotion.color}
                        emissive={emotion.color}
                        emissiveIntensity={isSelected ? 0.8 : hovered ? 0.5 : 0.2}
                        roughness={0.2}
                        metalness={0.3}
                        transparent
                        opacity={isSelected ? 1 : 0.85}
                    />
                </mesh>
                {(hovered || isSelected) && (
                    <Text
                        position={[0, -0.8, 0]}
                        fontSize={0.2}
                        color="var(--text-primary)"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {emotion.name}
                    </Text>
                )}
                {/* Glow */}
                <mesh>
                    <sphereGeometry args={[0.65, 16, 16]} />
                    <meshBasicMaterial
                        color={emotion.color}
                        transparent
                        opacity={isSelected ? 0.2 : hovered ? 0.12 : 0.05}
                        side={THREE.BackSide}
                    />
                </mesh>
            </group>
        </Float>
    );
}

export default function MoodSpheres({ onSelect, selected }) {
    return (
        <div style={{ width: '100%', height: '350px', borderRadius: '16px', overflow: 'hidden' }}>
            <Canvas camera={{ position: [0, 0, 6], fov: 50 }} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
                <ambientLight intensity={0.4} />
                <pointLight position={[5, 5, 5]} intensity={1} />
                <pointLight position={[-5, -3, 3]} intensity={0.5} color="#ec4899" />
                {EMOTIONS.map((emotion) => (
                    <EmotionSphere
                        key={emotion.name}
                        emotion={emotion}
                        onSelect={onSelect}
                        isSelected={selected?.name === emotion.name}
                    />
                ))}
            </Canvas>
        </div>
    );
}

export { EMOTIONS };
