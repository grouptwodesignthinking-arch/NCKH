import { useState } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors } from '../theme';

/** Horizontal 0..1 slider with end labels (e.g. NOW ←→ THEN). */
export function FadeSlider({ value, onChange, left, right }: { value: number; onChange: (v: number) => void; left: string; right: string }) {
  const [width, setWidth] = useState(0);
  const move = (x: number) => width && onChange(Math.max(0, Math.min(1, x / width)));
  const drag = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .onBegin((e) => move(e.x))
    .onUpdate((e) => move(e.x));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'stretch' }}>
      <Text style={{ color: colors.paper, fontWeight: '700', fontSize: 12 }}>{left}</Text>
      <GestureDetector gesture={drag}>
        <View style={{ flex: 1, height: 32, justifyContent: 'center' }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' }}>
            <View style={{ height: 4, borderRadius: 2, width: `${value * 100}%`, backgroundColor: colors.ember }} />
          </View>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: Math.max(0, value * width - 12),
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: colors.paper,
              borderWidth: 3,
              borderColor: colors.ember,
            }}
          />
        </View>
      </GestureDetector>
      <Text style={{ color: colors.paper, fontWeight: '700', fontSize: 12 }}>{right}</Text>
    </View>
  );
}
