import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
  onModifier?: (id: string) => void;
  onSupprimer?: (id: string) => void;
};

export function CarteJour({ seance, couleurs: c, onModifier, onSupprimer }: Props) {
  const styles = creerStyles(c);
  const heure = seance.dateHeure.toDate().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const titre = LABEL_TYPE[seance.type] + (seance.sodo ? ' · sodo' : '');
  const meta = seance.dureeMinutes ? `${heure} · environ ${seance.dureeMinutes} min` : heure;

  return (
    <View style={styles.carte}>
      <View style={[styles.pointe, { backgroundColor: COULEURS_TYPE[seance.type] }]} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.titre}>{titre}</Text>
        <Text style={styles.meta}>{meta}</Text>
        {seance.note ? <Text style={styles.note}>« {seance.note} »</Text> : null}
      </View>
      {onModifier && (
        <Pressable
          onPress={() => onModifier(seance.id)}
          hitSlop={10}
          style={styles.boutonAction}
          accessibilityLabel="Modifier cette séance"
        >
          <Feather name="edit-2" size={16} color={c.ink3} />
        </Pressable>
      )}
      {onSupprimer && (
        <Pressable
          onPress={() => onSupprimer(seance.id)}
          hitSlop={10}
          style={styles.boutonAction}
          accessibilityLabel="Supprimer cette séance"
        >
          <Feather name="trash-2" size={17} color={c.ink3} />
        </Pressable>
      )}
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
      gap: 10,
    },
    pointe: { width: 12, height: 12, borderRadius: 6 },
    titre: { fontSize: 14.5, fontWeight: '600', color: c.ink },
    meta: { fontSize: 12.5, color: c.ink3, marginTop: 2 },
    note: { fontSize: 12.5, color: c.ink2, marginTop: 6, fontStyle: 'italic' },
    boutonAction: { padding: 6 },
  });
}
