import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, LangToggle, MediaBadge } from '../components/ui';
import { media } from '../data/media';
import { useT } from '../i18n';
import { useProgress } from '../store/progress';
import { colors, fonts, fill } from '../theme';

export default function Welcome() {
  const { t } = useT();
  const started = useProgress((s) => !!s.journeyId && !!s.companionId);

  return (
    <View style={styles.root}>
      <Image source={media.heroTunnel.source} style={fill} resizeMode="cover" />
      <View style={styles.shade} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <MediaBadge k="heroTunnel" style={{ position: 'relative', left: 0 }} />
          <LangToggle dark />
        </View>
        <View style={styles.bottom}>
          <Text style={styles.title}>CỦ CHI</Text>
          <Text style={styles.tagline}>{t('tagline').toUpperCase()}</Text>
          <Text style={styles.quote}>{t('welcomeQuote')}</Text>
          <Text style={styles.lead}>{t('welcomeLead')}</Text>
          <Button
            label={started ? t('continueJourney') : t('start')}
            icon="arrow"
            onPress={() => router.push(started ? '/map' : '/journey')}
            style={{ alignSelf: 'stretch' }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,16,10,0.55)' },
  safe: { flex: 1, padding: 20, justifyContent: 'space-between', width: '100%', maxWidth: 560, alignSelf: 'center' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bottom: { gap: 14, paddingBottom: 12 },
  title: { fontFamily: fonts.display, fontSize: 64, fontWeight: '700', color: colors.paper, textAlign: 'center', letterSpacing: 2 },
  tagline: { color: colors.paper, textAlign: 'center', letterSpacing: 3, fontSize: 14, fontWeight: '600' },
  quote: { color: colors.line, textAlign: 'center', fontStyle: 'italic', fontSize: 15, lineHeight: 22, marginTop: 8 },
  lead: { color: colors.ember, textAlign: 'center', fontSize: 14, fontWeight: '600', marginBottom: 8 },
});
