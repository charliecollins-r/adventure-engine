import type { CSSProperties } from 'react';

const ICON_MAP: Record<string, string> = {
  vial: 'M12 2v6.5l-4 4V19c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-6.5l-4-4V2h-2zm-1 0h4',
  shard: 'M12 2L6 14l6 8 6-8L12 2z',
  probe: 'M20 4l-4 4-2-2 4-4 2 2zM6 16l4-4 2 2-4 4H6v-2z',
  card: 'M4 4h16v16H4V4zm3 3v2h10V7H7zm0 4v2h7v-2H7z',
  crystal: 'M12 2l-4 8 4 12 4-12-4-8z',
  tube: 'M9 2v4l-3 10c0 2 2 4 6 4s6-2 6-4L15 6V2H9z',
  tag: 'M4 4l7 0 9 9-7 7-9-9V4zm3 3a1 1 0 100 2 1 1 0 000-2z',
  helmet: 'M12 2C7 2 4 6 4 10v4h3v-2c0-3 2-5 5-5s5 2 5 5v2h3v-4c0-4-3-8-8-8z',
  map: 'M3 6l6-2 6 2 6-2v16l-6 2-6-2-6 2V6z',
  tendril: 'M12 2c-4 4-2 8 0 10s4 6 0 10',
  box: 'M4 8l8-4 8 4v8l-8 4-8-4V8zm8-4v16',
  cell: 'M7 2v20h10V2H7zm2 3h6v4H9V5z',
  disruptor: 'M13 2l-2 8h4l-4 12 2-8H9l4-12z',
  chip: 'M7 5h10v14H7V5zM5 8h2M5 12h2M5 16h2M17 8h2M17 12h2M17 16h2',
  flask: 'M9 2h6v6l3 8c1 2-1 4-3 4H9c-2 0-4-2-3-4l3-8V2z',
  beacon: 'M12 2v4M12 18v4M4 12H2M22 12h-2M12 8a4 4 0 100 8 4 4 0 000-8z',
  blueprint: 'M4 4h16v16H4V4zm4 4h8M8 10h5M8 14h8M8 16h3',
  weapon: 'M14 2l-4 8-6 2 8 4 2 6 4-8 4-2-6-4-2-6z',
  antenna: 'M12 10v12M8 2l4 8 4-8M6 6l6 4 6-4',
  key: 'M7 14a5 5 0 110-4h8v4h2v-4h2v4h1v-4',
  book: 'M4 4c2-1 4-1 8 1 4-2 6-2 8-1v14c-2-1-4-1-8 1-4-2-6-2-8 1V4z',
  badge: 'M12 2l2 4h4l-3 3 1 5-4-2-4 2 1-5-3-3h4l2-4z',
  rope: 'M6 2c2 4-2 6 0 10s-2 6 0 10',
  knife: 'M12 2l2 14-2 2-2-2 2-14z',
  wrench: 'M6 3a4 4 0 016 2l6 6-3 3-6-6a4 4 0 01-3-5z',
  bottle: 'M10 2h4v4l2 4v8c0 1-2 2-4 2s-4-1-4-2V10l2-4V2z',
  matches: 'M8 14V4l2-2 2 2v10M14 14V6l2-2 2 2v8',
  mirror: 'M12 4a6 6 0 100 12 6 6 0 000-12zM12 16v4',
  compass: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 6l3 4-3 4-3-4 3-4z',
  gear: 'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M2 12h3M19 12h3',
  coin: 'M12 4a8 8 0 100 16 8 8 0 000-16zm-1 4h2v2h-2V8zm0 4h2v4h-2v-4z',
  lens: 'M10 4a6 6 0 100 12 6 6 0 000-12zM15 15l5 5',
  scroll: 'M6 4c0-1 1-2 2-2h8c1 0 2 1 2 2v16c0 1-1 2-2 2H8c-1 0-2-1-2-2V4zm3 4h6M9 10h6M9 14h4',
  potion: 'M10 2h4v4l3 6v6c0 1-2 2-5 2s-5-1-5-2v-6l3-6V2z',
  gem: 'M6 8l6-6 6 6-6 14L6 8zm6-6l-3 6h6l-3-6z',
  document: 'M6 2h9l5 5v13H6V2zm9 0v5h5M9 10h6M9 13h6M9 16h3',
  note: 'M5 3h14v18H5V3zm3 4h8M8 10h8M8 14h5',
  photo: 'M4 4h16v16H4V4zm4 12l3-4 2 2 3-4 4 6H4z',
  fire: 'M12 2C8 8 6 12 6 15a6 6 0 0012 0c0-3-2-7-6-13z',
  flashlight: 'M6 14l4-12h4l4 12H6zm4 0v6h4v-6',
  lighter: 'M9 10h6v10H9V10zm3-8c-2 2-2 4 0 6',
  wire: 'M2 12h4l2-4 2 8 2-8 2 4h4l2-4 2 4h2',
  pin: 'M12 2a3 3 0 00-3 3c0 2 3 6 3 6s3-4 3-6a3 3 0 00-3-3z',
  pipe: 'M4 8h6v4H4V8zM10 6h4v8h-4V6zM14 8h6v4h-6V8z',
  saw: 'M4 12h2l1-3 2 3 2-3 2 3 2-3 2 3 2-3 1 3h2M4 12v4h16v-4',
  light: 'M12 2v2M4 12H2M6 6L4 4M18 6l2-2M22 12h-2M12 8a4 4 0 100 8 4 4 0 000-8z',
  mask: 'M4 8c0-3 4-6 8-6s8 3 8 6l-2 6c-1 2-3 3-6 3s-5-1-6-3L4 8zm4 2a2 2 0 104 0M14 10a2 2 0 104 0',
  scarab: 'M12 4c-3 0-6 3-6 6v4c0 3 3 6 6 6s6-3 6-6v-4c0-3-3-6-6-6zm-2 6h4',
  seal: 'M12 2a10 10 0 100 20 10 10 0 000-20zm-3 8h6v4H9v-4z',
  tablet: 'M6 2h12v20H6V2zm3 4h6M9 8h6M9 12h4',
  statue: 'M12 2c-2 0-3 2-3 4v4l-3 6h12l-3-6V6c0-2-1-4-3-4zm-4 16h8v2H8v-2z',
  jar: 'M8 4h8v2l1 4v8c0 1-2 2-5 2s-5-1-5-2V10l1-4V4z',
  fuse: 'M6 12h4l2-4 2 4h4M12 8v-4',
  chain: 'M8 4a4 4 0 100 8M16 12a4 4 0 100 8',
  gloves: 'M6 10v8c0 2 2 4 4 4h4c2 0 4-2 4-4v-8l-2-4v-2h-2v4h-1V4h-2v6h-1V4H8v6L6 10z',
  wand: 'M4 20l12-12M16 8l-2-2M18 4l2 2M14 6l-2-2',
  magnifier: 'M10 4a6 6 0 100 12 6 6 0 000-12zM15 15l6 6',
  heart: 'M12 6c-2-4-8-4-8 2 0 5 8 12 8 12s8-7 8-12c0-6-6-6-8-2z',
  sand: 'M6 2h12v4l-4 5 4 5v4H6v-4l4-5-4-5V2z',
  lightning: 'M13 2l-5 10h5l-5 10 10-12h-5L18 2h-5z',
  folder: 'M3 6h6l2 2h10v12H3V6z',
  eyes: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7zm10-3a3 3 0 100 6 3 3 0 000-6z',
};

