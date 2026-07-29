import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { Palette } from '../lib/theme';

type Props = {
  dateHeure: Date;
  onChange: (d: Date) => void;
  couleurs: Palette;
};

function formatDate(d: Date): string {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatHeure(d: Date): string {
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Implémentation native (iOS/Android) : @react-native-community/datetimepicker.
// Sur web, ChampDateHeure.web.tsx (inputs HTML natifs) est chargé à la place.
export function ChampDateHeure({ dateHeure, onChange, couleurs: c }: Props) {
  const [ouvert, setOuvert] = useState<'date' | 'heure' | null>(null);
  const styles = creerStyles(c);

  function surChangement(_: unknown, valeur?: Date) {
    if (Platform.OS === 'android') setOuvert(null);
    if (!valeur) return;
    const suivant = new Date(dateHeure);
    if (ouvert === 'date') {
      suivant.setFullYear(valeur.getFullYear(), valeur.getMonth(), valeur.getDate());
    } else {
      suivant.setHours(valeur.getHours(), valeur.getMinutes());
    }
    onChange(suivant);
  }

  return (
    <View style={styles.rangee}>
      <Pressable style={styles.champ} onPress={() => setOuvert('date')}>
        <Text style={styles.texte}>{formatDate(dateHeure)}</Text>
      </Pressable>
      <Pressable style={[styles.champ, styles.champHeure]} onPress={() => setOuvert('heure')}>
        <Text style={styles.texte}>{formatHeure(dateHeure)}</Text>
      </Pressable>

      {ouvert && Platform.OS === 'android' && (
        <DateTimePicker value={dateHeure} mode={ouvert === 'date' ? 'date' : 'time'} onChange={surChangement} />
      )}

      {ouvert && Platform.OS === 'ios' && (
        <Modal transparent animationType="fade">
          <View style={styles.modalFond}>
            <View style={styles.modalCarte}>
              <DateTimePicker
                value={dateHeure}
                mode={ouvert === 'date' ? 'date' : 'time'}
                display="spinner"
                onChange={surChangement}
              />
              <Pressable style={styles.modalBouton} onPress={() => setOuvert(null)}>
                <Text style={styles.modalBoutonTexte}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function creerStyles(c: Palette) {
  return StyleSheet.create({
    rangee: { flexDirection: 'row', gap: 10 },
    champ: {
      flex: 1,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: 20,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    champHeure: { flex: undefined, width: 118 },
    texte: { fontSize: 14, color: c.ink },
    modalFond: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    modalCarte: { backgroundColor: c.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16 },
    modalBouton: { alignItems: 'center', paddingVertical: 14 },
    modalBoutonTexte: { color: c.accent, fontWeight: '700', fontSize: 15 },
  });
}
