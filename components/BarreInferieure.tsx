import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Palette } from '../lib/theme';

type Onglet = 'accueil' | 'journal' | 'reglages';

const ONGLETS: { cle: Onglet; label: string; href: '/' | '/tableau-de-bord' | '/parametres' }[] = [
  { cle: 'accueil', label: 'Accueil', href: '/' },
  { cle: 'journal', label: 'Journal', href: '/tableau-de-bord' },
  { cle: 'reglages', label: 'Réglages', href: '/parametres' },
];

type Props = {
  actif: Onglet;
  couleurs: Palette;
};

export function BarreInferieure({ actif, couleurs: c }: Props) {
  const router = useRouter();
  const styles = creerStyles(c);

  return (
    <View style={styles.conteneur} pointerEvents="box-none">
      <View style={styles.boutonAjoutZone}>
        <Pressable style={styles.boutonAjout} onPress={() => router.push('/ajouter')}>
          <Text style={styles.boutonAjoutPlus}>+</Text>
          <Text style={styles.boutonAjoutTexte}>Ajouter une séance</Text>
        </Pressable>
      </View>
      <View style={styles.barre}>
        {ONGLETS.map((o) => {
          const estActif = o.cle === actif;
          return (
            <Pressable key={o.cle} style={styles.onglet} onPress={() => router.push(o.href)}>
              <View style={[styles.point, { backgroundColor: estActif ? c.accent : 'transparent' }]} />
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
    boutonAjoutPlus: {
      fontSize: 20,
      lineHeight: 20,
      color: '#FFF8F2',
      fontWeight: '700',
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
      paddingHorizontal: 22,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    onglet: {
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 14,
      paddingVertical: 2,
    },
    point: {
      width: 9,
      height: 9,
      borderRadius: 5,
    },
    ongletTexte: {
      fontSize: 12.5,
      fontWeight: '600',
    },
  });
}
