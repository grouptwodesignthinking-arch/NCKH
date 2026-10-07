import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Card, Header, Photo, Screen, styles as ui } from '../components/ui';
import { Icon } from '../components/Icon';
import { companions } from '../data/companions';
import { useT } from '../i18n';
import { useProgress } from '../store/progress';
import { colors } from '../theme';

export default function ChooseCompanion() {
  const { t, tr } = useT();
  const current = useProgress((s) => s.companionId);
  const choose = useProgress((s) => s.chooseCompanion);

  return (
    <Screen>
      <Header title={t('chooseCompanionTitle')} subtitle={t('chooseCompanionSub')} />
      {companions.map((c) => (
        <Card
          key={c.id}
          onPress={() => {
            choose(c.id);
            router.replace('/map');
          }}
          style={[{ flexDirection: 'row', gap: 12, padding: 10 }, current === c.id && { borderColor: colors.olive, borderWidth: 2 }]}
        >
          <Photo k={c.image} badge={false} style={{ width: 80, height: 80, borderRadius: 10 }} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={ui.h3}>{tr(c.name)}</Text>
            <Text style={[ui.muted, { color: colors.olive, fontWeight: '600' }]}>{tr(c.line)}</Text>
            <Text style={ui.muted} numberOfLines={3}>
              “{tr(c.intro)}”
            </Text>
          </View>
          <View style={{ justifyContent: 'center' }}>
            <Icon name="arrow" color={colors.olive} />
          </View>
        </Card>
      ))}
      <Text style={[ui.muted, { fontStyle: 'italic' }]}>{t('companionNote')}</Text>
      <Text style={[ui.muted, { fontSize: 11 }]}>{tr({ vi: 'Ảnh chân dung: minh hoạ concept (AI).', en: 'Portraits: concept illustrations (AI).' })}</Text>
    </Screen>
  );
}
