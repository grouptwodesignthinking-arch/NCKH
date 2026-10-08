import { router } from 'expo-router';
import { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { Icon, type IconName } from '../../components/Icon';
import { Button, Card, Chip, LangToggle, Screen, SectionTitle, styles as ui } from '../../components/ui';
import { checkpointById, type Checkpoint, type CheckpointId } from '../../data/checkpoints';
import { companionById } from '../../data/companions';
import { journeyById } from '../../data/journeys';
import { useT, type L } from '../../i18n';
import { routeOf, useProgress } from '../../store/progress';
import { colors } from '../../theme';

// Sample data for the prototype — confirm with the site management before use.
const facts: { icon: IconName; label: 'hoursLabel' | 'ticketLabel' | 'facilitiesLabel' | 'tipsLabel'; text: L }[] = [
  { icon: 'clock', label: 'hoursLabel', text: { vi: '7:00 – 17:00 hằng ngày', en: '7:00 – 17:00 daily' } },
  {
    icon: 'passport',
    label: 'ticketLabel',
    text: { vi: 'Xem giá vé cập nhật tại quầy hoặc website chính thức của khu di tích', en: 'Check current prices at the gate or the official site website' },
  },
  {
    icon: 'pin',
    label: 'facilitiesLabel',
    text: { vi: 'Nhà vệ sinh, nước uống, khu nghỉ chân, quầy ăn uống', en: 'Restrooms, drinking water, rest areas, food stalls' },
  },
  {
    icon: 'info',
    label: 'tipsLabel',
    text: {
      vi: 'Mang giày thoải mái, hạn chế mang vật sắc nhọn; một số đoạn hầm hẹp và thấp',
      en: 'Wear comfortable shoes; some tunnel sections are narrow and low',
    },
  },
];

const START_TIMES = [7 * 60 + 30, 9 * 60, 13 * 60 + 30, 15 * 60];
const REST_EVERY = 2;
const REST_MIN = 10;
const fmt = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

// Sample suggestions — confirm with the site and local tourism office.
const nearby: { icon: IconName; title: L; text: L }[] = [
  {
    icon: 'star',
    title: { vi: 'Đền tưởng niệm Bến Dược', en: 'Bến Dược Memorial Temple' },
    text: { vi: 'Nơi tưởng niệm các liệt sĩ, nằm trong khu di tích Bến Dược.', en: 'A memorial to fallen soldiers within the Bến Dược site.' },
  },
  {
    icon: 'pin',
    title: { vi: 'Ẩm thực địa phương', en: 'Local food' },
    text: { vi: 'Khoai mì luộc chấm muối mè — món ăn gắn với ký ức địa đạo.', en: 'Boiled cassava with sesame salt — a taste tied to tunnel memories.' },
  },
  {
    icon: 'book',
    title: { vi: 'Làng nghề vùng lân cận', en: 'Nearby craft villages' },
    text: { vi: 'Bánh tráng phơi sương (Trảng Bàng) và các nghề truyền thống quanh vùng.', en: 'Dew-dried rice paper (Trảng Bàng) and other local crafts.' },
  },
];

export default function Info() {
  const { t, tr } = useT();
  const s = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const [start, setStart] = useState(START_TIMES[1]);
  const route = routeOf(s.journeyId);

  // Timeline: walk → experience, with a short rest every couple of stops.
  const plan = route.reduce<{ id: CheckpointId; c: Checkpoint; arrive: number; leave: number; rest: boolean }[]>((acc, id, i) => {
    const c = checkpointById[id];
    const rest = i > 0 && i % REST_EVERY === 0;
    const prev = acc.length ? acc[acc.length - 1].leave : start;
    const arrive = prev + (rest ? REST_MIN : 0) + c.walkMin;
    return [...acc, { id, c, arrive, leave: arrive + c.expMin, rest }];
  }, []);
  const totalMin = (plan.length ? plan[plan.length - 1].leave : start) - start;

  return (
    <Screen>
      <Text style={ui.h2}>{t('infoTitle')}</Text>

      {facts.map((f) => (
        <Card key={f.label} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Icon name={f.icon} color={colors.olive} />
          <View style={{ flex: 1 }}>
            <Text style={[ui.muted, { fontWeight: '700' }]}>{t(f.label)}</Text>
            <Text style={ui.body}>{tr(f.text)}</Text>
          </View>
        </Card>
      ))}
      <Text style={[ui.muted, { fontStyle: 'italic' }]}>{t('infoDisclaimer')}</Text>

      <SectionTitle>{t('itinerary')}</SectionTitle>
      <Card style={{ gap: 10 }}>
        <Text style={ui.muted}>
          {tr(journeyById[s.journeyId ?? 'basic'].name)} · ~{t('minutes', { n: totalMin })}
        </Text>
        <View style={[ui.row, { flexWrap: 'wrap', gap: 6 }]}>
          <Text style={[ui.muted, { fontWeight: '700' }]}>{t('startTime')}:</Text>
          {START_TIMES.map((m) => (
            <Chip key={m} label={fmt(m)} active={start === m} onPress={() => setStart(m)} />
          ))}
        </View>
        {plan.map(({ id, c, arrive, rest }, i) => {
          return (
            <View key={id} style={{ gap: 8 }}>
              {rest ? (
                <Text style={[ui.muted, { marginLeft: 34, fontStyle: 'italic' }]}>
                  ☕ {t('restStop')} · {t('minutes', { n: REST_MIN })}
                </Text>
              ) : null}
              <View style={[ui.row, { alignItems: 'flex-start' }]}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: s.chapters[id] ? colors.olive : colors.line,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: colors.white, fontSize: 12, fontWeight: '700' }}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={ui.h3}>
                    <Text style={{ color: colors.ember }}>{fmt(arrive)}</Text> {tr(c.name)}
                  </Text>
                  <Text style={ui.muted}>
                    {t('walk', { n: c.walkMin })} · {t('experience', { n: c.expMin })} · {tr(c.accessibility)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
        <Text style={[ui.muted, { fontWeight: '700' }]}>{t('finishAround', { time: fmt(start + totalMin) })}</Text>
      </Card>

      <SectionTitle>{t('nearby')}</SectionTitle>
      {nearby.map((n) => (
        <Card key={n.title.vi} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Icon name={n.icon} color={colors.earth} />
          <View style={{ flex: 1 }}>
            <Text style={ui.h3}>{tr(n.title)}</Text>
            <Text style={ui.muted}>{tr(n.text)}</Text>
          </View>
        </Card>
      ))}
      <Text style={[ui.muted, { fontStyle: 'italic' }]}>{t('nearbyNote')}</Text>

      <SectionTitle>{t('journeyPack')}</SectionTitle>
      <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Icon name="check" color={colors.olive} />
        <Text style={[ui.body, { flex: 1 }]}>{t('journeyPackReady')}</Text>
      </Card>

      <SectionTitle>{t('language')}</SectionTitle>
      <LangToggle />

      <Card style={{ gap: 10 }}>
        <View style={[ui.row, { justifyContent: 'space-between' }]}>
          <Text style={ui.body}>
            {t('journey')}: <Text style={{ fontWeight: '700' }}>{tr(journeyById[s.journeyId ?? 'basic'].name)}</Text>
          </Text>
          <Chip label={t('change')} onPress={() => router.push('/journey')} />
        </View>
        <View style={[ui.row, { justifyContent: 'space-between' }]}>
          <Text style={ui.body}>
            {t('companion')}: <Text style={{ fontWeight: '700' }}>{s.companionId ? tr(companionById[s.companionId].name) : '—'}</Text>
          </Text>
          <Chip label={t('change')} onPress={() => router.push('/companion')} />
        </View>
        <View style={[ui.row, { justifyContent: 'space-between' }]}>
          <Text style={[ui.body, { flex: 1 }]}>{t('demoMode')}</Text>
          <Switch value={s.demoUnlockAll} onValueChange={s.setDemoUnlockAll} trackColor={{ true: colors.olive, false: colors.line }} />
        </View>
      </Card>

      <Button
        variant="ghost"
        label={confirmReset ? t('resetConfirm') : t('resetProgress')}
        onPress={() => {
          if (!confirmReset) return setConfirmReset(true);
          s.reset();
          setConfirmReset(false);
          router.replace('/');
        }}
      />
    </Screen>
  );
}
