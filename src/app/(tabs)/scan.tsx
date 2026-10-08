import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { Button, Card, Photo, Screen, styles as ui } from '../../components/ui';
import { checkpointById } from '../../data/checkpoints';
import { useT } from '../../i18n';
import { routeOf, statusOf, useProgress } from '../../store/progress';
import { colors, radius } from '../../theme';

/** Quick entry to AR at the checkpoint you are currently at. */
export default function ScanTab() {
  const { t, tr } = useT();
  const s = useProgress();
  const route = routeOf(s.journeyId);
  const open = route.filter((id) => statusOf(s, id) !== 'locked');
  const current = route.find((id) => statusOf(s, id) === 'open') ?? open[open.length - 1];
  const c = checkpointById[current];

  return (
    <Screen>
      <Text style={ui.h2}>{t('tabScan')}</Text>
      <View style={{ backgroundColor: colors.night, borderRadius: radius.lg, overflow: 'hidden' }}>
        <Photo k={c.arScene} style={{ height: 260 }} badgePosition="top" />
        <View style={{ padding: 16, gap: 10 }}>
          <Text style={{ color: colors.ember, fontWeight: '700' }}>{t('somethingHidden')}</Text>
          <Text style={[ui.h2, { color: colors.paper }]}>{tr(c.name)}</Text>
          <Text style={{ color: colors.line }}>{t('scanHint')}</Text>
          <Button variant="light" icon="scan" label={t('openAr')} onPress={() => router.push(`/ar/${c.id}`)} />
        </View>
      </View>
      {open
        .filter((id) => id !== c.id)
        .map((id) => {
          const o = checkpointById[id];
          return (
            <Card key={id} onPress={() => router.push(`/ar/${id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Photo k={o.image} badge={false} style={{ width: 48, height: 48, borderRadius: 8 }} />
              <Text style={[ui.h3, { flex: 1 }]}>{tr(o.name)}</Text>
              {s.arDone.includes(id) ? <Icon name="check" color={colors.olive} /> : <Icon name="scan" color={colors.olive} />}
            </Card>
          );
        })}
    </Screen>
  );
}
