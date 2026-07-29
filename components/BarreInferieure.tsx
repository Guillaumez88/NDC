import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import type { Palette } from '../lib/theme';

type Onglet = 'accueil' | 'journal' | 'stats' | 'reglages';

const ONGLETS: {
  cle: Onglet;
  label: string;
  icone: keyof typeof Feather.glyphMap;
  href: '/' | '/tableau-de-bord' | '/stats' | '/parametres';
}[] = [
  { cle: 'accueil', label: 'Accueil', icone: 'home', href: '/' },
  { cle: 'journal', label: 'Journal', icone: 'book-open', href: '/tableau-de-bord' },
  { cle: 'stats', label: 'Stats', icone: 'bar-chart-2', href: '/stats' },
  { cle: 'reglages', label: 'Réglages', icone: 'settings', href: '/parametres' },
];

type Props = {
  actif: Onglet;
  couleurs: Palette;
  // Volontairement réservé à l'accueil : ailleurs, la barre n'affiche que les onglets.
  afficherAjout?: boolean;
};

export function BarreInferieure({ actif, couleurs: c, afficherAjout = false }: Props) {
  const router = useRouter();
  const styles = creerStyles(c);

  return (
    <View style={styles.conteneur} pointerEvents="box-none">
      {afficherAjout && (
        <View style={styles.boutonAjoutZone}>
          <Pressable style={styles.boutonAjout} onPress={() => router.push('/ajouter')}>
            <Feather name="plus" size={20} color="#FFF8F2" />
            <Text style={styles.boutonAjoutTexte}>J'ai éjac !</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.barre}>
        {ONGLETS.map((o) => {
          const estActif = o.cle === actif;
          return (
            <Pressable key={o.cle} style={styles.onglet} onPress={() => router.push(o.href)}>
              <Feather name={o.icone} size={20} color={estActif ? c.accent : c.ink3} />
              <Text style={[styles.ongletTexte, { color: estActif ? c.accent : c.ink3 }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function creerStyles(c: Palette) {
  return StyleSheet.create({
    conteneur: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
    },
    boutonAjoutZone: {
      paddingHorizontal: 22,
      paddingBottom: 12,
      alignItems: 'center',
    },
    boutonAjout: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 17,
      paddingHorizontal: 30,
      borderRadius: 30,
      backgroundColor: c.accent,
    },
    boutonAjoutTexte: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFF8F2',
    },
    barre: {
      backgroundColor: c.card,
      borderTopWidth: 1,
      borderTopColor: c.line,
      paddingTop: 12,
      paddingBottom: 26,
      paddingHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    onglet: {
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 2,
    },
    ongletTexte: {
      fontSize: 12,
      fontWeight: '600',
    },
  });
}
