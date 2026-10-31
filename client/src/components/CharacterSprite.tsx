import { useState, useEffect, useRef, type CSSProperties } from 'react';
import type { CharacterConfig, CharacterPlacement } from '../engine/types';

interface CharacterSpriteProps {
  config: CharacterConfig;
  placement: CharacterPlacement;
  scenarioId: string;
  scaleX: number;
  scaleY: number;
  cursor?: string;
  onObjectClick?: (objectId: string) => void;
}

export function CharacterSprite({
  config,
  placement,
  scenarioId,
  scaleX,
  scaleY,
  cursor,
  onObjectClick,
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
  const shouldLoop = spriteSet.loop !== false;

  useEffect(() => {
    if (isStatic) return;
    setCurrentFrame(0);
    let last = 0;
    const interval = 1000 / frameRate;
    const tick = (time: number) => {
      if (time - last >= interval) {
        last = time;
        setCurrentFrame((f) => {
          const next = f + 1;
          if (next >= cols) return shouldLoop ? 0 : cols - 1;
          return next;
        });
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [isStatic, frameRate, cols, shouldLoop, placement.sprite_set]);

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
  const interactive = !!placement.object_id && !!onObjectClick;

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
    pointerEvents: interactive ? 'auto' : 'none',
    zIndex: 5,
    cursor: interactive ? cursor : undefined,
    transform: (flipH || mirrorFacing) ? 'scaleX(-1)' : undefined,
  };

  const handleClick = interactive
    ? (e: React.MouseEvent) => { e.stopPropagation(); onObjectClick!(placement.object_id!); }
    : undefined;

  return <div data-object-hotspot style={style} onClick={handleClick} />;
}
