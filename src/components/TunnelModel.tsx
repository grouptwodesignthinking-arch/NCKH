/* eslint-disable react/no-unknown-property -- three.js JSX props (args, position, emissive…) */
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Component, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';

export type LayerKey = 'ground' | 'l1' | 'l2' | 'l3';

const levelY = { l1: -1, l2: -2, l3: -3.2 } as const;
type Level = keyof typeof levelY;

/** Chamber positions; zone keys match the 2D schematic in XRaySchematic. */
const zone3d: Record<string, { level: Level; pos: [number, number, number] }> = {
  entrance: { level: 'l1', pos: [-3.6, levelY.l1, -1.2] },
  kitchen: { level: 'l1', pos: [-1.6, levelY.l1, 0] },
  meeting: { level: 'l2', pos: [0.8, levelY.l2, 1.2] },
  vent: { level: 'l1', pos: [2.8, levelY.l1, -1.2] },
  well: { level: 'l3', pos: [-0.6, levelY.l3, 0] },
  clinic: { level: 'l3', pos: [2.4, levelY.l3, 1.2] },
  crater: { level: 'l1', pos: [3.8, 0.1, 1.4] },
};

const TUNNELS: { level: Level; pts: [number, number][] }[] = [
  {
    level: 'l1',
    pts: [
      [-3.6, -1.2],
      [-1.6, 0],
      [0.8, 1.2],
      [2.2, 0.2],
      [2.8, -1.2],
    ],
  },
  {
    level: 'l2',
    pts: [
      [-2, 0.8],
      [0, -1.2],
      [0.8, 1.2],
      [3.8, -0.4],
    ],
  },
  {
    level: 'l3',
    pts: [
      [-0.6, 0],
      [1, 0.4],
      [2.4, 1.2],
      [3.4, 0],
    ],
  },
];

const SHAFTS: { x: number; z: number; from: number; to: number }[] = [
  { x: -3.6, z: -1.2, from: 0, to: levelY.l1 }, // entrance
  { x: 2.8, z: -1.2, from: 0, to: levelY.l1 }, // air vent
  { x: -0.6, z: 0, from: 0, to: levelY.l3 }, // well
  { x: 0, z: -1.2, from: levelY.l1, to: levelY.l2 },
];

function Scene({ layers, highlight }: { layers: Record<LayerKey, boolean>; highlight?: string }) {
  const group = useRef<THREE.Group>(null);
  // Rotation state lives in a ref: it changes every frame and must not re-render.
  const rot = useRef({ x: 0.45, y: -0.5, dragging: false, lastX: 0, lastY: 0 });
  useFrame((_, dt) => {
    const r = rot.current;
    if (!group.current) return;
    if (!r.dragging) r.y += dt * 0.15;
    group.current.rotation.y = r.y;
    group.current.rotation.x = r.x;
  });

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    rot.current.dragging = true;
    rot.current.lastX = e.clientX;
    rot.current.lastY = e.clientY;
  };
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const r = rot.current;
    if (!r.dragging) return;
    r.y += (e.clientX - r.lastX) * 0.01;
    r.x = Math.max(-0.2, Math.min(1.3, r.x + (e.clientY - r.lastY) * 0.01));
    r.lastX = e.clientX;
    r.lastY = e.clientY;
  };
  const onUp = () => {
    rot.current.dragging = false;
  };

  const tubes = useMemo(
    () =>
      TUNNELS.map((t) => {
        const curve = new THREE.CatmullRomCurve3(t.pts.map(([x, z]) => new THREE.Vector3(x, levelY[t.level], z)));
        return { level: t.level, geo: new THREE.TubeGeometry(curve, 64, 0.12, 8, false) };
      }),
    [],
  );

  return (
    <>
      {/* Invisible plane behind the model that catches drag gestures. */}
      <mesh position={[0, 0, -6]} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
        <planeGeometry args={[80, 80]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={group} position={[0, 1.5, 0]}>
        {layers.ground ? (
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[9, 0.1, 4]} />
            <meshStandardMaterial color="#6E8B3D" transparent opacity={0.35} />
          </mesh>
        ) : null}
        <mesh position={[0, -1.7, 0]}>
          <boxGeometry args={[9, 3.4, 4]} />
          <meshStandardMaterial color="#7A4E2D" transparent opacity={0.08} />
        </mesh>
        {tubes.map((t, i) =>
          layers[t.level] ? (
            <mesh key={i} geometry={t.geo}>
              <meshStandardMaterial color="#E0B46A" emissive="#5A3A12" />
            </mesh>
          ) : null,
        )}
        {SHAFTS.map((s, i) => {
          const h = s.from - s.to;
          return (
            <mesh key={i} position={[s.x, s.to + h / 2, s.z]}>
              <cylinderGeometry args={[0.07, 0.07, h, 8]} />
              <meshStandardMaterial color="#C8862F" />
            </mesh>
          );
        })}
        {Object.entries(zone3d).map(([k, z]) => {
          if (!layers[z.level]) return null;
          const on = k === highlight;
          return (
            <mesh key={k} position={z.pos}>
              <boxGeometry args={on ? [0.9, 0.5, 0.7] : [0.6, 0.35, 0.5]} />
              <meshStandardMaterial color={on ? '#F2C46D' : '#B07A45'} emissive={on ? '#C8862F' : '#000000'} emissiveIntensity={on ? 0.8 : 0} />
            </mesh>
          );
        })}
      </group>
    </>
  );
}

export function TunnelModel({ layers, highlight }: { layers: Record<LayerKey, boolean>; highlight?: string }) {
  return (
    <Canvas camera={{ position: [0, 3.5, 11], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1.2} />
      <Scene layers={layers} highlight={highlight} />
    </Canvas>
  );
}

/** Falls back to the 2D schematic if WebGL is unavailable. */
export class GLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
