import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArOverlay } from '../../components/ArOverlay';
import { FadeSlider } from '../../components/FadeSlider';
import { Icon } from '../../components/Icon';
import { XRaySchematic } from '../../components/XRaySchematic';
import { Button, Chip, MediaBadge } from '../../components/ui';
import { checkpointById, type CheckpointId } from '../../data/checkpoints';
import { media } from '../../data/media';
import { useT } from '../../i18n';
import { useProgress } from '../../store/progress';
import { colors, radius, fill } from '../../theme';

type Phase = 'aim' | 'scanning' | 'reveal';

/**
 * AR discovery: REAL SITE → DIGITAL LAYER → STORY.
 * The live camera shows the real place; layers are drawn on top of it.
 * Without a camera (or permission) the checkpoint illustration is used instead.
 */
export default function ArScreen() {
  const { id } = useLocalSearchParams<{ id: CheckpointId }>();
  const c = checkpointById[id];
  const { t, tr } = useT();
  const markAr = useProgress((s) => s.markAr);
  const [permission, requestPermission] = useCameraPermissions();
  const [useCamera, setUseCamera] = useState(true);
  const [phase, setPhase] = useState<Phase>('aim');
  const [revealed, setRevealed] = useState(0);
  const [xray, setXray] = useState(false);
  const [past, setPast] = useState(false);
  const [pastAmount, setPastAmount] = useState(0.6);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain && permission.status === 'undetermined') void requestPermission();
  }, [permission, requestPermission]);

  useEffect(() => {
    if (phase !== 'scanning') return;
    const timer = setTimeout(() => {
      setPhase('reveal');
      setRevealed(1);
      if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1600);
    return () => clearTimeout(timer);
  }, [phase]);

  if (!c) return null;
  const cameraOn = useCamera && permission?.granted;
  const allRevealed = revealed >= c.arLayers.length;
  const current = c.arLayers[Math.max(0, revealed - 1)];
  const showGhost = c.arGhost && c.arLayers.slice(0, revealed).some((l) => l.shape === 'structure' || l.shape === 'people');

  return (
    <View style={styles.root}>
      {cameraOn ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" onMountError={() => setUseCamera(false)} />
      ) : (
        <Image source={media[c.arScene].source} style={fill} resizeMode="cover" />
      )}

      {/* Past ⟷ Present: fade a historical reconstruction over the live view (concept §8) */}
      {past && c.pastPresent ? <Image source={media[c.pastPresent.then].source} style={[fill, { opacity: pastAmount }]} resizeMode="cover" /> : null}

      {/* the digital layer */}
      {phase === 'reveal' && showGhost && c.arGhost ? <Image source={media[c.arGhost].source} style={[styles.ghost]} resizeMode="cover" /> : null}
      {phase === 'reveal' ? <ArOverlay layers={c.arLayers} revealed={revealed} /> : null}
      {xray ? (
        <View style={styles.xray}>
          <XRaySchematic highlight={c.zone} />
        </View>
      ) : null}

      <SafeAreaView style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.round} accessibilityLabel={t('close')}>
            <Icon name="close" color={colors.paper} />
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={styles.arPill}>
              <Text style={styles.arPillText}>AR</Text>
            </View>
            {c.pastPresent ? (
              <Pressable
                onPress={() => setPast((v) => !v)}
                style={[styles.arPill, past && { backgroundColor: colors.ember }]}
                accessibilityRole="button"
                accessibilityLabel={t('thenOverlay')}
              >
                <Text style={styles.arPillText}>{t('then')}</Text>
              </Pressable>
            ) : null}
          </View>
          <Pressable onPress={() => setXray((v) => !v)} style={[styles.round, xray && { backgroundColor: colors.ember }]} accessibilityLabel={t('xray')}>
            <Icon name="xray" color={colors.paper} />
          </Pressable>
        </View>

        {!cameraOn ? (
          <View style={styles.notice}>
            <MediaBadge k={c.arScene} style={{ position: 'relative', left: 0, alignSelf: 'flex-start' }} />
            <Text style={styles.noticeText}>{t('cameraOff')}</Text>
            {useCamera && permission && !permission.granted && permission.canAskAgain ? (
              <Chip dark label={t('allowCamera')} onPress={() => void requestPermission()} />
            ) : null}
          </View>
        ) : null}

        {phase !== 'reveal' ? (
          <View style={styles.frameWrap} pointerEvents="none">
            <View style={styles.frame}>
              {(['tl', 'tr', 'bl', 'br'] as const).map((k) => (
                <View key={k} style={[styles.corner, cornerStyle[k]]} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.sheet}>
          {past && c.pastPresent ? (
            <View style={{ alignSelf: 'stretch', gap: 4 }}>
              <FadeSlider value={pastAmount} onChange={setPastAmount} left={t('now')} right={t('then')} />
              <Text style={styles.sheetSmall}>
                {t('thenOpacity')} · {t('reconstructionLabel')}
              </Text>
            </View>
          ) : null}
          {phase === 'aim' && (
            <>
              <Text style={styles.sheetTitle}>{t('somethingHidden')}</Text>
              <Text style={styles.sheetText}>{t('scanHint')}</Text>
              <Pressable onPress={() => setPhase('scanning')} style={styles.shutter} accessibilityRole="button" accessibilityLabel={t('openAr')}>
                <View style={styles.shutterInner} />
              </Pressable>
              {xray ? <Text style={styles.sheetText}>{t('xray')}</Text> : null}
            </>
          )}
          {phase === 'scanning' && <Text style={styles.sheetTitle}>{t('scanning')}</Text>}
          {phase === 'reveal' && current && (
            <>
              <Text style={styles.layerCount}>
                {revealed}/{c.arLayers.length}
              </Text>
              <Text style={styles.sheetTitle}>{tr(current.label)}</Text>
              <Text style={styles.sheetSmall}>{t('reconstructionLabel')}</Text>
              {allRevealed ? (
                <Button
                  variant="light"
                  label={t('finishAr')}
                  icon="check"
                  onPress={() => {
                    markAr(c.id);
                    router.back();
                  }}
                />
              ) : (
                <Button variant="light" label={t('tapToReveal')} icon="arrow" onPress={() => setRevealed((r) => r + 1)} />
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const cornerStyle = {
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  ghost: { position: 'absolute', left: '22%', width: '56%', top: '30%', height: '30%', opacity: 0.55, borderRadius: 8 },
  xray: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,16,10,0.6)', paddingTop: 120, paddingBottom: 240, paddingHorizontal: 8 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  round: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  arPill: { backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: radius.pill },
  arPillText: { color: colors.paper, fontWeight: '700', letterSpacing: 1 },
  notice: { marginHorizontal: 16, padding: 10, gap: 6, borderRadius: radius.sm, backgroundColor: 'rgba(0,0,0,0.5)' },
  noticeText: { color: colors.paper, fontSize: 12 },
  frameWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: { width: '70%', aspectRatio: 1, maxWidth: 360 },
  corner: { position: 'absolute', width: 34, height: 34, borderColor: colors.paper },
  sheet: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 24,
    backgroundColor: 'rgba(28,26,20,0.88)',
    borderRadius: radius.lg,
    padding: 18,
    gap: 10,
    alignItems: 'center',
    maxWidth: 560,
    alignSelf: 'center',
  },
  sheetTitle: { color: colors.paper, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  sheetText: { color: colors.line, fontSize: 13, textAlign: 'center' },
  sheetSmall: { color: colors.ember, fontSize: 11, textAlign: 'center' },
  layerCount: { color: colors.ember, fontWeight: '700' },
  shutter: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.paper },
});
