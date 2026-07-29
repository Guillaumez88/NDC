import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Palette } from '../lib/theme';
import { COULEURS_TYPE } from '../lib/theme';
import type { Session } from '../lib/types';

const JOURS_SEMAINE = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

type Props = {
  annee: number;
  mois: number; // 0-11
  seancesParJour: Map<number, Session[]>;
  jourSelectionne: number;
  jourAujourdhui: number | null; // null si le mois affiché n'est pas le mois courant
  onSelectJour: (jour: number) => void;
  couleurs: Palette;
};

export function CalendrierMensuel({
  annee,
  mois,
  seancesParJour,
  jourSelectionne,
  jourAujourdhui,
  onSelectJour,
  couleurs: c,
}: Props) {
  const premierJourSemaine = new Date(annee, mois, 1).getDay(); // 0 = dimanche
  const decalage = (premierJourSemaine + 6) % 7; // lundi en première colonne
  const nbJours = new Date(annee, mois + 1, 0).getDate();

  const cellules: (number | null)[] = [
    ...Array(decalage).fill(null),
    ...Array.from({ length: nbJours }, (_, i) => i + 1),
  ];

  const styles = creerStyles(c);

  return (
    <View style={styles.carte}>
      <View style={styles.entetes}>
        {JOURS_SEMAINE.map((j, i) => (
          <Text key={i} style={styles.entete}>
            {j}
          </Text>
        ))}
      </View>
      <View style={styles.grille}>
        {cellules.map((jour, i) => {
          if (jour === null) return <View key={i} style={styles.cellule} />;

          const seances = seancesParJour.get(jour) ?? [];
          const estSelectionne = jour === jourSelectionne;
          const estAujourdhui = jour === jourAujourdhui;

          return (
            <View key={i} style={styles.cellule}>
              <Pressable
                onPress={() => onSelectJour(jour)}
                style={[
                  styles.jourBouton,
                  estSelectionne && { backgroundColor: c.accent, borderColor: c.accent },
                  !estSelectionne && estAujourdhui && { backgroundColor: c.accentSoft, borderColor: c.accentSoft },
                ]}
              >
                <Text style={[styles.jourTexte, estSelectionne && { color: '#FFF8F2' }]}>{jour}</Text>
                <View style={styles.pointsRangee}>
                  {seances.slice(0, 3).map((s, k) => (
                    <View key={k} style={[styles.pointJour, { backgroundColor: COULEURS_TYPE[s.type] }]} />
                  ))}
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function creerStyles(c: Palette) {
  return StyleSheet.create({
    carte: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: 30,
      padding: 16,
    },
    entetes: { flexDirection: 'row', marginBottom: 6 },
    entete: {
      flexBasis: '14.28%',
      textAlign: 'center',
      fontSize: 11,
      fontWeight: '700',
      color: c.ink3,
      paddingVertical: 4,
    },
    grille: { flexDirection: 'row', flexWrap: 'wrap' },
    cellule: { flexBasis: '14.28%', aspectRatio: 1, padding: 1.5 },
    jourBouton: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    jourTexte: { fontSize: 14, fontWeight: '600', color: c.ink },
    pointsRangee: { flexDirection: 'row', gap: 3, height: 6, alignItems: 'center' },
    pointJour: { width: 6, height: 6, borderRadius: 3 },
  });
}
