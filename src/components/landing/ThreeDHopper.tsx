import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, useCursor } from "@react-three/drei";
import * as THREE from "three";

function CuteBot() {
    const group = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);

    // Global mouse tracking relative to the bot's position
    const mouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Default center if we can't find the element
            let centerX = window.innerWidth / 2;
            let centerY = window.innerHeight / 2;

            const container = document.getElementById('three-d-hopper-container');
            if (container) {
                const rect = container.getBoundingClientRect();
                centerX = rect.left + rect.width / 2;
                centerY = rect.top + rect.height / 2;
            }

            // Calculate offset relative to the bot's center
            mouse.current.x = ((e.clientX - centerX) / window.innerWidth) * 2;
            mouse.current.y = -((e.clientY - centerY) / window.innerHeight) * 2;
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useFrame(() => {
        if (!group.current) return;
        const targetX = (mouse.current.x * Math.PI) / 3;
        const targetY = -(mouse.current.y * Math.PI) / 4;
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetX, 0.1);
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetY, 0.1);
    });

    return (
        <group ref={group} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
            <group scale={0.7}>
                <Float speed={2.5} rotationIntensity={0.1} floatIntensity={0.6}>
                    {/* Main Body - Soft white capsule/sphere */}
                    <mesh position={[0, 0, 0]}>
                        <capsuleGeometry args={[1, 1, 32, 32]} />
                        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
                    </mesh>

                    {/* Dark Visor/Screen */}
                    <mesh position={[0, 0.2, 0.85]} rotation={[0, 0, 0]}>
                        <capsuleGeometry args={[0.7, 0.4, 32, 32]} />
                        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
                    </mesh>

                    {/* Cute Light Blue Eyes */}
                    {/* Left Eye */}
                    <mesh position={[-0.3, 0.2, 1.45]}>
                        <capsuleGeometry args={[0.15, 0.2, 16, 16]} />
                        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={hovered ? 2 : 1.5} />
                    </mesh>

                    {/* Right Eye */}
                    <mesh position={[0.3, 0.2, 1.45]}>
                        <capsuleGeometry args={[0.15, 0.2, 16, 16]} />
                        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={hovered ? 2 : 1.5} />
                    </mesh>

                    {/* Floating "ears" or antennas */}
                    <group position={[-1.2, 0.6, 0]}>
                        <Float speed={4} rotationIntensity={0.5} floatIntensity={1}>
                            <mesh>
                                <sphereGeometry args={[0.2, 32, 32]} />
                                <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.5} />
                            </mesh>
                        </Float>
                    </group>
                    <group position={[1.2, 0.6, 0]}>
                        <Float speed={4} rotationIntensity={0.5} floatIntensity={1}>
                            <mesh>
                                <sphereGeometry args={[0.2, 32, 32]} />
                                <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.5} />
                            </mesh>
                        </Float>
                    </group>
                </Float>
            </group>
        </group>
    );
}

export default function ThreeDHopper() {
    return (
        <div id="three-d-hopper-container" className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] relative pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
                <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#bae6fd" />
                <pointLight position={[0, -2, 4]} intensity={1} color="#38bdf8" />

                <CuteBot />

                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
