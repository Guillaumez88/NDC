import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LockProvider } from '../contexts/LockContext';

function useEnregistrementServiceWorker() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/NDC/sw.js').catch(() => {
      // Fonctionnement en ligne toujours possible sans service worker.
    });
  }, []);
}

export default function RootLayout() {
  useEnregistrementServiceWorker();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <LockProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
          </LockProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
