import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { Button, Chip, Header, Photo, Screen, styles as ui } from '../components/ui';
import { checkpointById, type CheckpointId } from '../data/checkpoints';
import { useT } from '../i18n';
import { routeOf, useProgress } from '../store/progress';
import { colors, fonts, radius } from '../theme';

/** Personalised final souvenir (concept §14–15). */
export default function Souvenir() {
  const { t, tr } = useT();
  const s = useProgress();
  const card = useRef<View>(null);
  const [msg, setMsg] = useState<string>();
  const done = (Object.keys(s.chapters) as CheckpointId[]).sort((a, b) => (s.chapters[a]!.completedAt ?? 0) - (s.chapters[b]!.completedAt ?? 0));

  if (!done.length) {
    return (
      <Screen>
        <Header title={t('souvenirTitle')} />
        <Text style={ui.body}>{t('souvenirEmpty')}</Text>
      </Screen>
    );
  }

  const favorite = s.favoriteStory && s.chapters[s.favoriteStory] ? s.favoriteStory : done[done.length - 1];
  const fav = checkpointById[favorite];
  const reflection = s.chapters[favorite]?.reflection ?? done.map((id) => s.chapters[id]?.reflection).find(Boolean);
  const stats = [
    { n: done.length, label: t('locationsExplored') },
    { n: s.storiesHeard.length, label: t('storiesDiscovered') },
    { n: s.arDone.length, label: t('arCompleted') },
    { n: done.length, label: t('fragmentsCollected') },
  ];

  const share = async () => {
    setMsg(undefined);
    try {
      if (Platform.OS === 'web' || !(await Sharing.isAvailableAsync())) throw new Error('unavailable');
      const uri = await captureRef(card, { format: 'png', quality: 1 });
      await Sharing.shareAsync(uri, { mimeType: 'image/png' });
    } catch {
      setMsg(t('shareUnavailable'));
    }
  };

  return (
    <Screen>
      <Header title={t('souvenir')} subtitle={`${done.length}/${routeOf(s.journeyId).length}`} />

      <View ref={card} collapsable={false} style={{ backgroundColor: colors.oliveDark, borderRadius: radius.lg, padding: 18, gap: 14 }}>
        <Text style={{ color: colors.ember, letterSpacing: 2, fontWeight: '700', fontSize: 12 }}>CỦ CHI STORIES</Text>
        <Text style={{ fontFamily: fonts.display, color: colors.paper, fontSize: 28, fontWeight: '700' }}>{t('souvenirTitle').toUpperCase()}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {stats.map((x) => (
            <View key={x.label} style={{ width: '47%', flexGrow: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.sm, padding: 10 }}>
              <Text style={{ color: colors.paper, fontSize: 26, fontWeight: '700' }}>{x.n}</Text>
              <Text style={{ color: colors.line, fontSize: 12 }}>{x.label}</Text>
            </View>
          ))}
        </View>
        <Photo k={fav.image} style={{ height: 170, borderRadius: radius.sm }} />
        <Text style={{ color: colors.line, fontSize: 13 }}>{t('stayedWithYou')}</Text>
        <Text style={{ fontFamily: fonts.display, color: colors.paper, fontSize: 22, fontWeight: '700' }}>→ {tr(fav.name)}</Text>
        {reflection ? (
          <View style={{ borderLeftWidth: 3, borderLeftColor: colors.ember, paddingLeft: 10 }}>
            <Text style={{ color: colors.line, fontSize: 12 }}>{t('yourWords')}</Text>
            <Text style={{ color: colors.paper, fontStyle: 'italic', fontSize: 16 }}>“{reflection}”</Text>
          </View>
        ) : null}
        <Text style={{ color: colors.locked, fontSize: 11 }}>#CuChiStories · {new Date().toLocaleDateString(s.lang === 'vi' ? 'vi-VN' : 'en-GB')}</Text>
      </View>

      <Text style={[ui.muted, { fontWeight: '700' }]}>{t('pickStory')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {done.map((id) => (
          <Chip key={id} label={tr(checkpointById[id].name)} active={id === favorite} onPress={() => s.setFavorite(id)} />
        ))}
      </View>
      <Button icon="share" label={t('share')} onPress={() => void share()} />
      {msg ? <Text style={[ui.muted, { textAlign: 'center' }]}>{msg}</Text> : null}
    </Screen>
  );
}
