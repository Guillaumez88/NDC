// Stockage local du hash de PIN, jamais envoyé à Supabase. expo-secure-store
// (Keychain/Keystore) sur natif ; localStorage sur web, où secure-store n'existe
// pas (compromis assumé : c'est un verrou de confort face à un accès physique
// furtif à l'appareil, pas un secret cryptographique fort).
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export async function setItem(cle: string, valeur: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(cle, valeur);
    return;
  }
  await SecureStore.setItemAsync(cle, valeur);
}

export async function getItem(cle: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return window.localStorage.getItem(cle);
  }
  return SecureStore.getItemAsync(cle);
}

export async function deleteItem(cle: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem(cle);
    return;
  }
  await SecureStore.deleteItemAsync(cle);
}
