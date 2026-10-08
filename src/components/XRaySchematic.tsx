import { useT } from '../i18n';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

/** Underground "X-ray": a schematic cross-section of the tunnel levels (not to scale). */
export const zones: Record<string, { x: number; y: number; label: { vi: string; en: string } }> = {
  entrance: { x: 14, y: 40, label: { vi: 'Lối vào', en: 'Entrance' } },
  kitchen: { x: 34, y: 40, label: { vi: 'Bếp Hoàng Cầm', en: 'Kitchen' } },
  meeting: { x: 58, y: 60, label: { vi: 'Hầm hội họp', en: 'Meeting room' } },
  vent: { x: 78, y: 30, label: { vi: 'Lỗ thông hơi', en: 'Air vent' } },
  well: { x: 44, y: 80, label: { vi: 'Giếng nước', en: 'Well' } },
  clinic: { x: 74, y: 80, label: { vi: 'Hầm quân y', en: 'Field clinic' } },
  crater: { x: 90, y: 20, label: { vi: 'Hố bom', en: 'Crater' } },
};

export function XRaySchematic({ highlight, color = '#F2C46D', showLabels = true }: { highlight?: string; color?: string; showLabels?: boolean }) {
  const { lang } = useT();
  const tunnel = { stroke: color, strokeWidth: 2.2, strokeLinecap: 'round' as const, fill: 'none' };
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      {/* ground surface */}
      <Line x1={0} y1={20} x2={100} y2={20} stroke={color} strokeWidth={0.6} strokeDasharray="2 2" />
      <Path d="M84 20 Q90 28 96 20" stroke={color} strokeWidth={0.8} fill="none" />
      {/* levels */}
      {[40, 60, 80].map((y, i) => (
        <G key={y}>
          <Line x1={0} y1={y} x2={100} y2={y} stroke={color} strokeOpacity={0.18} strokeWidth={0.4} />
          <SvgText x={1} y={y - 1.5} fill={color} fontSize={3} opacity={0.8}>
            {['~3 m', '~6 m', '8–12 m'][i]}
          </SvgText>
        </G>
      ))}
      {/* tunnels */}
      <Path d="M14 20 L14 40 L58 40" {...tunnel} />
      <Path d="M48 40 L52 60 L88 60" {...tunnel} />
      <Path d="M30 60 L58 60" {...tunnel} />
      <Path d="M40 60 L44 80 L84 80" {...tunnel} />
      <Path d="M78 20 L72 40 L58 40" {...tunnel} strokeDasharray="1.5 1.5" />
      <Path d="M44 20 L44 80" {...tunnel} strokeWidth={1.2} />
      {/* kitchen smoke channel */}
      <Path d="M34 40 Q28 32 22 34 T10 24" stroke={color} strokeWidth={0.8} fill="none" strokeDasharray="1 1.2" />
      {/* chambers */}
      {Object.entries(zones).map(([k, z]) => {
        const on = k === highlight;
        return (
          <G key={k}>
            <Rect x={z.x - 4} y={z.y - 3} width={8} height={6} rx={2} fill={on ? color : '#00000066'} stroke={color} strokeWidth={on ? 1 : 0.6} />
            {on ? <Circle cx={z.x} cy={z.y} r={6} stroke={color} strokeWidth={0.6} fill="none" /> : null}
            {showLabels ? (
              <SvgText x={z.x} y={z.y + 7.5} fill={color} fontSize={on ? 3.6 : 3} fontWeight={on ? 'bold' : 'normal'} textAnchor="middle">
                {z.label[lang]}
              </SvgText>
            ) : null}
          </G>
        );
      })}
    </Svg>
  );
}
