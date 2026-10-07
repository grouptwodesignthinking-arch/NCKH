import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { checkpointById, type CheckpointId } from '../data/checkpoints';
import { media } from '../data/media';
import { useT } from '../i18n';
import type { CheckpointStatus } from '../store/progress';
import { colors } from '../theme';
import { Icon } from './Icon';

const PIN = 54;
const ringColor: Record<CheckpointStatus, string> = { done: colors.olive, open: colors.ember, locked: colors.locked };

/** Illustrated "mission map": each location is a chapter on a route. */
export function MissionMap({
  route,
  statusOf,
  selected,
  onSelect,
}: {
  route: CheckpointId[];
  statusOf: (id: CheckpointId) => CheckpointStatus;
  selected?: CheckpointId;
  onSelect: (id: CheckpointId) => void;
}) {
  const { tr } = useT();
  const pts = route.map((id) => checkpointById[id].map);
  // Smooth path through the route points (viewBox 0..100).
  const d = pts
    .map((p, i) => {
      if (i === 0) return `M${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const cx = (prev.x + p.x) / 2 + (i % 2 ? 8 : -8);
      return `Q${cx} ${(prev.y + p.y) / 2} ${p.x} ${p.y}`;
    })
    .join(' ');

  return (
    <View style={styles.map}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        {/* forest patches */}
        <Ellipse cx={15} cy={45} rx={18} ry={14} fill="#C9CDA4" opacity={0.7} />
        <Ellipse cx={85} cy={20} rx={20} ry={14} fill="#C9CDA4" opacity={0.7} />
        <Ellipse cx={50} cy={92} rx={30} ry={10} fill="#C9CDA4" opacity={0.6} />
        <Ellipse cx={60} cy={45} rx={14} ry={10} fill="#D6D3B0" opacity={0.7} />
        <Path d="M0 8 Q30 2 55 10 T100 6" stroke="#B9C3C8" strokeWidth={2.5} fill="none" opacity={0.8} />
        <Path d={d} stroke={colors.earth} strokeWidth={0.9} strokeDasharray="2 1.6" fill="none" />
      </Svg>
      {route.map((id, i) => {
        const c = checkpointById[id];
        const st = statusOf(id);
        const isSel = selected === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityLabel={tr(c.name)}
            onPress={() => onSelect(id)}
            style={[styles.pinWrap, { left: `${c.map.x}%`, top: `${c.map.y}%` }]}
          >
            <View style={[styles.pin, { borderColor: ringColor[st] }, isSel && styles.pinSel]}>
              <Image source={media[c.image].source} style={[styles.pinImg, st === 'locked' && { opacity: 0.35 }]} />
              {st === 'locked' ? (
                <View style={styles.pinIcon}>
                  <Icon name="lock" size={18} color={colors.paper} />
                </View>
              ) : null}
            </View>
            <View style={[styles.num, { backgroundColor: ringColor[st] }]}>
              {st === 'done' ? <Icon name="check" size={11} color={colors.white} /> : <Text style={styles.numText}>{i + 1}</Text>}
            </View>
            <Text style={styles.label} numberOfLines={2}>
              {tr(c.name)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  map: { width: '100%', aspectRatio: 0.95, backgroundColor: '#E9DFC6', borderRadius: 18, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  pinWrap: { position: 'absolute', width: 96, marginLeft: -48, marginTop: -PIN / 2, alignItems: 'center' },
  pin: { width: PIN, height: PIN, borderRadius: PIN / 2, borderWidth: 3, overflow: 'hidden', backgroundColor: colors.night },
  pinSel: { transform: [{ scale: 1.15 }], borderWidth: 4 },
  pinImg: { width: '100%', height: '100%' },
  pinIcon: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  num: {
    position: 'absolute',
    top: -4,
    right: 18,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E9DFC6',
  },
  numText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  label: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
    backgroundColor: 'rgba(251,246,236,0.85)',
    paddingHorizontal: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
