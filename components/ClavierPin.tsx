import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Palette } from '../lib/theme';

const RANGEES: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
];

type Props = {
  couleurs: Palette;
  onTouche: (touche: string) => void;
};

export function ClavierPin({ couleurs: c, onTouche }: Props) {
  const styles = creerStyles(c);
  return (
    <View style={styles.grille}>
      {RANGEES.map((rangee, i) => (
        <View key={i} style={styles.rangee}>
          {rangee.map((touche, j) =>
            touche === '' ? (
              <View key={j} style={styles.touche} />
            ) : (
              <Pressable
                key={j}
                onPress={() => onTouche(touche)}
                style={({ pressed }) => [
                  styles.touche,
                  styles.toucheActive,
                  pressed && { backgroundColor: c.accentSoft },
                ]}
              >
                <Text style={[styles.toucheTexte, touche === 'del' && styles.toucheTexteDel]}>
                  {touche === 'del' ? '⌫' : touche}
                </Text>
              </Pressable>
            )
          )}
        </View>
      ))}
    </View>
  );
}

function creerStyles(c: Palette) {
  return StyleSheet.create({
    grille: { gap: 16, marginTop: 14, alignItems: 'center' },
    rangee: { flexDirection: 'row', gap: 16 },
    touche: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toucheActive: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.line,
    },
    toucheTexte: {
      fontSize: 24,
      fontWeight: '600',
      color: c.ink,
    },
    toucheTexteDel: {
      fontSize: 18,
    },
  });
}
