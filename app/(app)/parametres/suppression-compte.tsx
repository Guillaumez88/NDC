import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { supprimerCompte } from '../../../lib/accountApi';
import { ConfirmationDoubleModal } from '../../../components/ConfirmationDoubleModal';

export default function SuppressionCompte() {
  const router = useRouter();
  const { couleurs: c } = useTheme();
  const styles = useMemo(() => creerStyles(c), [c]);
  const [modalOuverte, setModalOuverte] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function confirmerSuppression() {
    setEnCours(true);
    setErreur(null);
    try {
      await supprimerCompte();
      router.replace('/connexion');
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'La suppression a échoué.');
      setEnCours(false);
      setModalOuverte(false);
    }
  }

  return (
    <View style={styles.ecran}>
      <View style={styles.entete}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.retour}>‹ Réglages</Text>
        </Pressable>
      </View>

      <View style={styles.contenu}>
        <Text style={styles.titre}>Supprimer le compte et les données</Text>
        <Text style={styles.paragraphe}>
          Cette action efface définitivement votre profil et toutes vos séances enregistrées.
          Rien n'est conservé, par personne, et il n'existe aucun moyen de revenir en arrière
          une fois la suppression effectuée.
        </Text>
        <Text style={styles.paragraphe}>
          Si vous souhaitez seulement faire une pause, il n'est pas nécessaire de supprimer
          votre compte : vous pouvez simplement fermer l'application.
        </Text>

        {erreur && <Text style={styles.erreur}>{erreur}</Text>}

        <Pressable style={styles.boutonDanger} onPress={() => setModalOuverte(true)}>
          <Text style={styles.boutonDangerTexte}>Supprimer mon compte</Text>
        </Pressable>
      </View>

      <ConfirmationDoubleModal
        visible={modalOuverte}
        couleurs={c}
        titre="Supprimer le compte et les données"
        texteEtape1="Cette action est irréversible : toutes vos données sont effacées, sans copie ni sauvegarde possible."
        texteEtape2="Dernière étape. Toutes vos séances, vos notes et votre compte seront effacés. Rien ne peut être récupéré, par personne."
        labelBoutonEtape1="Supprimer mon compte"
        labelBoutonEtape2="Oui, tout supprimer définitivement"
        enCours={enCours}
        onConfirmerEtape2={confirmerSuppression}
        onAnnuler={() => setModalOuverte(false)}
      />
    </View>
  );
}

function creerStyles(c: ReturnType<typeof useTheme>['couleurs']) {
  return StyleSheet.create({
    ecran: { flex: 1, backgroundColor: c.bg },
    entete: { paddingTop: Platform.select({ web: 20, default: 60 }), paddingHorizontal: 22, paddingBottom: 8 },
    retour: { fontSize: 15, color: c.ink2, fontWeight: '600' },
    contenu: { padding: 22 },
    titre: { fontSize: 22, fontWeight: '700', color: c.ink, marginBottom: 14 },
    paragraphe: { fontSize: 14, color: c.ink2, lineHeight: 21, marginBottom: 14 },
    erreur: { color: c.danger, fontSize: 13, marginBottom: 10 },
    boutonDanger: {
      marginTop: 10,
      paddingVertical: 16,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: c.danger,
      alignItems: 'center',
    },
    boutonDangerTexte: { color: c.danger, fontSize: 15, fontWeight: '700' },
  });
}
