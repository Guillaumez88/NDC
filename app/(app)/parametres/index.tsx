import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLock } from '../../../contexts/LockContext';
import { updateObjectifMensuel, updateVerrouillageActif } from '../../../lib/profileApi';
import { ClavierPin } from '../../../components/ClavierPin';
import { BarreInferieure } from '../../../components/BarreInferieure';

type EtapeDefinitionPin = 'aucune' | 'saisie' | 'confirmation';

export default function Parametres() {
  const { profile, rafraichirProfil } = useAuth();
  const { themeName, couleurs: c, definirTheme } = useTheme();
  const { pinConfigure, definirPin } = useLock();
  const router = useRouter();
  const styles = useMemo(() => creerStyles(c), [c]);

  const [objectif, setObjectif] = useState(profile?.objectifMensuel ?? 21);
  const [etapePin, setEtapePin] = useState<EtapeDefinitionPin>('aucune');
  const [codeTemporaire, setCodeTemporaire] = useState('');
  const [codeSaisi, setCodeSaisi] = useState('');
  const [messagePin, setMessagePin] = useState('');

  const verrouillageActif = Boolean(profile?.verrouillageActif);

  async function surChangementObjectif(valeur: number) {
    setObjectif(valeur);
    await updateObjectifMensuel(valeur);
    await rafraichirProfil();
  }

  async function surToggleVerrouillage() {
    if (verrouillageActif) {
      await updateVerrouillageActif(false);
      await rafraichirProfil();
      return;
    }
    if (pinConfigure) {
      await updateVerrouillageActif(true);
      await rafraichirProfil();
      return;
    }
    setEtapePin('saisie');
    setCodeTemporaire('');
    setCodeSaisi('');
    setMessagePin('Choisissez un code à 4 chiffres.');
  }

  async function surToucheClavier(touche: string) {
    if (touche === 'del') {
      setCodeSaisi((v) => v.slice(0, -1));
      return;
    }
    const suivant = (codeSaisi + touche).slice(0, 4);
    setCodeSaisi(suivant);
    if (suivant.length !== 4) return;

    if (etapePin === 'saisie') {
      setCodeTemporaire(suivant);
      setCodeSaisi('');
      setEtapePin('confirmation');
      setMessagePin('Confirmez votre code.');
      return;
    }

    if (etapePin === 'confirmation') {
      if (suivant !== codeTemporaire) {
        setCodeSaisi('');
        setEtapePin('saisie');
        setMessagePin('Les codes ne correspondaient pas, recommencez.');
        return;
      }
      await definirPin(suivant);
      await updateVerrouillageActif(true);
      await rafraichirProfil();
      setEtapePin('aucune');
      setCodeSaisi('');
      setMessagePin('');
    }
  }

  function annulerDefinitionPin() {
    setEtapePin('aucune');
    setCodeSaisi('');
    setMessagePin('');
  }

  return (
    <View style={styles.ecran}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.titre}>Réglages</Text>

        <View style={styles.carte}>
          <View style={styles.ligneEntreBords}>
            <Text style={styles.libelle}>Objectif mensuel</Text>
            <Text style={styles.objectifValeur}>{objectif}</Text>
          </View>
          <Text style={styles.sousLibelle}>Repère Harvard : 21 par mois. À vous de l'ajuster.</Text>
          <Slider
            minimumValue={5}
            maximumValue={40}
            step={1}
            value={objectif}
            onSlidingComplete={surChangementObjectif}
            minimumTrackTintColor={c.accent}
            maximumTrackTintColor={c.line}
            thumbTintColor={c.accent}
            style={{ marginTop: 16 }}
          />
          <View style={styles.ligneEntreBords}>
            <Text style={styles.repereTexte}>5</Text>
            <Text style={styles.repereTexte}>21</Text>
            <Text style={styles.repereTexte}>40</Text>
          </View>
        </View>

        <View style={[styles.carte, { marginTop: 14 }]}>
          <View style={styles.ligneToggle}>
            <View style={{ flex: 1 }}>
              <Text style={styles.libelle}>Verrouillage à l'ouverture</Text>
              <Text style={styles.sousLibelle}>Code à 4 chiffres</Text>
            </View>
            <Pressable
              onPress={surToggleVerrouillage}
              style={[styles.toggleFond, { backgroundColor: verrouillageActif ? c.accent : c.line }]}
            >
              <View style={[styles.toggleBoule, { left: verrouillageActif ? 25 : 3 }]} />
            </Pressable>
          </View>

          {etapePin !== 'aucune' && (
            <View style={styles.blocDefinitionPin}>
              <Text style={styles.messagePin}>{messagePin}</Text>
              <View style={styles.pointsRangee}>
                {[0, 1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[styles.point, i < codeSaisi.length && { backgroundColor: c.accent }]}
                  />
                ))}
              </View>
              <ClavierPin couleurs={c} onTouche={surToucheClavier} />
              <Pressable onPress={annulerDefinitionPin} style={{ marginTop: 10 }}>
                <Text style={styles.annulerPin}>Annuler</Text>
              </Pressable>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitre}>Apparence</Text>
        <View style={styles.segmented}>
          {(['clair', 'sombre'] as const).map((t) => {
            const actif = t === themeName;
            return (
              <Pressable
                key={t}
                onPress={() => definirTheme(t)}
                style={[styles.segmentBtn, actif && { backgroundColor: c.card }]}
              >
                <Text style={[styles.segmentTexte, { color: actif ? c.accent : c.ink2 }]}>
                  {t === 'clair' ? 'Clair' : 'Sombre'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitre}>Compte</Text>
        <View style={styles.carte}>
          <View style={styles.ligneEntreBords}>
            <Text style={styles.compteLabel}>Pseudonyme</Text>
            <Text style={styles.compteValeur}>{profile?.pseudoAffichage}</Text>
          </View>
        </View>

        <View style={styles.zoneDanger}>
          <Text style={styles.zoneDangerTitre}>Supprimer le compte et les données</Text>
          <Text style={styles.zoneDangerTexte}>
            Cette action est irréversible : tout est effacé, sans copie ni sauvegarde.
          </Text>
          <Pressable
            style={styles.zoneDangerBouton}
            onPress={() => router.push('/parametres/suppression-compte')}
          >
            <Text style={styles.zoneDangerBoutonTexte}>Supprimer mon compte</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BarreInferieure actif="reglages" couleurs={c} />
    </View>
  );
}

function creerStyles(c: ReturnType<typeof useTheme>['couleurs']) {
  return StyleSheet.create({
    ecran: { flex: 1, backgroundColor: c.bg },
    contenu: { padding: 22, paddingBottom: 190 },
    titre: { fontSize: 26, fontWeight: '700', color: c.ink, marginBottom: 20 },
    carte: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: 28,
      padding: 20,
    },
    ligneEntreBords: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
    libelle: { fontSize: 15.5, fontWeight: '600', color: c.ink },
    sousLibelle: { fontSize: 12.5, color: c.ink3, marginTop: 4 },
    objectifValeur: { fontSize: 26, fontWeight: '700', color: c.accent },
    repereTexte: { fontSize: 11.5, color: c.ink3 },
    ligneToggle: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    toggleFond: { width: 54, height: 32, borderRadius: 16, justifyContent: 'center' },
    toggleBoule: { position: 'absolute', top: 3, width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff' },
    blocDefinitionPin: { marginTop: 18, alignItems: 'center' },
    messagePin: { fontSize: 12.5, color: c.ink2, marginBottom: 10, textAlign: 'center' },
    pointsRangee: { flexDirection: 'row', gap: 14 },
    point: {
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: c.accent,
      backgroundColor: 'transparent',
    },
    annulerPin: { fontSize: 13, color: c.ink2, fontWeight: '600' },
    sectionTitre: {
      fontSize: 12.5,
      fontWeight: '700',
      color: c.ink3,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 24,
      marginBottom: 10,
    },
    segmented: { flexDirection: 'row', gap: 10, backgroundColor: c.card2, borderRadius: 24, padding: 6 },
    segmentBtn: { flex: 1, paddingVertical: 14, borderRadius: 19, alignItems: 'center' },
    segmentTexte: { fontSize: 14, fontWeight: '600' },
    compteLabel: { fontSize: 14.5, color: c.ink2 },
    compteValeur: { fontSize: 15, fontWeight: '600', color: c.ink },
    zoneDanger: {
      marginTop: 24,
      borderWidth: 1.5,
      borderColor: c.danger,
      backgroundColor: c.dangerBg,
      borderRadius: 28,
      padding: 20,
    },
    zoneDangerTitre: { fontSize: 15.5, fontWeight: '700', color: c.danger },
    zoneDangerTexte: { fontSize: 12.5, color: c.ink2, marginTop: 6, lineHeight: 18 },
    zoneDangerBouton: {
      marginTop: 14,
      paddingVertical: 15,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: c.danger,
      alignItems: 'center',
    },
    zoneDangerBoutonTexte: { fontSize: 14.5, fontWeight: '700', color: c.danger },
  });
}
