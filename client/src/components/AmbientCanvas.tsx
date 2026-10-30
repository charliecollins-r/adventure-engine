import { useRef, useEffect } from 'react';

interface LightSource {
  x: number;
  y: number;
  baseRadius: number;
  color: [number, number, number];
  pulseSpeed: number;
  pulseAmount: number;
  baseAlpha: number;
  phase: number;
}

interface AmbientPreset {
  lights: LightSource[];
  globalTint?: [number, number, number, number];
  flicker?: boolean;
}

const PRESETS: Record<string, AmbientPreset> = {
  stasis_hold: {
    lights: [
      // Main tendril core — bright green pulse
      { x: 0.72, y: 0.42, baseRadius: 0.45, color: [40, 200, 120], pulseSpeed: 0.4, pulseAmount: 0.35, baseAlpha: 0.45, phase: 0 },
      // Tendril upper branch
      { x: 0.68, y: 0.2, baseRadius: 0.25, color: [60, 220, 140], pulseSpeed: 0.55, pulseAmount: 0.3, baseAlpha: 0.30, phase: 1.2 },
      // Tendril lower branch
      { x: 0.75, y: 0.65, baseRadius: 0.2, color: [50, 180, 100], pulseSpeed: 0.5, pulseAmount: 0.25, baseAlpha: 0.25, phase: 2.4 },
      // Tendril far branch left
      { x: 0.58, y: 0.35, baseRadius: 0.18, color: [30, 160, 90], pulseSpeed: 0.65, pulseAmount: 0.4, baseAlpha: 0.22, phase: 0.8 },
      // Amber pod glow left
      { x: 0.12, y: 0.35, baseRadius: 0.2, color: [200, 150, 50], pulseSpeed: 0.25, pulseAmount: 0.15, baseAlpha: 0.18, phase: 3.0 },
      // Amber pod glow right
      { x: 0.88, y: 0.35, baseRadius: 0.18, color: [180, 140, 40], pulseSpeed: 0.3, pulseAmount: 0.12, baseAlpha: 0.15, phase: 1.5 },
      // Floor spill glow from broken pod
      { x: 0.22, y: 0.8, baseRadius: 0.15, color: [200, 160, 60], pulseSpeed: 0.15, pulseAmount: 0.1, baseAlpha: 0.15, phase: 0.5 },
    ],
    flicker: true,
  },
  corridor: {
    lights: [
      { x: 0.25, y: 0.08, baseRadius: 0.3, color: [220, 170, 60], pulseSpeed: 0.3, pulseAmount: 0.2, baseAlpha: 0.30, phase: 0 },
      { x: 0.55, y: 0.06, baseRadius: 0.25, color: [200, 150, 50], pulseSpeed: 0.35, pulseAmount: 0.25, baseAlpha: 0.25, phase: 1.0 },
      { x: 0.85, y: 0.08, baseRadius: 0.25, color: [210, 160, 55], pulseSpeed: 0.28, pulseAmount: 0.2, baseAlpha: 0.22, phase: 2.0 },
      { x: 0.5, y: 0.85, baseRadius: 0.35, color: [60, 180, 120], pulseSpeed: 0.4, pulseAmount: 0.3, baseAlpha: 0.22, phase: 0.5 },
    ],
    flicker: true,
  },
  processing_lab: {
    lights: [
      { x: 0.3, y: 0.25, baseRadius: 0.25, color: [60, 200, 140], pulseSpeed: 0.5, pulseAmount: 0.3, baseAlpha: 0.30, phase: 0 },
      { x: 0.7, y: 0.3, baseRadius: 0.2, color: [50, 180, 120], pulseSpeed: 0.6, pulseAmount: 0.25, baseAlpha: 0.22, phase: 1.5 },
      { x: 0.5, y: 0.1, baseRadius: 0.3, color: [200, 150, 50], pulseSpeed: 0.2, pulseAmount: 0.15, baseAlpha: 0.18, phase: 0.8 },
    ],
    flicker: true,
  },
  security_hub: {
    lights: [
      { x: 0.35, y: 0.3, baseRadius: 0.2, color: [60, 180, 200], pulseSpeed: 0.7, pulseAmount: 0.35, baseAlpha: 0.28, phase: 0 },
      { x: 0.65, y: 0.25, baseRadius: 0.18, color: [50, 160, 180], pulseSpeed: 0.8, pulseAmount: 0.3, baseAlpha: 0.22, phase: 1.0 },
      { x: 0.5, y: 0.4, baseRadius: 0.25, color: [40, 200, 160], pulseSpeed: 0.5, pulseAmount: 0.25, baseAlpha: 0.22, phase: 2.0 },
      { x: 0.2, y: 0.35, baseRadius: 0.15, color: [200, 50, 40], pulseSpeed: 1.2, pulseAmount: 0.5, baseAlpha: 0.20, phase: 0 },
    ],
  },
  feeding_station: {
    lights: [
      { x: 0.18, y: 0.4, baseRadius: 0.2, color: [140, 60, 200], pulseSpeed: 0.6, pulseAmount: 0.35, baseAlpha: 0.30, phase: 0 },
      { x: 0.15, y: 0.55, baseRadius: 0.15, color: [160, 70, 220], pulseSpeed: 0.5, pulseAmount: 0.3, baseAlpha: 0.22, phase: 1.2 },
      { x: 0.6, y: 0.35, baseRadius: 0.2, color: [60, 200, 140], pulseSpeed: 0.4, pulseAmount: 0.25, baseAlpha: 0.22, phase: 0.5 },
      { x: 0.85, y: 0.4, baseRadius: 0.2, color: [50, 180, 120], pulseSpeed: 0.55, pulseAmount: 0.3, baseAlpha: 0.18, phase: 2.0 },
    ],
    flicker: true,
  },
  morgue: {
    lights: [
      { x: 0.5, y: 0.1, baseRadius: 0.35, color: [80, 120, 180], pulseSpeed: 0.2, pulseAmount: 0.15, baseAlpha: 0.22, phase: 0 },
      { x: 0.55, y: 0.25, baseRadius: 0.2, color: [50, 180, 100], pulseSpeed: 0.45, pulseAmount: 0.3, baseAlpha: 0.25, phase: 1.0 },
      { x: 0.15, y: 0.4, baseRadius: 0.18, color: [180, 140, 50], pulseSpeed: 0.3, pulseAmount: 0.2, baseAlpha: 0.15, phase: 2.0 },
    ],
  },
  specimen_archive: {
    lights: [
      { x: 0.12, y: 0.4, baseRadius: 0.25, color: [140, 80, 200], pulseSpeed: 0.35, pulseAmount: 0.25, baseAlpha: 0.30, phase: 0 },
      { x: 0.88, y: 0.4, baseRadius: 0.25, color: [120, 60, 180], pulseSpeed: 0.4, pulseAmount: 0.2, baseAlpha: 0.25, phase: 1.5 },
      { x: 0.5, y: 0.3, baseRadius: 0.25, color: [60, 200, 180], pulseSpeed: 0.5, pulseAmount: 0.3, baseAlpha: 0.22, phase: 0.8 },
    ],
  },
  ventilation_shaft: {
    lights: [
      { x: 0.3, y: 0.3, baseRadius: 0.2, color: [200, 60, 40], pulseSpeed: 0.8, pulseAmount: 0.4, baseAlpha: 0.25, phase: 0 },
      { x: 0.7, y: 0.35, baseRadius: 0.18, color: [180, 50, 30], pulseSpeed: 0.9, pulseAmount: 0.35, baseAlpha: 0.20, phase: 1.5 },
      { x: 0.5, y: 0.4, baseRadius: 0.3, color: [60, 180, 140], pulseSpeed: 0.4, pulseAmount: 0.25, baseAlpha: 0.25, phase: 0.5 },
    ],
    flicker: true,
  },
  airlock_bay: {
    lights: [
      { x: 0.18, y: 0.4, baseRadius: 0.25, color: [150, 180, 220], pulseSpeed: 0.15, pulseAmount: 0.1, baseAlpha: 0.22, phase: 0 },
      { x: 0.52, y: 0.45, baseRadius: 0.2, color: [220, 160, 50], pulseSpeed: 0.6, pulseAmount: 0.3, baseAlpha: 0.22, phase: 1.0 },
      { x: 0.85, y: 0.45, baseRadius: 0.15, color: [180, 200, 220], pulseSpeed: 0.3, pulseAmount: 0.2, baseAlpha: 0.15, phase: 2.0 },
    ],
  },
};

