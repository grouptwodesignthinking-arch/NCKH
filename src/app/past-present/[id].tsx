import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Icon } from '../../components/Icon';
import { Header, MediaBadge, Screen, styles as ui } from '../../components/ui';
import { checkpointById, type CheckpointId } from '../../data/checkpoints';
import { media } from '../../data/media';
import { useT } from '../../i18n';
import { colors, radius, fill } from '../../theme';

/** NOW ←──→ THEN: drag to wipe a reconstruction over the present-day view. */
export default function PastPresent() {
  const { id } = useLocalSearchParams<{ id: CheckpointId }>();
  const c = checkpointById[id];
  const { t, tr } = useT();
  const [width, setWidth] = useState(0);
  const [pos, setPos] = useState(0.5);
  const move = (x: number) => width && setPos(clamp(x / width));
  const drag = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-4, 4])
    .onBegin((e) => move(e.x))
    .onUpdate((e) => move(e.x));

  if (!c?.pastPresent) return null;
  const { now, then } = c.pastPresent;

  return (
    <Screen>
      <Header title={t('pastPresent')} subtitle={tr(c.name)} />
      <GestureDetector gesture={drag}>
        <View style={styles.frame} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          <Image source={media[now].source} style={fill} resizeMode="cover" />
          <View style={[styles.thenClip, { width: width * pos }, { pointerEvents: 'none' }]}>
            <Image source={media[then].source} style={{ width, height: '100%' }} resizeMode="cover" />
          </View>
          <View style={[styles.handleLine, { left: width * pos - 1 }, { pointerEvents: 'none' }]}>
            <View style={styles.handle}>
              <Icon name="back" size={14} color={colors.ink} />
              <View style={{ transform: [{ rotate: '180deg' }] }}>
                <Icon name="back" size={14} color={colors.ink} />
              </View>
            </View>
          </View>
          <View style={[styles.tag, { left: 10 }, { pointerEvents: 'none' }]}>
            <Text style={styles.tagText}>{t('then')}</Text>
          </View>
          <View style={[styles.tag, { right: 10 }, { pointerEvents: 'none' }]}>
            <Text style={styles.tagText}>{t('now')}</Text>
          </View>
        </View>
      </GestureDetector>
      <Text style={[ui.muted, { textAlign: 'center' }]}>{t('dragSlider')}</Text>
      <View style={{ gap: 6 }}>
        <View style={ui.row}>
          <MediaBadge k={then} style={{ position: 'relative', left: 0 }} />
          <Text style={ui.muted}>
            {t('then')}: {t('reconstructionLabel')}
          </Text>
        </View>
        <View style={ui.row}>
          <MediaBadge k={now} style={{ position: 'relative', left: 0 }} />
          <Text style={ui.muted}>
            {t('now')}: {tr(media[now].credit)}
          </Text>
        </View>
      </View>
      <Text style={ui.body}>{tr(c.understand)}</Text>
    </Screen>
  );
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));

const styles = StyleSheet.create({
  frame: { width: '100%', aspectRatio: 0.85, maxHeight: 560, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.night },
  thenClip: { position: 'absolute', left: 0, top: 0, bottom: 0, overflow: 'hidden' },
  handleLine: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.paper, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  tag: { position: 'absolute', bottom: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  tagText: { color: colors.paper, fontWeight: '700', fontSize: 12 },
});
