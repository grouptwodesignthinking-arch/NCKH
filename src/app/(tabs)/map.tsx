import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { MissionMap } from '../../components/MissionMap';
import { Button, Card, Chip, Photo, ProgressBar, Screen, styles as ui } from '../../components/ui';
import { checkpointById, type CheckpointId } from '../../data/checkpoints';
import { companionById } from '../../data/companions';
import { journeyById } from '../../data/journeys';
import { matchesFilter, type MapFilter } from '../../data/wayfinding';
import { useT } from '../../i18n';
import { routeOf, statusOf, useProgress, type CheckpointStatus } from '../../store/progress';
import { colors } from '../../theme';

export default function MapScreen() {
  const { t, tr } = useT();
  const s = useProgress();
  const route = routeOf(s.journeyId);
  const status = (id: CheckpointId) => statusOf(s, id);
  const firstOpen = route.find((id) => status(id) === 'open') ?? route[0];
  const [selected, setSelected] = useState<CheckpointId>(firstOpen);
  const [filter, setFilter] = useState<MapFilter>('all');
  const sel = checkpointById[route.includes(selected) ? selected : firstOpen];
  const st = status(sel.id);
  const doneCount = route.filter((id) => s.chapters[id]).length;
  const journey = journeyById[s.journeyId ?? 'basic'];
  const companion = s.companionId ? companionById[s.companionId] : undefined;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={ui.h2}>{t('mapTitle')}</Text>
          <Text style={ui.muted}>
            {tr(journey.name)}
            {companion ? ` · ${tr(companion.name)}` : ''}
          </Text>
        </View>
        <Chip label={t('change')} onPress={() => router.push('/journey')} />
      </View>

      <View style={{ gap: 6 }}>
        <Text style={[ui.muted, { fontWeight: '600' }]}>{t('progressOf', { a: doneCount, b: route.length })}</Text>
        <ProgressBar value={doneCount / route.length} />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {FILTERS.map(([f, key]) => (
          <Chip key={f} label={t(key)} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>

      <MissionMap route={route} statusOf={status} selected={sel.id} onSelect={setSelected} dimmed={(id) => !matchesFilter(checkpointById[id], filter)} />

      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
        <Legend color={colors.olive} label={t('statusDone')} />
        <Legend color={colors.ember} label={t('statusOpen')} />
        <Legend color={colors.locked} label={t('statusLocked')} />
      </View>

      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Photo k={sel.image} style={{ width: 92, height: 92, borderRadius: 10 }} />
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[ui.muted, { color: colors.ember, fontWeight: '700' }]}>
              {t('chapterN', { n: route.indexOf(sel.id) + 1 })} · {statusLabel(t, st)}
            </Text>
            <Text style={ui.h3}>{tr(sel.name)}</Text>
            <Text style={ui.muted}>{tr(sel.subtitle)}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
          <Meta icon="pin" text={t('away', { n: sel.distanceM })} />
          <Meta icon="walk" text={t('walk', { n: sel.walkMin })} />
          <Meta icon="clock" text={t('experience', { n: sel.expMin })} />
        </View>
        <Text style={ui.muted}>
          <Text style={{ fontWeight: '700' }}>{t('accessibility')}: </Text>
          {tr(sel.accessibility)}
        </Text>
        {st === 'locked' ? (
          <Text style={[ui.muted, { fontStyle: 'italic' }]}>{t('lockedHint')}</Text>
        ) : (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              variant="ghost"
              label={t('directions')}
              icon="walk"
              onPress={() => router.push(`/directions/${sel.id}`)}
              style={{ flex: 1, paddingHorizontal: 10 }}
            />
            <Button
              label={st === 'done' ? t('replay') : t('begin')}
              icon="arrow"
              onPress={() => router.push(`/chapter/${sel.id}`)}
              style={{ flex: 1, paddingHorizontal: 10 }}
            />
          </View>
        )}
      </Card>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button variant="ghost" icon="cube" label={t('explorer3d')} onPress={() => router.push('/explorer')} style={{ flex: 1, paddingHorizontal: 10 }} />
        <Button variant="ghost" icon="vr" label={t('vr360')} onPress={() => router.push('/vr')} style={{ flex: 1, paddingHorizontal: 10 }} />
      </View>
      {doneCount > 0 ? <Button variant="ghost" icon="star" label={t('souvenir')} onPress={() => router.push('/souvenir')} /> : null}
    </Screen>
  );
}

const FILTERS = [
  ['all', 'filterAll'],
  ['underground', 'filterUnderground'],
  ['surface', 'filterSurface'],
  ['pastPresent', 'filterPastPresent'],
] as const satisfies readonly (readonly [MapFilter, Parameters<ReturnType<typeof useT>['t']>[0]])[];

function statusLabel(t: ReturnType<typeof useT>['t'], st: CheckpointStatus) {
  return st === 'done' ? t('statusDone') : st === 'open' ? t('statusOpen') : t('statusLocked');
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color }} />
      <Text style={ui.muted}>{label}</Text>
    </View>
  );
}

function Meta({ icon, text }: { icon: 'pin' | 'walk' | 'clock'; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name={icon} size={16} color={colors.inkSoft} />
      <Text style={ui.muted}>{text}</Text>
    </View>
  );
}
