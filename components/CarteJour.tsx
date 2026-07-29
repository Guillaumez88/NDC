import { StyleSheet, Text, View } from 'react-native';
import { COULEURS_TYPE } from '../lib/theme';
import type { Palette } from '../lib/theme';
import type { Session } from '../lib/types';

const LABEL_TYPE: Record<Session['type'], string> = {
  solo: 'Solo',
  duo: 'À deux',
  groupe: 'À plusieurs',
};

type Props = {
  seance: Session;
  couleurs: Palette;
};

export function CarteJour({ seance, couleurs: c }: Props) {
  const styles = creerStyles(c);
  const heure = seance.dateHeure.toDate().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const titre = LABEL_TYPE[seance.type] + (seance.ejaculatoire ? '' : ' · sans éjaculation');
  const meta = seance.dureeMinutes ? `${heure} · environ ${seance.dureeMinutes} min` : heure;

  return (
    <View style={styles.carte}>
      <View style={[styles.pointe, { backgroundColor: COULEURS_TYPE[seance.type] }]} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.titre}>{titre}</Text>
        <Text style={styles.meta}>{meta}</Text>
        {seance.note ? <Text style={styles.note}>« {seance.note} »</Text> : null}
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
      borderRadius: 24,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    pointe: { width: 12, height: 12, borderRadius: 6 },
    titre: { fontSize: 14.5, fontWeight: '600', color: c.ink },
    meta: { fontSize: 12.5, color: c.ink3, marginTop: 2 },
    note: { fontSize: 12.5, color: c.ink2, marginTop: 6, fontStyle: 'italic' },
  });
}