// Map view IDs to preset names
const VIEW_TO_PRESET: Record<string, string> = {
  act1_stasis_hold: 'stasis_hold',
  act1_pod_cluster: 'stasis_hold',
  act1_containment_corridor: 'corridor',
  act1_processing_lab: 'processing_lab',
  act1_security_hub: 'security_hub',
  act1_feeding_station: 'feeding_station',
  act1_morgue: 'morgue',
  act1_specimen_archive: 'specimen_archive',
  act1_ventilation_shaft: 'ventilation_shaft',
  act1_airlock_bay: 'airlock_bay',
};

interface AmbientCanvasProps {
  viewId: string;
  width: number;
  height: number;
}

export function AmbientCanvas({ viewId, width, height }: AmbientCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const presetName = VIEW_TO_PRESET[viewId];
    const preset = presetName ? PRESETS[presetName] : null;
    if (!preset) return;

    let flickerSeed = 0;

    const render = (time: number) => {
      const t = time / 1000;
      ctx.clearRect(0, 0, width, height);

      // Optional micro-flicker (simulates electrical instability)
      let flickerMul = 1;
      if (preset.flicker) {
        flickerSeed += 0.1;
        flickerMul = 0.92 + 0.08 * Math.sin(flickerSeed * 7.3) * Math.sin(flickerSeed * 13.1);
      }

      for (const light of preset.lights) {
        const cx = light.x * width;
        const cy = light.y * height;

        // Composite pulse from multiple sine waves for organic feel
        const pulse1 = Math.sin(t * light.pulseSpeed * Math.PI * 2 + light.phase);
        const pulse2 = Math.sin(t * light.pulseSpeed * 1.7 * Math.PI * 2 + light.phase + 1.3) * 0.3;
        const pulse = (pulse1 + pulse2) / 1.3;

        const alpha = (light.baseAlpha + light.baseAlpha * light.pulseAmount * pulse) * flickerMul;
        const radius = light.baseRadius * Math.max(width, height) * (1 + pulse * 0.08);

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        const [r, g, b] = light.color;
        gradient.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
        gradient.addColorStop(0.4, `rgba(${r},${g},${b},${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [viewId, width, height]);

  const presetName = VIEW_TO_PRESET[viewId];
  if (!presetName || !PRESETS[presetName]) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        mixBlendMode: 'lighter',
      }}
    />
  );
}
