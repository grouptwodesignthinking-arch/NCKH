import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { Stamp } from '../../components/Stamp';
import { Button, Card, Chip, Photo, ProgressBar, Screen, styles as ui } from '../../components/ui';
import { achievements } from '../../data/achievements';
import { checkpointById } from '../../data/checkpoints';
import { companionById } from '../../data/companions';
import { useT } from '../../i18n';
import { routeOf, useProgress, xpOf, XP_PER_LEVEL } from '../../store/progress';
import { colors, fonts, radius } from '../../theme';

type Tab = 'fragments' | 'stamps' | 'achievements';

/** Memory Passport (concept §10–12). */
export default function Passport() {
  const { t, tr } = useT();
  const s = useProgress();
  const [tab, setTab] = useState<Tab>('fragments');
  const route = routeOf(s.journeyId);
  const xp = xpOf(s);
  const companion = s.companionId ? companionById[s.companionId] : undefined;
  const done = route.filter((id) => s.chapters[id]).length;

  return (
    <Screen>
      <View style={{ backgroundColor: colors.oliveDark, borderRadius: radius.lg, padding: 18, gap: 10 }}>
        <Text style={{ color: colors.line, letterSpacing: 2, fontSize: 12, fontWeight: '700' }}>CỦ CHI</Text>
        <Text style={{ fontFamily: fonts.display, color: colors.paper, fontSize: 26, fontWeight: '700' }}>{t('passportTitle')}</Text>
        <Text style={{ color: colors.line, fontStyle: 'italic' }}>{t('passportSub')}</Text>
        <View style={[ui.row, { marginTop: 4 }]}>
          {companion ? <Photo k={companion.image} badge={false} style={{ width: 44, height: 44, borderRadius: 22 }} /> : null}
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: colors.paper, fontWeight: '700' }}>
              {t('level', { n: Math.floor(xp / XP_PER_LEVEL) + 1 })} · {t('points', { n: xp })}
            </Text>
            <ProgressBar value={(xp % XP_PER_LEVEL) / XP_PER_LEVEL} track="rgba(255,255,255,0.2)" />
          </View>
        </View>
        <Text style={{ color: colors.line, fontSize: 13 }}>{t('progressOf', { a: done, b: route.length })}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip label={t('fragments')} active={tab === 'fragments'} onPress={() => setTab('fragments')} />
        <Chip label={t('stamps')} active={tab === 'stamps'} onPress={() => setTab('stamps')} />
        <Chip label={t('achievements')} active={tab === 'achievements'} onPress={() => setTab('achievements')} />
      </View>

      {tab === 'fragments' && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {route.map((id) => {
            const c = checkpointById[id];
            const got = !!s.chapters[id];
            return (
              <Card
                key={id}
                onPress={got ? () => router.push(`/story/${id}`) : undefined}
                style={{ width: '47%', flexGrow: 1, padding: 8, gap: 6, opacity: got ? 1 : 0.6 }}
              >
                {got ? (
                  <Photo k={c.fragment.media} style={{ height: 110, borderRadius: radius.sm }} />
                ) : (
                  <View style={{ height: 110, borderRadius: radius.sm, backgroundColor: colors.paperDeep, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="lock" color={colors.locked} size={28} />
                  </View>
                )}
                <Text style={[ui.h3, { fontSize: 14 }]}>{tr(c.fragment.title)}</Text>
                <Text style={ui.muted}>{got ? tr(c.fragment.caption) : t('notVisited')}</Text>
              </Card>
            );
          })}
        </View>
      )}

      {tab === 'stamps' && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', paddingVertical: 6 }}>
          {route.map((id, i) => (
            <Stamp
              key={id}
              name={tr(checkpointById[id].name)}
              at={s.chapters[id]?.completedAt}
              chapterLabel={s.chapters[id] ? t('chapterCompleted', { n: i + 1 }) : t('notVisited')}
              faded={!s.chapters[id]}
            />
          ))}
        </View>
      )}

      {tab === 'achievements' &&
        achievements.map((a) => {
          const got = a.earned(s);
          return (
            <Card key={a.id} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', opacity: got ? 1 : 0.55 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: got ? colors.ember : colors.paperDeep,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {got ? <Text style={{ fontSize: 24, color: colors.white }}>{a.symbol}</Text> : <Icon name="lock" color={colors.locked} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={ui.h3}>{tr(a.name)}</Text>
                <Text style={ui.muted}>{tr(a.desc)}</Text>
              </View>
            </Card>
          );
        })}

      {done > 0 ? <Button icon="star" label={t('souvenir')} onPress={() => router.push('/souvenir')} /> : null}
    </Screen>
  );
}
