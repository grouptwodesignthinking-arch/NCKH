import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Icon } from '../../components/Icon';
import { Button, Card, Header, Photo, Screen, styles as ui } from '../../components/ui';
import { checkpointById, type CheckpointId } from '../../data/checkpoints';
import { directionsTo } from '../../data/wayfinding';
import { useT } from '../../i18n';
import { routeOf, useProgress } from '../../store/progress';
import { colors, radius } from '../../theme';

/** Offline wayfinding to the next checkpoint (concept §18–19). */
export default function Directions() {
  const { id } = useLocalSearchParams<{ id: CheckpointId }>();
  const c = checkpointById[id];
  const { t, tr } = useT();
  const journeyId = useProgress((s) => s.journeyId);
  if (!c) return null;
  const { from, steps } = directionsTo(routeOf(journeyId), c.id);

  return (
    <Screen>
      <Header title={t('directions')} subtitle={from ? t('fromPlace', { name: tr(from.name) }) : t('fromGate')} />

      <View style={{ backgroundColor: colors.oliveDark, borderRadius: radius.lg, padding: 20, alignItems: 'center', gap: 10 }}>
        <Svg width={90} height={110} viewBox="0 0 90 110">
          <Path d="M45 4 L82 50 H58 V106 H32 V50 H8 Z" fill={colors.paper} />
        </Svg>
        <Text style={{ color: colors.line, fontSize: 14 }}>{t('goStraight', { n: c.distanceM || 30 })}</Text>
        <Text style={[ui.h2, { color: colors.paper, textAlign: 'center' }]}>{tr(c.name)}</Text>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <Meta icon="walk" text={t('walk', { n: Math.max(1, c.walkMin) })} />
          <Meta icon="clock" text={t('experience', { n: c.expMin })} />
        </View>
      </View>

      <Card style={{ gap: 12 }}>
        {steps.map((step, i) => (
          <View key={i} style={[ui.row, { alignItems: 'flex-start' }]}>
            <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.olive, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 12 }}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={ui.body}>{tr(step.text)}</Text>
              {step.meters ? <Text style={ui.muted}>~{t('meters', { n: step.meters })}</Text> : null}
            </View>
          </View>
        ))}
        <Text style={[ui.muted, { fontStyle: 'italic' }]}>{t('sampleDirections')}</Text>
      </Card>

      <Card style={{ flexDirection: 'row', gap: 12, padding: 10, alignItems: 'center' }}>
        <Photo k={c.image} style={{ width: 72, height: 72, borderRadius: radius.sm }} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={ui.h3}>{tr(c.name)}</Text>
          <Text style={ui.muted}>
            <Text style={{ fontWeight: '700' }}>{t('accessibility')}: </Text>
            {tr(c.accessibility)}
          </Text>
        </View>
      </Card>

      <Text style={ui.muted}>{t('directionsOffline')}</Text>
      <Button label={t('arrived')} icon="pin" onPress={() => router.replace(`/chapter/${c.id}`)} />
    </Screen>
  );
}

function Meta({ icon, text }: { icon: 'walk' | 'clock'; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name={icon} size={16} color={colors.line} />
      <Text style={{ color: colors.line, fontSize: 13 }}>{text}</Text>
    </View>
  );
}
