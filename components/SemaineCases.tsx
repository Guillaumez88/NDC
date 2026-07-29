import { StyleSheet, Text, View } from 'react-native';
import type { Palette } from '../lib/theme';

type JourSemaine = {
  label: string;
  aSeance: boolean;
  estAujourdhui: boolean;
};

type Props = {
  jours: JourSemaine[];
  couleurs: Palette;
};

export function SemaineCases({ jours, couleurs: c }: Props) {
  const styles = creerStyles(c);
  return (
    <View style={styles.rangee}>
      {jours.map((j, i) => (
        <View key={i} style={styles.colonne}>
          <View
            style={[
              styles.case,
              j.aSeance && { backgroundColor: c.accent },
              !j.aSeance && j.estAujourdhui && { borderColor: c.accent, borderWidth: 1.5 },
            ]}
          />
          <Text style={[styles.label, j.estAujourdhui && styles.labelAujourdhui]}>{j.label}</Text>
        </View>
      ))}
    </View>
  );
}

function creerStyles(c: Palette) {
  return StyleSheet.create({
    rangee: { flexDirection: 'row', justifyContent: 'space-between' },
    colonne: { alignItems: 'center', gap: 6 },
    case: {
      width: 30,
      height: 30,
      borderRadius: 10,
      backgroundColor: c.card2,
    },
    label: { fontSize: 11.5, color: c.ink3, fontWeight: '500' },
    labelAujourdhui: { fontSize: 13, color: c.accent, fontWeight: '800' },
  });
}