const FALLBACK_SYMBOLS: Record<string, string> = {
  vial: '⚗',    shard: '◇',   probe: '⚒',
  card: '⬛',    crystal: '◈',  tube: '│',
  tag: '⬢',     helmet: '∩',   map: '☷',
  tendril: '∿', box: '■',     cell: '⚡',
  disruptor: '⚡', chip: '⬛',  flask: '⚗',
  beacon: '☉',  blueprint: '⬛', weapon: '⚔',
  antenna: '↑',  key: '⚿',    book: '⬛',
  badge: '⭐',   rope: '∿',    knife: '†',
  wrench: '⚒',  bottle: '⬛',  matches: '⬛',
  mirror: '○',  compass: '⌖', gear: '⚙',
  coin: '●',    lens: '○',    scroll: '⬛',
  potion: '⚗',  gem: '◆',     document: '⬛',
  note: '⬛',    photo: '⬛',   fire: '⬢',
  flashlight: '⬢', lighter: '⬢', wire: '∿',
  pin: '●',     pipe: '│',    saw: '⬛',
  light: '☉',   mask: '⬢',    scarab: '⬢',
  seal: '○',    tablet: '⬛',  statue: '⬢',
  jar: '⬛',     fuse: '⚡',    chain: '∿',
  gloves: '✋',  wand: '⬢',    magnifier: '○',
  heart: '♥',   sand: '⏳',    lightning: '⚡',
  folder: '⬛',  eyes: '◎',
};

const ICON_COLORS: Record<string, string> = {
  crystal: '#88ccff', gem: '#cc88ff', potion: '#88ff88',
  flask: '#88ffaa', fire: '#ffaa44', lightning: '#ffff44',
  cell: '#ffff66', beacon: '#ffcc44', heart: '#ff6666',
  disruptor: '#ff8844', weapon: '#ff6644', knife: '#cccccc',
  light: '#ffeeaa', flashlight: '#ffeeaa', coin: '#ffcc00',
  badge: '#ffcc00', key: '#ddaa44', shard: '#aaddff',
  vial: '#aaddee', tendril: '#66cc88', scarab: '#44cc88',
};

interface ItemIconProps {
  icon: string;
  size?: number;
  style?: CSSProperties;
}

export function ItemIcon({ icon, size = 24, style }: ItemIconProps) {
  const pathData = ICON_MAP[icon];
  const color = ICON_COLORS[icon] ?? '#c0a030';

  if (pathData) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ verticalAlign: 'middle', flexShrink: 0, ...style }}
      >
        <path d={pathData} />
      </svg>
    );
  }

  const sym = FALLBACK_SYMBOLS[icon] ?? '◆';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.6}px`,
        color,
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
    >
      {sym}
    </span>
  );
}
