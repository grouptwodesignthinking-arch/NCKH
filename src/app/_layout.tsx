import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSyncExternalStore } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useProgress } from '../store/progress';
import { colors } from '../theme';

const subscribeHydration = (cb: () => void) => useProgress.persist.onFinishHydration(cb);
const isHydrated = () => useProgress.persist.hasHydrated();

/** Wait for saved progress to load from storage before showing screens. */
function useHydrated() {
  return useSyncExternalStore(subscribeHydration, isHydrated, isHydrated);
}

export default function RootLayout() {
  const hydrated = useHydrated();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        {hydrated ? (
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
            <Stack.Screen name="ar/[id]" options={{ animation: 'fade', contentStyle: { backgroundColor: colors.night } }} />
            <Stack.Screen name="vr" options={{ contentStyle: { backgroundColor: colors.night } }} />
          </Stack>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.night }}>
            <ActivityIndicator color={colors.ember} />
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
