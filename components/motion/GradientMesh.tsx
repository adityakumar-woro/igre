'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Animated gradient mesh — a fullscreen plane with a custom shader that blends
 * four soft colour blobs (gold / sunset / gulf / ivory) drifting via Perlin-ish
 * noise. Restrained, not glittery — feels like soft warm lighting moving slowly.
 *
 * Used as a background layer behind the hero image. Mouse position has a small
 * influence on the centre of the mesh so it feels alive.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec2  uResolution;
  uniform vec2  uMouse;
  uniform float uTime;
  uniform vec3  uColorA; // gold
  uniform vec3  uColorB; // sunset
  uniform vec3  uColorC; // gulf
  uniform vec3  uColorD; // ivory base

  varying vec2 vUv;

  // Smooth value-noise
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Aspect-correct uv
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = vec2(uv.x * aspect, uv.y);

    float t = uTime * 0.04;

    // Three drifting blob centres
    vec2 c1 = vec2(0.30 * aspect + 0.18 * sin(t * 1.1), 0.30 + 0.10 * cos(t * 0.9));
    vec2 c2 = vec2(0.78 * aspect + 0.16 * cos(t * 0.8), 0.66 + 0.12 * sin(t * 1.0));
    vec2 c3 = vec2(0.55 * aspect + 0.10 * sin(t * 0.6 + 1.7), 0.18 + 0.08 * cos(t * 0.7));

    // Mouse influence — pulls the third blob a little
    vec2 m = vec2(uMouse.x * aspect, uMouse.y);
    c3 = mix(c3, m, 0.18);

    // Distance-based weights, with a noise wobble
    float n = fbm(p * 2.5 + t * 0.6);
    float w1 = smoothstep(0.65, 0.0, distance(p, c1) - n * 0.08);
    float w2 = smoothstep(0.65, 0.0, distance(p, c2) - n * 0.08);
    float w3 = smoothstep(0.55, 0.0, distance(p, c3) - n * 0.10);

    // Base colour: warm ivory; blend in colour blobs
    vec3 col = uColorD;
    col = mix(col, uColorA, clamp(w1, 0.0, 1.0));
    col = mix(col, uColorB, clamp(w2 * 0.85, 0.0, 1.0));
    col = mix(col, uColorC, clamp(w3 * 0.9, 0.0, 1.0));

    // Subtle film grain (very low, just to kill banding)
    float grain = (hash(uv * uResolution + uTime) - 0.5) * 0.025;
    col += grain;

    // Slight soft vignette
    float v = smoothstep(1.25, 0.4, length(uv - 0.5));
    col *= mix(0.86, 1.0, v);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function MeshPlane({ colors }: { colors: { a: THREE.Color; b: THREE.Color; c: THREE.Color; d: THREE.Color } }) {
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const { size } = useThree();
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const target = useRef(new THREE.Vector2(0.5, 0.5));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onMove = (e: MouseEvent) => {
      target.current.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0 },
      uColorA: { value: colors.a },
      uColorB: { value: colors.b },
      uColorC: { value: colors.c },
      uColorD: { value: colors.d },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((_, delta) => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    u.uResolution.value.set(size.width, size.height);
    mouse.current.lerp(target.current, 0.04);
    u.uMouse.value.copy(mouse.current);
    u.uTime.value += delta;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export function GradientMesh({ className }: { className?: string }) {
  // Brand palette: gold, sunset, gulf, ivory
  const colors = useMemo(
    () => ({
      a: new THREE.Color('#B8935A'),
      b: new THREE.Color('#D4866A'),
      c: new THREE.Color('#1E3A52'),
      d: new THREE.Color('#F0E5D6'),
    }),
    [],
  );

  return (
    <div className={className} aria-hidden>
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1] }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      >
        <MeshPlane colors={colors} />
      </Canvas>
    </div>
  );
}
