import { useState, useEffect, useRef, type CSSProperties } from 'react';
import type { ObjectSprite, CharacterShadow } from '../engine/types';
import { resolveAsset } from '../engine/assetResolver';
import { TetherLine } from './TetherLine';

interface SpriteObjectProps {
  sprite: ObjectSprite;
  shadow?: CharacterShadow;
  scenarioId: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  cursor: string;
  onClick: () => void;
  /** Object ID, exposed as data-object-id for automated playtests. */
  objectId?: string;
  /** Walking views: z-index in the shared depth layer (sorted by the sprite's base). */
  layerZ?: number;
  /** Not clickable: clicks go through to whatever is behind it (a patrol walking past). */
  passThrough?: boolean;
  /** 0..1, for fading in or out. Default 1. */
  opacity?: number;
  /** Exposed as data-patrol for automated playtests. */
  patrolId?: string;
  /** Show this frame instead of animating (sprite.frame_when / sync_cycle, worked out by the engine). */
  fixedFrame?: number;
}

export function SpriteObject({
  sprite,
  shadow,
  scenarioId,
  x,
  y,
  scaleX,
  scaleY,
  cursor,
  onClick,
  objectId,
  layerZ,
  passThrough,
  opacity,
  patrolId,
  fixedFrame,
}: SpriteObjectProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const animRef = useRef<number>(0);

  const { file, frame_width: fw, frame_height: fh, columns, rows, frame_rate, scale } = sprite;

  useEffect(() => {
    if (frame_rate <= 0 || fixedFrame !== undefined) return;
    let last = 0;
    const interval = 1000 / frame_rate;
    const tick = (time: number) => {
      if (time - last >= interval) {
        last = time;
        setCurrentFrame((f) => (sprite.loop === false ? Math.min(f + 1, columns - 1) : (f + 1) % columns));
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [frame_rate, columns, fixedFrame !== undefined]);

  const renderW = fw * scale;
  const renderH = fh * scale;
  const screenX = x * scaleX;
  const screenY = y * scaleY;
  const shownFrame = fixedFrame ?? currentFrame;
  const bgX = -(shownFrame * fw);
  const sheetW = columns * fw * scale;
  const sheetH = rows * fh * scale;

  const style: CSSProperties = {
    position: 'absolute',
    left: `${screenX - (renderW / 2)}px`,
    top: `${screenY - renderH}px`,
    width: `${renderW}px`,
    height: `${renderH}px`,
    backgroundImage: `url(${resolveAsset(scenarioId, file)})`,
    backgroundPosition: `${bgX * scale}px 0px`,
    backgroundSize: `${sheetW}px ${sheetH}px`,
    backgroundRepeat: 'no-repeat',
    transform: sprite.flip ? 'scaleX(-1)' : undefined,
    imageRendering: 'auto',
    pointerEvents: passThrough ? 'none' : 'auto',
    opacity: opacity ?? 1,
    zIndex: layerZ ?? 4,
    cursor,
    outline: 'none',
  };

  const shColor = shadow?.color ?? 'rgba(0,0,0,0.5)';
  const shadowStyle: CSSProperties | null = shadow ? {
    position: 'absolute',
    left: `${screenX + (shadow.offset_x ?? 0) - ((shadow.width ?? renderW * 0.6) / 2)}px`,
    top: `${screenY + (shadow.offset_y ?? 0) - ((shadow.height ?? 6) / 2)}px`,
    width: `${shadow.width ?? renderW * 0.6}px`,
    height: `${shadow.height ?? 6}px`,
    borderRadius: '50%',
    background: `radial-gradient(ellipse, ${shColor} 0%, ${shColor} 40%, transparent 100%)`,
    opacity: (shadow.opacity ?? 0.6) * (opacity ?? 1),
    transform: shadow.skew_x ? `skewX(${shadow.skew_x}deg)` : undefined,
    pointerEvents: 'none',
    zIndex: layerZ !== undefined ? 1 : 4,
  } : null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <>
      {shadowStyle && <div style={shadowStyle} />}
      {sprite.tether && (
        <TetherLine tether={sprite.tether} scaleX={scaleX} scaleY={scaleY} frameLeft={screenX - renderW / 2} frameTop={screenY - renderH}
          frameW={renderW} frameH={renderH} mirrored={sprite.flip} zIndex={Math.max(0, (layerZ ?? 4) - 1)} opacity={opacity ?? 1} />
      )}
      {passThrough
        ? <div data-patrol={patrolId} style={style} />
        : <div data-object-hotspot data-object-id={objectId} data-frame={shownFrame} style={style} onClick={handleClick} />}
    </>
  );
}
