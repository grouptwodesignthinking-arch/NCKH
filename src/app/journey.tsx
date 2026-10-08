import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Card, Header, Photo, Screen, styles as ui } from '../components/ui';
import { Icon } from '../components/Icon';
import { journeys } from '../data/journeys';
import { useT } from '../i18n';
import { useProgress } from '../store/progress';
import { colors } from '../theme';

export default function ChooseJourney() {
  const { t, tr } = useT();
  const current = useProgress((s) => s.journeyId);
  const choose = useProgress((s) => s.chooseJourney);
  const hasCompanion = useProgress((s) => !!s.companionId);

  return (
    <Screen>
      <Header title={t('chooseJourneyTitle')} subtitle={t('chooseJourneySub')} />
      {journeys.map((j) => (
        <Card
          key={j.id}
          onPress={() => {
            choose(j.id);
            router.push(hasCompanion ? '/map' : '/companion');
          }}
          style={[{ flexDirection: 'row', gap: 12, padding: 10 }, current === j.id && { borderColor: colors.olive, borderWidth: 2 }]}
        >
          <Photo k={j.image} style={{ width: 96, height: 84, borderRadius: 10 }} />
          <View style={{ flex: 1, justifyContent: 'center', gap: 4 }}>
            <Text style={ui.h3}>{tr(j.name)}</Text>
            <Text style={ui.muted}>{tr(j.desc)}</Text>
            <Text style={[ui.muted, { color: colors.olive, fontWeight: '600' }]}>
              {tr(j.duration)} · {t('checkpoints', { n: j.route.length })}
            </Text>
          </View>
          <View style={{ justifyContent: 'center' }}>
            <Icon name="arrow" color={colors.olive} />
          </View>
        </Card>
      ))}
    </Screen>
  );
}
