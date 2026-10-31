import { useState, useEffect, useRef, type CSSProperties } from 'react';
import type { ObjectSprite } from '../engine/types';

interface SpriteObjectProps {
  sprite: ObjectSprite;
  scenarioId: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  cursor: string;
  onClick: () => void;
}

export function SpriteObject({
  sprite,
  scenarioId,
  x,
  y,
  scaleX,
  scaleY,
  cursor,
  onClick,
}: SpriteObjectProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const animRef = useRef<number>(0);

  const { file, frame_width: fw, frame_height: fh, columns, rows, frame_rate, scale } = sprite;

  useEffect(() => {
    if (frame_rate <= 0) return;
    let last = 0;
    const interval = 1000 / frame_rate;
    const tick = (time: number) => {
      if (time - last >= interval) {
        last = time;
        setCurrentFrame((f) => (f + 1) % columns);
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [frame_rate, columns]);

  const renderW = fw * scale;
  const renderH = fh * scale;
  const screenX = x * scaleX;
  const screenY = y * scaleY;
  const bgX = -(currentFrame * fw);
  const sheetW = columns * fw * scale;
  const sheetH = rows * fh * scale;

  const style: CSSProperties = {
    position: 'absolute',
    left: `${screenX - (renderW / 2)}px`,
    top: `${screenY - renderH}px`,
    width: `${renderW}px`,
    height: `${renderH}px`,
    backgroundImage: `url(/scenarios/${scenarioId}/${file})`,
    backgroundPosition: `${bgX * scale}px 0px`,
    backgroundSize: `${sheetW}px ${sheetH}px`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'auto',
    pointerEvents: 'auto',
    zIndex: 4,
    cursor,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return <div data-object-hotspot style={style} onClick={handleClick} />;
}
