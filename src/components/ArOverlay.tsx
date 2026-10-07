import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import type { ArLayer } from '../data/checkpoints';

const GLOW = '#F2C46D';

/** Hand-drawn style AR layers placed over the camera frame (viewBox 0..100). */
export function ArOverlay({ layers, revealed }: { layers: ArLayer[]; revealed: number }) {
  const [pulse] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {layers.slice(0, revealed).map((l, i) => (
          <Shape key={i} shape={l.shape} />
        ))}
      </Svg>
    </Animated.View>
  );
}

function Shape({ shape }: { shape: ArLayer['shape'] }) {
  const s = { stroke: GLOW, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (shape) {
    case 'outline':
      return <Rect x={28} y={38} width={44} height={26} rx={2} {...s} strokeWidth={0.9} />;
    case 'structure':
      return (
        <>
          <Path d="M28 64 L36 78 L80 78 L72 64" {...s} strokeWidth={0.6} />
          <Line x1={36} y1={78} x2={36} y2={92} {...s} strokeWidth={0.5} />
          <Line x1={80} y1={78} x2={80} y2={92} {...s} strokeWidth={0.5} />
          <Line x1={36} y1={92} x2={80} y2={92} {...s} strokeWidth={0.5} strokeDasharray="1.5 1.5" />
          <Rect x={28} y={38} width={44} height={26} rx={2} fill={GLOW} fillOpacity={0.08} />
        </>
      );
    case 'motion':
      return (
        <>
          <Path d="M50 36 Q50 22 64 18" {...s} strokeWidth={0.8} strokeDasharray="2 1.5" />
          <Path d="M61 15 L65 18 L61 21" {...s} strokeWidth={0.8} />
          <Path d="M30 36 Q24 26 30 16 M70 36 Q76 26 70 16" {...s} strokeWidth={0.5} strokeOpacity={0.7} />
        </>
      );
    case 'path':
      return (
        <>
          <Path d="M50 64 L50 84 Q50 90 58 90 L96 90" {...s} strokeWidth={1.2} />
          <Circle cx={50} cy={84} r={1.6} fill={GLOW} />
          <Circle cx={96} cy={90} r={1.6} fill={GLOW} />
        </>
      );
    case 'people':
      return (
        <>
          {[38, 50, 62].map((x) => (
            <Path key={x} d={`M${x} 46 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M${x - 5} 62 Q${x} 50 ${x + 5} 62`} {...s} strokeWidth={0.7} />
          ))}
        </>
      );
  }
}
