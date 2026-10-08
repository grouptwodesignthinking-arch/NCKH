import { DeviceMotion } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { useNarration } from '../components/useNarration';
import { Chip, Header, MediaBadge, styles as ui } from '../components/ui';
import { media } from '../data/media';
import { useT, type L } from '../i18n';
import { colors, radius } from '../theme';

// The panorama is the interior illustration + its mirror, so it loops seamlessly.
const PANO_RATIO = 4472 / 900; // keep in sync with assets/images/vr-pano.jpg

const hotspots: { at: number; y: number; title: L; text: L }[] = [
  {
    at: 0.12,
    y: 0.45,
    title: { vi: 'Bếp Hoàng Cầm', en: 'Hoàng Cầm kitchen' },
    text: { vi: 'Bữa cơm được nấu từ khi trời còn sương, khói được dẫn đi thật xa.', en: 'Meals were cooked at misty dawn, the smoke led far away.' },
  },
  {
    at: 0.32,
    y: 0.35,
    title: { vi: 'Ngọn đèn dầu', en: 'The oil lamp' },
    text: { vi: 'Ánh sáng duy nhất dưới lòng đất — quý như nước và gạo.', en: 'The only light underground — as precious as water and rice.' },
  },
  {
    at: 0.62,
    y: 0.55,
    title: { vi: 'Sinh hoạt hằng ngày', en: 'Everyday life' },
    text: { vi: 'Ăn, ngủ, học, họp — tất cả diễn ra trong những căn hầm nhỏ.', en: 'Eating, sleeping, studying, meeting — all in small chambers.' },
  },
  {
    at: 0.84,
    y: 0.4,
    title: { vi: 'Lối đi địa đạo', en: 'Tunnel passage' },
    text: { vi: 'Những đường hầm hẹp, thấp, nối các khu với nhau.', en: 'Narrow, low passages linked the areas together.' },
  },
];

/** "Một ngày dưới lòng đất — 360°": drag (or tilt) to look around, tap hotspots. */
export default function VR() {
  const { t, tr } = useT();
  const { height: winH } = useWindowDimensions();
  const viewH = Math.min(520, winH * 0.55);
  const panoW = viewH * PANO_RATIO;
  const [offset, setOffset] = useState(0);
  const [gyro, setGyro] = useState(false);
  const [active, setActive] = useState<number>();
  const { speaking, play, stop } = useNarration();
  const look = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-4, 4])
    .onChange((e) => setOffset((o) => o - e.changeX));

  useEffect(() => {
    if (!gyro || Platform.OS === 'web') return;
    DeviceMotion.setUpdateInterval(50);
    const sub = DeviceMotion.addListener((m) => {
      const gamma = m.rotation?.gamma ?? 0;
      setOffset((o) => o + gamma * 12);
    });
    return () => sub.remove();
  }, [gyro]);

  const x = ((offset % panoW) + panoW) % panoW; // wrap
  const h = active !== undefined ? hotspots[active] : undefined;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.night }}>
      <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <Header dark title={t('vrTitle')} subtitle={t('vrSub')} />
        <GestureDetector gesture={look}>
          <View style={[styles.view, { height: viewH }]}>
            {[0, 1].map((i) => (
              <Image key={i} source={media.vrPano.source} style={{ position: 'absolute', top: 0, height: viewH, width: panoW, left: -x + i * panoW }} />
            ))}
            {hotspots.map((hs, i) =>
              [0, 1].map((rep) => (
                <Pressable
                  key={`${i}-${rep}`}
                  onPress={() => {
                    setActive(i);
                    stop();
                  }}
                  style={[
                    styles.hotspot,
                    { left: hs.at * panoW - x + rep * panoW - 18, top: hs.y * viewH - 18 },
                    active === i && { backgroundColor: colors.ember },
                  ]}
                >
                  <Icon name="info" size={20} color={colors.paper} />
                </Pressable>
              )),
            )}
            <MediaBadge k="vrPano" style={{ top: 8 }} />
          </View>
        </GestureDetector>

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {Platform.OS !== 'web' ? <Chip dark label={`${t('gyro')} ${gyro ? 'ON' : 'OFF'}`} active={gyro} onPress={() => setGyro((g) => !g)} /> : null}
          {hotspots.map((hs, i) => (
            <Chip key={i} dark label={tr(hs.title)} active={active === i} onPress={() => setActive(i)} />
          ))}
        </View>

        {h ? (
          <View style={styles.panel}>
            <Text style={[ui.h3, { color: colors.paper }]}>{tr(h.title)}</Text>
            <Text style={{ color: colors.line, lineHeight: 20 }}>{tr(h.text)}</Text>
            <Chip dark label={speaking ? t('stop') : `${t('voice')} ▶`} onPress={() => (speaking ? stop() : play(tr(h.text)))} />
          </View>
        ) : null}
        <Text style={{ color: colors.locked, fontSize: 11 }}>{t('reconstructionLabel')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  view: { width: '100%', borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#000' },
  hotspot: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 2,
    borderColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: { backgroundColor: colors.nightSoft, borderRadius: radius.md, padding: 14, gap: 8 },
});
