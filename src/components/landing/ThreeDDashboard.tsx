import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, RoundedBox, Text, MeshTransmissionMaterial, ContactShadows, Billboard } from "@react-three/drei";
import * as THREE from "three";

function PremiumGlassCard({ position, rotation, width, height, children, glowColor }: { position: [number, number, number], rotation: [number, number, number], width: number, height: number, children: React.ReactNode, glowColor?: string }) {
    return (
        <group position={position} rotation={rotation}>
            <RoundedBox args={[width, height, 0.1]} radius={0.15} smoothness={8}>
                <MeshTransmissionMaterial
                    backside
                    samples={4}
                    thickness={0.2}
                    chromaticAberration={0.025}
                    anisotropy={0.1}
                    distortion={0.1}
                    distortionScale={0.1}
                    temporalDistortion={0.0}
                    iridescence={0.5}
                    iridescenceIOR={1}
                    iridescenceThicknessRange={[0, 1400]}
                    clearcoat={1}
                    color="#ffffff"
                    transparent
                    opacity={0.9}
                />
            </RoundedBox>

            {/* Subtle inner edge highlight */}
            <RoundedBox args={[width - 0.02, height - 0.02, 0.105]} radius={0.14} smoothness={4}>
                <meshBasicMaterial color="#ffffff" transparent opacity={0.15} wireframe={true} />
            </RoundedBox>

            {glowColor && (
                <pointLight position={[0, 0, -0.5]} intensity={0.5} color={glowColor} distance={3} />
            )}

            <group position={[0, 0, 0.06]}>
                {children}
            </group>
        </group>
    );
}

