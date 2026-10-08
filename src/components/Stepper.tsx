import { Text, View } from 'react-native';
import { colors } from '../theme';

export function Stepper({ steps, index }: { steps: string[]; index: number }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {steps.map((s, i) => (
          <View key={s} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= index ? colors.ember : colors.line }} />
        ))}
      </View>
      <Text style={{ fontSize: 12, color: colors.inkSoft, fontWeight: '600' }}>
        {index + 1}/{steps.length} · {steps[index]}
      </Text>
    </View>
  );
}
