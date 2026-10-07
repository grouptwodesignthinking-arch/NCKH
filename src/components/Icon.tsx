import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

const paths = {
  back: 'M15 5l-7 7 7 7',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7',
  map: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
  book: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zM4 19a2 2 0 012-2h13',
  scan: 'M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M8 12h8',
  passport: 'M6 3h11a1 1 0 011 1v16a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1zM8 17h7',
  info: 'M12 11v6M12 7.5v.01',
  play: 'M8 5v14l11-7z',
  stop: 'M7 7h10v10H7z',
  lock: 'M7 11V8a5 5 0 0110 0v3M5 11h14v10H5z',
  layers: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5',
  cube: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12L4 7.5M12 12v9',
  vr: 'M3 8a2 2 0 012-2h14a2 2 0 012 2v7a2 2 0 01-2 2h-4l-2-3h-2l-2 3H5a2 2 0 01-2-2V8z',
  share: 'M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6',
  sound: 'M4 9v6h4l5 4V5L8 9H4zM16 9a4 4 0 010 6M18.5 6.5a7.5 7.5 0 010 11',
  pin: 'M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z',
  walk: 'M13 4.5a1.5 1.5 0 100 .01M10 21l2-6 3 3v3M9 12l2-4 4 1 2 4M12 15l-1-4',
  clock: 'M12 7v5l3 2',
  xray: 'M3 12h18M6 16h12M9 20h6M12 4v4',
  star: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z',
} as const;

export type IconName = keyof typeof paths;

const withCircle: IconName[] = ['info', 'clock'];

export function Icon({ name, size = 22, color = colors.ink, fill }: { name: IconName; size?: number; color?: string; fill?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {withCircle.includes(name) ? <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} /> : null}
      {name === 'passport' ? <Circle cx={11.5} cy={10} r={3} stroke={color} strokeWidth={1.8} /> : null}
      {name === 'vr' ? <Rect x={6} y={9} width={4} height={3} rx={1} fill={color} /> : null}
      <Path d={paths[name]} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill={fill || name === 'play' ? color : 'none'} />
    </Svg>
  );
}
