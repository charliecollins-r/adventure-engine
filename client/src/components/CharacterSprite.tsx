import { useState, useEffect, useRef, type CSSProperties } from 'react';
import type { CharacterConfig, CharacterPlacement, WearableOverlay } from '../engine/types';
import { TetherLine } from './TetherLine';
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
  /** Walking views: z-index in the shared depth layer (sprite objects and character sorted by feet). */
  layerZ?: number;
  /** Walking views: multiplier on the character's scale from walk_area.depth_scale. */
  depthScale?: number;
  /** z-index of his shadow in the depth layer (default 1: under every sprite). */
  shadowZ?: number;
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
  layerZ,
  depthScale = 1,
  shadowZ,
}: CharacterSpriteProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const animRef = useRef<number>(0);

  const spriteSet = config.sprite_sets[placement.sprite_set];
  if (!spriteSet) return null;

  const fw = spriteSet.frame_width ?? config.frame_width;
  const fh = spriteSet.frame_height ?? config.frame_height;
  const scale = (spriteSet.scale ?? config.scale ?? 1) * (placement.scale ?? 1) * depthScale;
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

  const hanging = spriteSet.anchor === 'top';
  const flipH = placement.flip_h ?? false;
  const mirrorFacing = facing === 'left' && !directions.includes('left');
  const interactive = !!placement.object_id && !!onObjectClick;

  const style: CSSProperties = {
    position: 'absolute',
    left: `${screenX - (renderW / 2)}px`,
    top: `${hanging ? screenY : screenY - renderH}px`,
    width: `${renderW}px`,
    height: `${renderH}px`,
    backgroundImage: `url(${resolveAsset(scenarioId, spriteSet.file)})`,
    backgroundPosition: `${bgX * scale}px ${bgY * scale}px`,
    backgroundSize: `${sheetW}px ${sheetH}px`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated',
    pointerEvents: interactive ? 'auto' : 'none',
    zIndex: layerZ ?? 5,
    cursor: interactive ? cursor : undefined,
    transform: (flipH || mirrorFacing) ? 'scaleX(-1)' : undefined,
    ...(spriteSet.bob ? {
      ['--kq-bob' as string]: `${-spriteSet.bob.amount * scaleY}px`,
      animation: `kq-char-bob ${spriteSet.bob.period}s ease-in-out infinite`,
    } : {}),
  };

  const handleClick = interactive
    ? (e: React.MouseEvent) => { e.stopPropagation(); onObjectClick!(placement.object_id!); }
    : undefined;

  const shadow = hanging ? undefined : (placement.shadow ?? config.shadow);
  const shColor = shadow?.color ?? 'rgba(0,0,0,0.5)';
  const shW = (shadow?.width ?? renderW * 0.6 / depthScale) * depthScale;
  const shH = (shadow?.height ?? 6) * depthScale;
  const shadowStyle: CSSProperties | null = shadow ? {
    position: 'absolute',
    left: `${screenX + (shadow.offset_x ?? 0) * depthScale - shW / 2}px`,
    top: `${screenY + (shadow.offset_y ?? 0) * depthScale - shH / 2}px`,
    width: `${shW}px`,
    height: `${shH}px`,
    borderRadius: '50%',
    background: `radial-gradient(ellipse, ${shColor} 0%, ${shColor} 40%, transparent 100%)`,
    opacity: shadow.opacity ?? 0.6,
    transform: shadow.skew_x ? `skewX(${shadow.skew_x}deg)` : undefined,
    pointerEvents: 'none',
    zIndex: layerZ !== undefined ? (shadowZ ?? 1) : 4,
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
      zIndex: layerZ !== undefined ? layerZ + 1 : 6,
      transform: (flipH || mirrorFacing) ? 'scaleX(-1)' : undefined,
    };
    return <div key={itemId} style={overlayStyle} />;
  });

  return (
    <>
      {shadowStyle && <div style={shadowStyle} />}
      {placement.tether && (
        <TetherLine tether={placement.tether} scaleX={scaleX} scaleY={scaleY} frameLeft={screenX - renderW / 2} frameTop={hanging ? screenY : screenY - renderH}
          frameW={renderW} frameH={renderH} mirrored={flipH || mirrorFacing}
          bob={spriteSet.bob ? { amount: spriteSet.bob.amount * scaleY, period: spriteSet.bob.period } : undefined}
          zIndex={Math.max(0, (layerZ ?? 5) - 1)} />
      )}
      {spriteSet.bob && <style>{'@keyframes kq-char-bob { 0%, 100% { translate: 0 0; } 50% { translate: 0 var(--kq-bob); } }'}</style>}
      <div data-object-hotspot style={style} onClick={handleClick} />
      {overlayElements}
    </>
  );
}
