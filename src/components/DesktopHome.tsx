import { router, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type MediaKey } from '../data/media';
import { useT } from '../i18n';
import type { StringKey } from '../i18n/strings';
import { useProgress } from '../store/progress';
import { colors, fonts, radius } from '../theme';
import { Icon, type IconName } from './Icon';
import { Button, LangToggle, Photo } from './ui';

const nav: [StringKey, Href][] = [
  ['navExplore', '/map'],
  ['navStories', '/stories'],
  ['navAr', '/scan'],
  ['navPlan', '/info'],
];

const features: { title: StringKey; sub: StringKey; image: MediaKey; href: Href }[] = [
  { title: 'featureArTitle', sub: 'featureArSub', image: 'arKitchenGhost', href: '/scan' },
  { title: 'featureStoriesTitle', sub: 'featureStoriesSub', image: 'storyWitness', href: '/stories' },
  { title: 'feature3dTitle', sub: 'feature3dSub', image: 'arMeetingGhost', href: '/explorer' },
  { title: 'featurePlanTitle', sub: 'featurePlanSub', image: 'siteHatch', href: '/info' },
];

const flow: [IconName, StringKey][] = [
  ['map', 'flowLearn'],
  ['scan', 'flowAr'],
  ['book', 'flowListen'],
  ['star', 'flowKeep'],
];

/** Web landing for large screens: plan and explore before visiting (mockup "Web — lên kế hoạch"). */
export function DesktopHome() {
  const { t } = useT();
  const started = useProgress((s) => !!s.journeyId && !!s.companionId);
  const start = () => router.push(started ? '/map' : '/journey');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.night }} contentContainerStyle={styles.page}>
      <View style={styles.nav}>
        <View>
          <Text style={styles.logo}>CỦ CHI</Text>
          <Text style={styles.logoSub}>STORIES BENEATH</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 28, alignItems: 'center' }}>
          {nav.map(([k, href]) => (
            <Pressable key={k} onPress={() => router.push(href)}>
              <Text style={styles.navLink}>{t(k)}</Text>
            </Pressable>
          ))}
          <LangToggle dark />
        </View>
      </View>

      <View style={styles.hero}>
        <View style={{ flex: 1, gap: 18, justifyContent: 'center' }}>
          <Text style={styles.heroTitle}>{t('heroTitle')}</Text>
          <Text style={styles.heroSub}>{t('heroSub')}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button label={started ? t('continueJourney') : t('start')} icon="arrow" onPress={start} />
            <Button variant="light" label={t('explorer3d')} icon="cube" onPress={() => router.push('/explorer')} />
          </View>
          <Text style={styles.note}>{t('openOnPhone')}</Text>
        </View>
        <View style={{ flex: 1.1 }}>
          <Photo k="heroTunnel" style={styles.heroImg} badgePosition="top" />
          <Photo k="storyWitness" style={[styles.polaroid, { right: -10, top: 30, transform: [{ rotate: '4deg' }] }]} />
          <Photo k="archiveKitchen" style={[styles.polaroid, { left: -24, bottom: 20, transform: [{ rotate: '-5deg' }] }]} />
        </View>
      </View>

      <View style={styles.features}>
        {features.map((f) => (
          <Pressable key={f.title} onPress={() => router.push(f.href)} style={({ pressed }) => [styles.feature, pressed && { opacity: 0.85 }]}>
            <Photo k={f.image} style={{ height: 130, borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md }} />
            <View style={{ padding: 14, gap: 4 }}>
              <Text style={styles.featureTitle}>{t(f.title)}</Text>
              <Text style={styles.featureSub}>{t(f.sub)}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.flow}>
        {flow.map(([icon, k], i) => (
          <View key={k} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{ alignItems: 'center', gap: 8, flex: 1 }}>
              <Icon name={icon} size={34} color={colors.ember} />
              <Text style={styles.flowText}>{t(k)}</Text>
            </View>
            {i < flow.length - 1 ? <Icon name="arrow" size={22} color={colors.locked} /> : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 1240, alignSelf: 'center', padding: 32, gap: 40 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontFamily: fonts.display, color: colors.paper, fontSize: 26, fontWeight: '700', letterSpacing: 2 },
  logoSub: { color: colors.ember, fontSize: 10, letterSpacing: 3, fontWeight: '700' },
  navLink: { color: colors.paper, fontSize: 15, fontWeight: '600' },
  hero: { flexDirection: 'row', gap: 48, minHeight: 440 },
  heroTitle: { fontFamily: fonts.display, color: colors.paper, fontSize: 60, lineHeight: 66, fontWeight: '700' },
  heroSub: { color: colors.line, fontSize: 18, lineHeight: 27, maxWidth: 520 },
  note: { color: colors.locked, fontSize: 13, lineHeight: 19, maxWidth: 520 },
  heroImg: { flex: 1, minHeight: 420, borderRadius: radius.lg },
  polaroid: { position: 'absolute', width: 170, height: 130, borderRadius: 6, borderWidth: 6, borderColor: colors.paper },
  features: { flexDirection: 'row', gap: 16 },
  feature: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md },
  featureTitle: { fontFamily: fonts.display, fontSize: 17, fontWeight: '700', color: colors.ink },
  featureSub: { fontSize: 13, color: colors.inkSoft },
  flow: { flexDirection: 'row', paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.nightSoft, paddingTop: 28 },
  flowText: { color: colors.paper, fontSize: 14, textAlign: 'center', maxWidth: 180 },
});
