import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { Card, Photo, Screen, SectionTitle, styles as ui } from '../../components/ui';
import { specialStories } from '../../data/achievements';
import { checkpointById } from '../../data/checkpoints';
import { useT } from '../../i18n';
import { routeOf, useProgress } from '../../store/progress';
import { colors, radius } from '../../theme';

export default function Stories() {
  const { t, tr } = useT();
  const s = useProgress();
  const route = routeOf(s.journeyId);

  return (
    <Screen>
      <View>
        <Text style={ui.h2}>{t('storiesTitle')}</Text>
        <Text style={ui.muted}>{t('storiesSub')}</Text>
      </View>

      <SectionTitle>{t('specialStories')}</SectionTitle>
      {specialStories.map((st) => {
        const open = st.unlocked(s);
        return (
          <Card
            key={st.id}
            onPress={open ? () => router.push(`/story/${st.id}`) : undefined}
            style={{ padding: 0, overflow: 'hidden', opacity: open ? 1 : 0.7 }}
          >
            <Photo k={st.image} style={{ height: 140 }} badgePosition="top" />
            <View style={{ padding: 12, gap: 4 }}>
              <View style={ui.row}>
                {!open ? <Icon name="lock" size={16} color={colors.locked} /> : null}
                <Text style={ui.h3}>{tr(st.title)}</Text>
              </View>
              <Text style={ui.muted}>{tr(st.desc)}</Text>
              {!open ? <Text style={[ui.muted, { color: colors.ember, fontWeight: '600' }]}>{t('unlockRule', { rule: tr(st.rule) })}</Text> : null}
            </View>
          </Card>
        );
      })}

      <SectionTitle>{t('chapterStories')}</SectionTitle>
      {route.map((id, i) => {
        const c = checkpointById[id];
        const open = !!s.chapters[id];
        return (
          <Card
            key={id}
            onPress={open ? () => router.push(`/story/${id}`) : undefined}
            style={{ flexDirection: 'row', gap: 12, padding: 10, opacity: open ? 1 : 0.6 }}
          >
            <Photo k={c.image} badge={false} style={{ width: 72, height: 72, borderRadius: radius.sm }} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[ui.muted, { fontWeight: '700' }]}>{t('chapterN', { n: i + 1 })}</Text>
              <Text style={ui.h3}>{tr(c.story.title)}</Text>
              <Text style={ui.muted}>{open ? tr(c.story.narrator) : t('lockedStory')}</Text>
            </View>
            <View style={{ justifyContent: 'center' }}>
              <Icon name={open ? (s.storiesHeard.includes(id) ? 'check' : 'play') : 'lock'} color={open ? colors.olive : colors.locked} size={20} />
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
