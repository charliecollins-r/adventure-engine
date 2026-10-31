import { useState, useEffect, useRef, type CSSProperties } from 'react';
import type { CharacterConfig, CharacterPlacement } from '../engine/types';

interface CharacterSpriteProps {
  config: CharacterConfig;
  placement: CharacterPlacement;
  scenarioId: string;
  scaleX: number;
  scaleY: number;
}

export function CharacterSprite({
  config,
  placement,
  scenarioId,
  scaleX,
  scaleY,
}: CharacterSpriteProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const animRef = useRef<number>(0);

  const spriteSet = config.sprite_sets[placement.sprite_set];
  if (!spriteSet) return null;

  const fw = config.frame_width;
  const fh = config.frame_height;
  const scale = config.scale ?? 1;
  const frameRate = spriteSet.frame_rate ?? 6;
  const isStatic = placement.frame !== undefined || frameRate <= 0;

  const directions = spriteSet.directions ?? ['down', 'left', 'right', 'up'];
  const facing = placement.facing ?? 'down';
  const row = Math.max(0, directions.indexOf(facing));
  const cols = spriteSet.columns;

  useEffect(() => {
    if (isStatic) return;
    let last = 0;
    const interval = 1000 / frameRate;
    const tick = (time: number) => {
      if (time - last >= interval) {
        last = time;
        setCurrentFrame((f) => (f + 1) % cols);
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [isStatic, frameRate, cols]);

  const frame = isStatic ? (placement.frame ?? 0) : currentFrame;
  const bgX = -(frame * fw);
  const bgY = -(row * fh);

  const renderW = fw * scale;
  const renderH = fh * scale;
  const screenX = placement.x * scaleX;
  const screenY = placement.y * scaleY;
  const sheetW = cols * fw * scale;
  const sheetH = spriteSet.rows * fh * scale;

  const flipH = placement.flip_h ?? false;
  const mirrorFacing = facing === 'left' && !directions.includes('left');

  const style: CSSProperties = {
    position: 'absolute',
    left: `${screenX - (renderW / 2)}px`,
    top: `${screenY - renderH}px`,
    width: `${renderW}px`,
    height: `${renderH}px`,
    backgroundImage: `url(/scenarios/${scenarioId}/${spriteSet.file})`,
    backgroundPosition: `${bgX * scale}px ${bgY * scale}px`,
    backgroundSize: `${sheetW}px ${sheetH}px`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'auto',
    pointerEvents: 'none',
    zIndex: 5,
    transform: (flipH || mirrorFacing) ? 'scaleX(-1)' : undefined,
  };

  return <div style={style} />;
}
