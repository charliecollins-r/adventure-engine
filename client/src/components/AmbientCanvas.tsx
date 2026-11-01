import { useRef, useEffect } from 'react';
import type { AmbientLighting } from '../engine/types';

interface AmbientCanvasProps {
  lighting?: AmbientLighting;
  width: number;
  height: number;
}

export function AmbientCanvas({ lighting, width, height }: AmbientCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !lighting) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let flickerSeed = 0;

    const render = (time: number) => {
      const t = time / 1000;
      ctx.clearRect(0, 0, width, height);

      let flickerMul = 1;
      if (lighting.flicker) {
        flickerSeed += 0.1;
        flickerMul = 0.92 + 0.08 * Math.sin(flickerSeed * 7.3) * Math.sin(flickerSeed * 13.1);
      }

      for (const light of lighting.lights) {
        const cx = light.x * width;
        const cy = light.y * height;

        const phase = light.phase ?? 0;
        const pulse1 = Math.sin(t * light.pulse_speed * Math.PI * 2 + phase);
        const pulse2 = Math.sin(t * light.pulse_speed * 1.7 * Math.PI * 2 + phase + 1.3) * 0.3;
        const pulse = (pulse1 + pulse2) / 1.3;

        const alpha = (light.alpha + light.alpha * light.pulse_amount * pulse) * flickerMul;
        const radius = light.radius * Math.max(width, height) * (1 + pulse * 0.08);

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
  }, [lighting, width, height]);

  if (!lighting) return null;

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
