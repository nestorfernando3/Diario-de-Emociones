import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const EMOTION_COLORS = {
    'Alegría': '#fbbf24', 'Tristeza': '#3b82f6', 'Enojo': '#ef4444',
    'Miedo': '#7c3aed', 'Sorpresa': '#f97316', 'Asco': '#84cc16',
    'Calma': '#34d399', 'Amor': '#ec4899',
};

function Star({ entry, index, total, onClick }) {
    const meshRef = useRef();
    const color = EMOTION_COLORS[entry.feeling] || entry.mood_color || '#6366f1';
    const size = 0.08 + (entry.feeling_intensity / 100) * 0.15;
    const angle = (index / total) * Math.PI * 6;
    const radius = 1 + (index / total) * 3;
    const yBase = (Math.sin(index * 1.7) * 1.5);
    const position = useMemo(() => [
        Math.cos(angle) * radius, yBase, Math.sin(angle) * radius
    ], [angle, radius, yBase]);

    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.1;
    });

    return (
        <group position={position}>
            <mesh ref={meshRef}
                onClick={(e) => { e.stopPropagation(); onClick?.(entry); }}
                onPointerEnter={() => { document.body.style.cursor = 'pointer'; }}
                onPointerLeave={() => { document.body.style.cursor = 'default'; }}>
                <sphereGeometry args={[size, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.1} />
            </mesh>
            <mesh>
                <sphereGeometry args={[size * 2.5, 8, 8]} />
                <meshBasicMaterial color={color} transparent opacity={0.1} />
            </mesh>
        </group>
    );
}

export default function EmotionConstellation({ entries = [], onEntryClick }) {
    if (entries.length === 0) {
        return (
            <div style={{
                width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', fontStyle: 'italic', borderRadius: '16px', background: 'var(--bg-glass)',
                border: '1px solid var(--border-glass)'
            }}>
                ✨ Tus registros aparecerán aquí como estrellas
            </div>
        );
    }

    return (
        <div style={{
            width: '100%', height: '400px', borderRadius: '16px', overflow: 'hidden',
            border: '1px solid var(--border-glass)'
        }}>
            <Canvas camera={{ position: [0, 2, 5], fov: 60 }} gl={{ antialias: true, alpha: true }}
                style={{ background: 'radial-gradient(ellipse at center, #0f0f2e 0%, #0a0a1a 100%)' }}>
                <ambientLight intensity={0.2} />
                <pointLight position={[0, 5, 5]} intensity={0.5} color="#818cf8" />
                <OrbitControls enableDamping dampingFactor={0.05} enableZoom maxDistance={12} minDistance={2}
                    autoRotate autoRotateSpeed={0.3} />
                {entries.map((entry, i) => (
                    <Star key={entry.id || i} entry={entry} index={i} total={entries.length} onClick={onEntryClick} />
                ))}
            </Canvas>
        </div>
    );
}
