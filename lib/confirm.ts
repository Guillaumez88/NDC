import { Alert, Platform } from 'react-native';

// Alert.alert de React Native ne fait rien sur web : react-native-web
// l'implémente comme un no-op (pas de window.confirm/alert). Repli explicite
// sur window.confirm pour cette plateforme.
export function confirmerAction(titre: string, message: string, onConfirmer: () => void): void {
  if (Platform.OS === 'web') {
    if (window.confirm(`${titre}\n\n${message}`)) {
      onConfirmer();
    }
    return;
  }
  Alert.alert(titre, message, [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Supprimer', style: 'destructive', onPress: onConfirmer },
  ]);
}
