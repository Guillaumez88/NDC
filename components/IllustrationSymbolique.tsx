import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PALIERS_LUNE } from '../lib/moonPhases';
import type { Palette } from '../lib/theme';

type Props = {
  palierIndex: number;
  couleurs: Palette;
};

// Reprend la technique du prototype : un cache circulaire (couleur de fond de
// la carte) glisse devant la lune pour simuler son éclairage, plutôt qu'un
// véritable dégradé de phase lunaire calculé.
export function IllustrationSymbolique({ palierIndex, couleurs: c }: Props) {
  const palier = PALIERS_LUNE[palierIndex] ?? PALIERS_LUNE[PALIERS_LUNE.length - 1];

  return (
    <View style={styles.conteneur}>
      <View
        style={[
          styles.halo,
          { backgroundColor: c.glow, opacity: palier.lueur * 0.55 },
        ]}
      />
      <View style={styles.lune}>
        <LinearGradient
          colors={['#F5CBA4', '#E2955F']}
          start={{ x: 0.15, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.cache,
            { backgroundColor: c.card, left: palier.decalage },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  lune: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: 'hidden',
  },
  cache: {
    position: 'absolute',
    top: -4,
    bottom: -4,
    width: 70,
    borderRadius: 35,
  },
});
