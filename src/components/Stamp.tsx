import { Text, View } from 'react-native';
import { colors, fonts } from '../theme';

/** A passport stamp: place, time, date, chapter. */
export function Stamp({ name, at, chapterLabel, faded }: { name: string; at?: number; chapterLabel: string; faded?: boolean }) {
  const d = at ? new Date(at) : undefined;
  const pad = (n: number) => String(n).padStart(2, '0');
  const time = d ? `${pad(d.getHours())}:${pad(d.getMinutes())} — ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : '—';
  const c = faded ? colors.locked : colors.stampRed;
  return (
    <View
      style={{
        borderWidth: 2,
        borderColor: c,
        borderRadius: 12,
        borderStyle: faded ? 'dashed' : 'solid',
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: 'center',
        transform: [{ rotate: faded ? '0deg' : '-3deg' }],
        backgroundColor: faded ? 'transparent' : 'rgba(163,59,43,0.05)',
        minWidth: 150,
      }}
    >
      <Text style={{ fontFamily: fonts.display, fontWeight: '700', color: c, fontSize: 14, textAlign: 'center' }}>{name.toUpperCase()}</Text>
      <Text style={{ color: c, fontSize: 11, marginTop: 3 }}>{time}</Text>
      <Text style={{ color: c, fontSize: 11, fontWeight: '600' }}>{chapterLabel}</Text>
    </View>
  );
}
