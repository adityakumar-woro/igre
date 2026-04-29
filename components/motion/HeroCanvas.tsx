'use client';

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Foreground hero image with shader displacement.
 *
 * - Cover-fits the texture into the canvas (handles any aspect)
 * - Slow scroll-driven vertical squash + low-frequency noise breath
 * - Mouse-velocity-driven RGB chromatic aberration, falloff with distance
 * - Editorial vignette + subtle warm bias toward bone
 *
 * Sits on top of <GradientMesh> in the hero composition.
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

  uniform sampler2D uTexture;
  uniform vec2  uResolution;
  uniform vec2  uMouse;
  uniform float uMouseStrength;
  uniform float uScroll;
  uniform float uTime;

  varying vec2 vUv;

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

  void main() {
    vec2 uv = vUv;

    // Cover-fit (assumes ~16:10 source)
    float canvasAspect = uResolution.x / uResolution.y;
    float textureAspect = 16.0 / 10.0;
    if (canvasAspect > textureAspect) {
      float scale = textureAspect / canvasAspect;
      uv.y = (uv.y - 0.5) * scale + 0.5;
    } else {
      float scale = canvasAspect / textureAspect;
      uv.x = (uv.x - 0.5) * scale + 0.5;
    }

    // Scroll-driven gentle squash
    uv.y += uScroll * 0.05;

    // Slow noise breath
    float n = noise(uv * 2.5 + uTime * 0.04);
    uv += vec2(n - 0.5) * 0.014;

    // Mouse-driven chromatic aberration
    vec2 toMouse = uv - uMouse;
    float dist = length(toMouse);
    float falloff = smoothstep(0.7, 0.0, dist);
    float ca = uMouseStrength * 0.018 * falloff;
    vec2 dir = normalize(toMouse + 0.0001);

    float r = texture2D(uTexture, uv + dir * ca).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - dir * ca).b;
    vec3 color = vec3(r, g, b);

    // Editorial colour grade — push slightly warm toward gold
    color *= mix(0.82, 1.04, noise(uv * 0.6 + uTime * 0.02));
    color = mix(color, vec3(0.722, 0.576, 0.353), 0.04);

    // Vignette
    float vignette = smoothstep(1.2, 0.4, length(vUv - 0.5));
    color *= mix(0.80, 1.0, vignette);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function HeroPlane({ src }: { src: string }) {
  const texture = useLoader(THREE.TextureLoader, src);
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const { size } = useThree();

  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const mouseTarget = useRef(new THREE.Vector2(0.5, 0.5));
  const mouseStrength = useRef(0);
  const lastMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const lastTime = useRef(0);
  const scrollY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    lastTime.current = performance.now();

    const onMove = (e: MouseEvent) => {
      mouseTarget.current.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
      const now = performance.now();
      const dt = Math.max(1, now - lastTime.current);
      const dx = mouseTarget.current.x - lastMouse.current.x;
      const dy = mouseTarget.current.y - lastMouse.current.y;
      const speed = Math.min(1.0, Math.sqrt(dx * dx + dy * dy) * 200 / dt);
      mouseStrength.current = Math.min(1, mouseStrength.current * 0.85 + speed * 0.6);
      lastMouse.current.copy(mouseTarget.current);
      lastTime.current = now;
    };
    const onScroll = () => { scrollY.current = window.scrollY; };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseStrength: { value: 0 },
      uScroll: { value: 0 },
      uTime: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [texture],
  );

  useFrame((_, delta) => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    u.uResolution.value.set(size.width, size.height);
    mouse.current.lerp(mouseTarget.current, 0.07);
    u.uMouse.value.copy(mouse.current);
    mouseStrength.current *= 0.93;
    u.uMouseStrength.value = mouseStrength.current;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1;
    u.uScroll.value = Math.min(1, scrollY.current / vh);
    u.uTime.value += delta;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={matRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  );
}

export function HeroCanvas({ src, className }: { src: string; className?: string }) {
  return (
    <div className={className} aria-hidden>
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1] }}
        // dpr capped at 1.25 — anything higher hits perf without visible
        // quality gain on a heavily-shaded plane.
        dpr={[1, 1.25]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
          // Explicit so R3F doesn't apply ACESFilmic tone-mapping (its old
          // default), which crushes our brand colours toward black after a
          // few seconds.
          toneMapping: THREE.NoToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <Suspense fallback={null}>
          <HeroPlane src={src} />
        </Suspense>
      </Canvas>
    </div>
  );
}
