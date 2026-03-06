import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial, RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

function GlassCard({ position, rotation, width, height, children }: { position: [number, number, number], rotation: [number, number, number], width: number, height: number, children: React.ReactNode }) {
    return (
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5} position={position} rotation={rotation}>
            <group>
                <RoundedBox args={[width, height, 0.2]} radius={0.15} smoothness={4} receiveShadow castShadow>
                    <MeshTransmissionMaterial
                        backside
                        samples={4}
                        thickness={2}
                        chromaticAberration={0.05}
                        anisotropy={0.1}
                        distortion={0}
                        distortionScale={0}
                        temporalDistortion={0}
                        ior={1.5}
                        color="#ffffff"
                        roughness={0.1}
                    />
                </RoundedBox>
                {/* Subtle white border for glass edge definition */}
                <RoundedBox args={[width + 0.05, height + 0.05, 0.1]} radius={0.16} smoothness={4} position={[0, 0, -0.05]}>
                    <meshBasicMaterial color="#ffffff" opacity={0.1} transparent />
                </RoundedBox>
                <group position={[0, 0, 0.11]}>
                    {children}
                </group>
            </group>
        </Float>
    );
}

function DataVisuals() {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
            group.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.15) * 0.05;
        }
    });

    return (
        <group ref={group}>
            {/* Main Center Card - Bar Chart */}
            <GlassCard width={4} height={3} position={[0, 0, 0]} rotation={[0, 0, 0]}>
                <Text position={[-1.7, 1.1, 0.01]} fontSize={0.2} color="#64748b" anchorX="left" fontWeight="bold">
                    TOTAL REVENUE
                </Text>
                <Text position={[-1.7, 0.7, 0.01]} fontSize={0.5} color="#0f172a" anchorX="left" fontWeight="black">
                    $124.5K
                </Text>

                {/* Floating Bars */}
                <group position={[-1.3, -0.8, 0]}>
                    {[0.6, 1.1, 0.8, 1.8, 1.4, 1.2, 0.9].map((h, i) => (
                        <RoundedBox key={i} args={[0.25, h, 0.15]} position={[i * 0.45, h / 2, 0]} radius={0.05} smoothness={4} receiveShadow castShadow>
                            <meshStandardMaterial
                                color={i === 3 ? "#3b82f6" : "#cbd5e1"}
                                roughness={0.2}
                                metalness={0.1}
                            />
                        </RoundedBox>
                    ))}
                </group>
            </GlassCard>

            {/* Top Right Card - Conversion Widget */}
            <GlassCard width={2.5} height={1.2} position={[2.2, 1.7, 0.5]} rotation={[0.1, -0.2, -0.1]}>
                <Text position={[0, 0.2, 0.01]} fontSize={0.18} color="#64748b" anchorX="center" fontWeight="bold">CONVERSION</Text>
                <Text position={[0, -0.2, 0.01]} fontSize={0.4} color="#10b981" anchorX="center" fontWeight="black">+14.2%</Text>
            </GlassCard>

            {/* Bottom Left Card - Active Users */}
            <GlassCard width={2.2} height={1.2} position={[-2.2, -1.2, 0.8]} rotation={[-0.1, 0.2, 0.05]}>
                <Text position={[0, 0.2, 0.01]} fontSize={0.18} color="#64748b" anchorX="center" fontWeight="bold">ACTIVE CAMPAIGNS</Text>
                <Text position={[0, -0.2, 0.01]} fontSize={0.45} color="#6366f1" anchorX="center" fontWeight="black">42</Text>
            </GlassCard>

            {/* Behind decorative abstract shapes */}
            <Float speed={2} rotationIntensity={1} floatIntensity={1} position={[2.5, -1.5, -1.5]}>
                <mesh castShadow receiveShadow>
                    <torusGeometry args={[0.5, 0.15, 16, 32]} />
                    <meshStandardMaterial color="#0ea5e9" roughness={0.1} metalness={0.8} />
                </mesh>
            </Float>

            <Float speed={3} rotationIntensity={2} floatIntensity={2} position={[-2.5, 1.5, -1]}>
                <mesh castShadow receiveShadow>
                    <icosahedronGeometry args={[0.6, 0]} />
                    <meshStandardMaterial color="#8b5cf6" roughness={0.1} metalness={0.8} wireframe />
                </mesh>
            </Float>
        </group>
    );
}

export default function ThreeDDashboard() {
    return (
        <div className="w-full h-full min-h-[400px] lg:min-h-[500px]" style={{ pointerEvents: 'none' }}>
            <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }} shadows>
                <ambientLight intensity={0.8} />
                <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={2} color="#ffffff" castShadow />
                <pointLight position={[-10, 5, -10]} intensity={1} color="#bae6fd" />

                <DataVisuals />

                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
