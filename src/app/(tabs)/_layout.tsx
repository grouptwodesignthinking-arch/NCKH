import { Tabs } from 'expo-router/js-tabs';
import { View, type ColorValue } from 'react-native';
import { Icon, type IconName } from '../../components/Icon';
import { useT } from '../../i18n';
import { colors } from '../../theme';

function icon(name: IconName) {
  return function TabIcon({ color }: { color: ColorValue }) {
    return <Icon name={name} color={String(color)} size={22} />;
  };
}

export default function TabsLayout() {
  const { t } = useT();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.olive,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="map" options={{ title: t('tabMap'), tabBarIcon: icon('map') }} />
      <Tabs.Screen name="stories" options={{ title: t('tabStories'), tabBarIcon: icon('book') }} />
      <Tabs.Screen
        name="scan"
        options={{
          title: t('tabScan'),
          tabBarIcon: () => (
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: colors.olive,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: -14,
                borderWidth: 3,
                borderColor: colors.card,
              }}
            >
              <Icon name="scan" color={colors.paper} size={22} />
            </View>
          ),
        }}
      />
      <Tabs.Screen name="passport" options={{ title: t('tabPassport'), tabBarIcon: icon('passport') }} />
      <Tabs.Screen name="info" options={{ title: t('tabInfo'), tabBarIcon: icon('info') }} />
    </Tabs>
  );
}
