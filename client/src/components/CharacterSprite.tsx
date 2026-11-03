import { useState, useEffect, useRef, type CSSProperties } from 'react';
import type { CharacterConfig, CharacterPlacement, WearableOverlay } from '../engine/types';
import { resolveAsset } from '../engine/assetResolver';

interface EquippedOverlay {
  itemId: string;
  overlay: WearableOverlay;
}

interface CharacterSpriteProps {
  config: CharacterConfig;
  placement: CharacterPlacement;
  scenarioId: string;
  scaleX: number;
  scaleY: number;
  cursor?: string;
  onObjectClick?: (objectId: string) => void;
  equippedOverlays?: EquippedOverlay[];
}

export function CharacterSprite({
  config,
  placement,
  scenarioId,
  scaleX,
  scaleY,
  cursor,
  onObjectClick,
  equippedOverlays,
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
    backgroundImage: `url(${resolveAsset(scenarioId, spriteSet.file)})`,
    backgroundPosition: `${bgX * scale}px ${bgY * scale}px`,
    backgroundSize: `${sheetW}px ${sheetH}px`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated',
    pointerEvents: interactive ? 'auto' : 'none',
    zIndex: 5,
    cursor: interactive ? cursor : undefined,
    transform: (flipH || mirrorFacing) ? 'scaleX(-1)' : undefined,
  };

  const handleClick = interactive
    ? (e: React.MouseEvent) => { e.stopPropagation(); onObjectClick!(placement.object_id!); }
    : undefined;

  const shadow = placement.shadow ?? config.shadow;
  const shColor = shadow?.color ?? 'rgba(0,0,0,0.5)';
  const shadowStyle: CSSProperties | null = shadow ? {
    position: 'absolute',
    left: `${screenX + (shadow.offset_x ?? 0) - ((shadow.width ?? renderW * 0.6) / 2)}px`,
    top: `${screenY + (shadow.offset_y ?? 0) - ((shadow.height ?? 6) / 2)}px`,
    width: `${shadow.width ?? renderW * 0.6}px`,
    height: `${shadow.height ?? 6}px`,
    borderRadius: '50%',
    background: `radial-gradient(ellipse, ${shColor} 0%, ${shColor} 40%, transparent 100%)`,
    opacity: shadow.opacity ?? 0.6,
    transform: shadow.skew_x ? `skewX(${shadow.skew_x}deg)` : undefined,
    pointerEvents: 'none',
    zIndex: 4,
  } : null;

  const overlayElements = (equippedOverlays ?? []).map(({ itemId, overlay }) => {
    const oScale = (overlay.scale ?? 1) * scale;
    const oW = overlay.frame_width * oScale;
    const oH = overlay.frame_height * oScale;
    const oLeft = screenX - (renderW / 2) + (overlay.offset_x * scale);
    const oTop = screenY - renderH + (overlay.offset_y * scale);
    const overlayStyle: CSSProperties = {
      position: 'absolute',
      left: `${oLeft}px`,
      top: `${oTop}px`,
      width: `${oW}px`,
      height: `${oH}px`,
      backgroundImage: `url(${resolveAsset(scenarioId, overlay.sprite_file)})`,
      backgroundSize: `${oW}px ${oH}px`,
      backgroundRepeat: 'no-repeat',
      imageRendering: 'pixelated',
      pointerEvents: 'none',
      zIndex: 6,
      transform: (flipH || mirrorFacing) ? 'scaleX(-1)' : undefined,
    };
    return <div key={itemId} style={overlayStyle} />;
  });

  return (
    <>
      {shadowStyle && <div style={shadowStyle} />}
      <div data-object-hotspot style={style} onClick={handleClick} />
      {overlayElements}
    </>
  );
}
