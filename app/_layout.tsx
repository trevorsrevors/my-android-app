import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, SafeAreaView } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { useEffect } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Set up global error logging
    setupErrorLogging();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[commonStyles.wrapper, {
        paddingTop: Platform.OS === 'ios' ? insets.top : 0,
        paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
      }]}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'default',
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
