import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Palette } from '../lib/theme';

type Props = {
  visible: boolean;
  titre: string;
  texteEtape1: string;
  texteEtape2: string;
  labelBoutonEtape1: string;
  labelBoutonEtape2: string;
  enCours?: boolean;
  onConfirmerEtape2: () => void;
  onAnnuler: () => void;
  couleurs: Palette;
};

export function ConfirmationDoubleModal({
  visible,
  titre,
  texteEtape1,
  texteEtape2,
  labelBoutonEtape1,
  labelBoutonEtape2,
  enCours,
  onConfirmerEtape2,
  onAnnuler,
  couleurs: c,
}: Props) {
  const [etape, setEtape] = useState<1 | 2>(1);
  const styles = creerStyles(c);

  function fermer() {
    setEtape(1);
    onAnnuler();
  }

  function surBoutonPrincipal() {
    if (etape === 1) {
      setEtape(2);
      return;
    }
    onConfirmerEtape2();
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={fermer}>
      <View style={styles.fond}>
        <View style={[styles.carte, etape === 2 && { borderColor: c.danger, backgroundColor: c.dangerBg }]}>
          <Text style={[styles.titre, etape === 2 && { color: c.danger }]}>{titre}</Text>
          <Text style={styles.description}>{etape === 1 ? texteEtape1 : texteEtape2}</Text>
          <Pressable
            style={[
              styles.boutonPrincipal,
              etape === 2 ? { backgroundColor: c.danger, borderColor: c.danger } : { borderColor: c.ink },
            ]}
            onPress={surBoutonPrincipal}
            disabled={enCours}
          >
            {enCours ? (
              <ActivityIndicator color={etape === 2 ? '#FFF6F3' : c.ink} />
            ) : (
              <Text style={[styles.boutonPrincipalTexte, etape === 2 && { color: '#FFF6F3' }]}>
                {etape === 1 ? labelBoutonEtape1 : labelBoutonEtape2}
              </Text>
            )}
          </Pressable>
          <Pressable style={styles.boutonAnnuler} onPress={fermer} disabled={enCours}>
            <Text style={styles.boutonAnnulerTexte}>
              {etape === 1 ? 'Annuler' : 'Non, garder mes données'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function creerStyles(c: Palette) {
  return StyleSheet.create({
    fond: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    carte: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: c.card,
      borderRadius: 28,
      borderWidth: 1.5,
      borderColor: c.line,
      padding: 22,
    },
    titre: { fontSize: 16, fontWeight: '700', color: c.ink },
    description: { fontSize: 13, color: c.ink2, marginTop: 8, lineHeight: 19 },
    boutonPrincipal: {
      marginTop: 18,
      paddingVertical: 15,
      borderRadius: 22,
      borderWidth: 1.5,
      alignItems: 'center',
    },
    boutonPrincipalTexte: { fontSize: 15, fontWeight: '700', color: c.ink },
    boutonAnnuler: { marginTop: 8, paddingVertical: 12, alignItems: 'center' },
    boutonAnnulerTexte: { fontSize: 14, fontWeight: '600', color: c.ink2 },
  });
}