function DataVisuals() {
    const group = useRef<THREE.Group>(null);
    const barsRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (group.current) {
            group.current.rotation.y = Math.sin(t * 0.1) * 0.1;
            group.current.rotation.x = Math.cos(t * 0.15) * 0.05;
        }

        // Gentle breathing animation for bars
        if (barsRef.current) {
            barsRef.current.children.forEach((bar, i) => {
                const scaleY = 1 + Math.sin(t * 2 + i) * 0.05;
                bar.scale.setY(scaleY);
                // Adjust position so it scales from the bottom
                const baseHeight = (bar as any).userData.baseHeight || 1;
                bar.position.y = (baseHeight * scaleY) / 2;
            });
        }
    });

    const barHeights = [0.8, 1.2, 0.9, 1.8, 1.4, 2.2, 1.7, 2.8, 3.5];

    return (
        <group ref={group}>
            {/* Main Center Card - Analytics */}
            <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.2}>
                <PremiumGlassCard width={6} height={4} position={[0, 0, 0]} rotation={[0, 0, 0]} glowColor="#38bdf8">

                    {/* Header Text */}
                    <Text position={[-2.6, 1.5, 0]} fontSize={0.2} color="#f8fafc" anchorX="left" fontWeight="bold" letterSpacing={0.1}>
                        REVENUE GROWTH
                    </Text>
                    <Text position={[-2.6, 1.0, 0]} fontSize={0.7} color="#ffffff" anchorX="left" fontWeight="black" letterSpacing={-0.02}>
                        $2.4M
                    </Text>

                    {/* Growth Pill */}
                    <group position={[-0.4, 1.15, 0]}>
                        <RoundedBox args={[0.8, 0.25, 0.05]} radius={0.125} smoothness={4}>
                            <meshBasicMaterial color="#10b981" />
                        </RoundedBox>
                        <Text position={[0, 0, 0.03]} fontSize={0.12} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
                            +24.5% ↗
                        </Text>
                    </group>

                    {/* Chart Area Background Grid */}
                    <group position={[0, -0.6, -0.05]}>
                        {[0, 1, 2, 3].map((y, i) => (
                            <mesh key={i} position={[0, y * 0.6 - 1, 0]}>
                                <planeGeometry args={[5.2, 0.02]} />
                                <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
                            </mesh>
                        ))}
                    </group>

                    {/* 3D Bar Chart */}
                    <group ref={barsRef} position={[-2.2, -1.6, 0.1]}>
                        {barHeights.map((h, i) => {
                            const isHighest = i === 8;
                            const isSecondHighest = i === 7;
                            return (
                                <RoundedBox
                                    key={i}
                                    args={[0.3, h, 0.2]}
                                    position={[i * 0.55, h / 2, 0]}
                                    radius={0.05}
                                    smoothness={4}
                                    userData={{ baseHeight: h }}
                                >
                                    <meshPhysicalMaterial
                                        color={isHighest ? "#38bdf8" : isSecondHighest ? "#7dd3fc" : "#e2e8f0"}
                                        metalness={isHighest ? 0.3 : 0.1}
                                        roughness={isHighest ? 0.1 : 0.3}
                                        transmission={0.5}
                                        thickness={0.5}
                                        clearcoat={1}
                                    />
                                </RoundedBox>
                            );
                        })}
                    </group>
                </PremiumGlassCard>
            </Float>

            {/* Top Right Floating Metric */}
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} position={[3.2, 1.8, 0.5]}>
                <PremiumGlassCard width={2.5} height={1.4} position={[0, 0, 0]} rotation={[0.05, -0.15, 0.05]} glowColor="#a855f7">
                    <group position={[0, 0.1, 0]}>
                        <Billboard>
                            <mesh>
                                <ringGeometry args={[0.2, 0.28, 32]} />
                                <meshBasicMaterial color="#c084fc" />
                            </mesh>
                            <mesh>
                                <ringGeometry args={[0.2, 0.28, 32, 1, 0, Math.PI * 1.5]} />
                                <meshBasicMaterial color="#a855f7" />
                            </mesh>
                        </Billboard>
                    </group>
                    <Text position={[0, -0.3, 0.05]} fontSize={0.15} color="#e2e8f0" anchorX="center" fontWeight="bold" letterSpacing={0.1}>ACTIVE USERS</Text>
                    <Text position={[0, -0.55, 0.05]} fontSize={0.25} color="#ffffff" anchorX="center" fontWeight="black">14,203</Text>
                </PremiumGlassCard>
            </Float>

            {/* Bottom Left Floating Metric */}
            <Float speed={2.5} rotationIntensity={0.3} floatIntensity={0.6} position={[-3.5, -1.2, 0.8]}>
                <PremiumGlassCard width={2.2} height={1.2} position={[0, 0, 0]} rotation={[-0.1, 0.2, -0.05]}>
                    <Text position={[0, 0.2, 0.05]} fontSize={0.14} color="#e2e8f0" anchorX="center" fontWeight="bold" letterSpacing={0.1}>CONVERSION</Text>
                    <Text position={[0, -0.15, 0.05]} fontSize={0.45} color="#34d399" anchorX="center" fontWeight="black">8.4%</Text>
                </PremiumGlassCard>
            </Float>

            {/* Decorative Glowing Orbs behind */}
            <Float speed={1} floatIntensity={2}>
                <mesh position={[2, -1.5, -2]}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshPhysicalMaterial color="#38bdf8" transmission={1} thickness={2} roughness={0.1} />
                    <pointLight color="#38bdf8" intensity={2} distance={5} />
                </mesh>
            </Float>
            <Float speed={1.5} floatIntensity={1.5}>
                <mesh position={[-2.5, 1.5, -1.5]}>
                    <sphereGeometry args={[0.8, 32, 32]} />
                    <meshPhysicalMaterial color="#a855f7" transmission={1} thickness={2} roughness={0.1} />
                    <pointLight color="#a855f7" intensity={2} distance={5} />
                </mesh>
            </Float>
            <Float speed={2} floatIntensity={3}>
                <mesh position={[0, 2.5, -3]}>
                    <sphereGeometry args={[1.5, 32, 32]} />
                    <meshPhysicalMaterial color="#10b981" transmission={1} thickness={3} roughness={0.2} />
                    <pointLight color="#10b981" intensity={1} distance={8} />
                </mesh>
            </Float>
        </group>
    );
}

export default function ThreeDDashboard() {
    return (
        <div className="w-full h-full min-h-[500px] lg:min-h-[600px]" style={{ pointerEvents: 'none' }}>
            <Canvas camera={{ position: [0, 0, 8.5], fov: 45 }} dpr={[1, 2]}>
                <color attach="background" args={['transparent']} />

                {/* Advanced Lighting setup for premium look */}
                <ambientLight intensity={1.2} />
                <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
                <directionalLight position={[-10, -10, -10]} intensity={1} color="#38bdf8" />
                <spotLight position={[0, 10, 10]} angle={0.2} penumbra={1} intensity={3} color="#a855f7" />

                <DataVisuals />

                <Environment preset="city" />

                {/* Stunning soft contact shadows */}
                <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={15} blur={2.5} far={10} color="#0f172a" />
            </Canvas>
        </div>
    );
}
