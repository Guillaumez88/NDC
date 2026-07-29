import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSessions } from '../../hooks/useSessions';
import { ChampDateHeure } from '../../components/ChampDateHeure';
import { getSeance } from '../../lib/sessionsApi';
import { COULEURS_TYPE } from '../../lib/theme';
import type { SessionType } from '../../lib/types';

const TYPES: { cle: SessionType; label: string }[] = [
  { cle: 'solo', label: 'Solo' },
  { cle: 'duo', label: 'À deux' },
  { cle: 'groupe', label: 'À plusieurs' },
];

const DUREES = [5, 10, 15, 30, 45, 60];

export default function Ajouter() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const modeModification = Boolean(id);
  const { couleurs: c } = useTheme();
  const { ajouter, modifier } = useSessions();
  const styles = useMemo(() => creerStyles(c), [c]);

  const [type, setType] = useState<SessionType>('solo');
  const [sodo, setSodo] = useState(false);
  const [duree, setDuree] = useState<number>(15);
  const [dateHeure, setDateHeure] = useState(new Date());
  const [note, setNote] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargementSeance, setChargementSeance] = useState(modeModification);

  useEffect(() => {
    if (!id) return;
    let annule = false;
    getSeance(id)
      .then((seance) => {
        if (annule) return;
        if (!seance) {
          setErreur("Cette séance n'existe plus.");
          return;
        }
        setType(seance.type);
        setSodo(seance.sodo);
        setDuree(seance.dureeMinutes ?? 15);
        setDateHeure(seance.dateHeure.toDate());
        setNote(seance.note ?? '');
      })
      .catch(() => {
        if (!annule) setErreur('Impossible de charger cette séance.');
      })
      .finally(() => {
        if (!annule) setChargementSeance(false);
      });
    return () => {
      annule = true;
    };
  }, [id]);

  async function enregistrer() {
    setErreur(null);
    setEnCours(true);
    try {
      const donnees = {
        type,
        sodo,
        dureeMinutes: duree,
        dateHeure,
        note: note.trim() ? note.trim() : null,
      };
      if (id) {
        await modifier(id, donnees);
      } else {
        await ajouter(donnees);
      }
      router.back();
    } catch {
      setErreur("L'enregistrement a échoué. Réessayez.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <View style={styles.ecran}>
      <View style={styles.entete}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.annuler}>Annuler</Text>
        </Pressable>
        <Text style={styles.titreEntete}>
          {modeModification ? 'Modifier la séance' : 'Nouvelle séance'}
        </Text>
        <View style={{ width: 56 }} />
      </View>

      {chargementSeance ? (
        <View style={styles.centre}>
          <ActivityIndicator color={c.accent} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.contenu}>
            <Text style={styles.sectionTitre}>Type</Text>
            <View style={styles.typesRangee}>
              {TYPES.map((t) => {
                const actif = t.cle === type;
                return (
                  <Pressable
                    key={t.cle}
                    onPress={() => setType(t.cle)}
                    style={[
                      styles.typeBtn,
                      {
                        backgroundColor: actif ? c.accentSoft : c.card,
                        borderColor: actif ? COULEURS_TYPE[t.cle] : c.line,
                      },
                    ]}
                  >
                    <View style={[styles.typePastille, { backgroundColor: COULEURS_TYPE[t.cle] }]} />
                    <Text style={styles.typeTexte}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.carteToggle}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitre}>Sodo</Text>
                <Text style={styles.toggleSousTitre}>Signalé dans le journal</Text>
              </View>
              <Pressable
                onPress={() => setSodo((v) => !v)}
                style={[styles.toggleFond, { backgroundColor: sodo ? c.accent : c.line }]}
              >
                <View style={[styles.toggleBoule, { left: sodo ? 25 : 3 }]} />
              </Pressable>
            </View>

            <Text style={styles.sectionTitre}>Durée approximative</Text>
            <View style={styles.dureesRangee}>
              {DUREES.map((d) => {
                const actif = d === duree;
                return (
                  <Pressable
                    key={d}
                    onPress={() => setDuree(d)}
                    style={[
                      styles.dureeBtn,
                      { backgroundColor: actif ? c.accent : c.card, borderColor: actif ? c.accent : c.line },
                    ]}
                  >
                    <Text style={[styles.dureeTexte, { color: actif ? '#FFF8F2' : c.ink }]}>
                      {d === 60 ? '60 min +' : `${d} min`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionTitre}>Quand</Text>
            <ChampDateHeure dateHeure={dateHeure} onChange={setDateHeure} couleurs={c} />

            <Text style={styles.sectionTitre}>Note (optionnel)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Un mot sur votre ressenti, votre énergie…"
              placeholderTextColor={c.ink3}
              multiline
              numberOfLines={3}
              style={styles.note}
            />
          </ScrollView>

          <View style={styles.pied}>
            {erreur && <Text style={styles.erreur}>{erreur}</Text>}
            <Pressable style={styles.boutonEnregistrer} onPress={enregistrer} disabled={enCours}>
              {enCours ? (
                <ActivityIndicator color="#FFF8F2" />
              ) : (
                <Text style={styles.boutonEnregistrerTexte}>Enregistrer</Text>
              )}
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

function creerStyles(c: ReturnType<typeof useTheme>['couleurs']) {
  return StyleSheet.create({
    ecran: { flex: 1, backgroundColor: c.bg },
    centre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    entete: {
      paddingTop: Platform.select({ web: 20, default: 60 }),
      paddingHorizontal: 22,
      paddingBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    annuler: { fontSize: 15, color: c.ink2, fontWeight: '600' },
    titreEntete: { fontSize: 17, fontWeight: '700', color: c.ink },
    contenu: { paddingHorizontal: 22, paddingBottom: 24 },
    sectionTitre: {
      fontSize: 12.5,
      fontWeight: '700',
      color: c.ink3,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 22,
      marginBottom: 10,
    },
    typesRangee: { flexDirection: 'row', gap: 10 },
    typeBtn: {
      flex: 1,
      borderRadius: 24,
      borderWidth: 1.5,
      paddingVertical: 18,
      alignItems: 'center',
      gap: 9,
    },
    typePastille: { width: 22, height: 22, borderRadius: 11 },
    typeTexte: { fontSize: 13.5, fontWeight: '600', color: c.ink },
    carteToggle: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: 26,
      padding: 16,
      marginTop: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    toggleTitre: { fontSize: 15, fontWeight: '600', color: c.ink },
    toggleSousTitre: { fontSize: 12.5, color: c.ink3, marginTop: 2 },
    toggleFond: { width: 54, height: 32, borderRadius: 16, justifyContent: 'center' },
    toggleBoule: {
      position: 'absolute',
      top: 3,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: '#fff',
    },
    dureesRangee: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
    dureeBtn: { borderRadius: 18, borderWidth: 1.5, paddingVertical: 11, paddingHorizontal: 16 },
    dureeTexte: { fontSize: 13.5, fontWeight: '600' },
    note: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: 22,
      padding: 16,
      fontSize: 14,
      color: c.ink,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    pied: { padding: 22, backgroundColor: c.bg },
    erreur: { color: c.danger, fontSize: 13, marginBottom: 10, textAlign: 'center' },
    boutonEnregistrer: {
      paddingVertical: 19,
      borderRadius: 26,
      backgroundColor: c.accent,
      alignItems: 'center',
    },
    boutonEnregistrerTexte: { color: '#FFF8F2', fontSize: 16.5, fontWeight: '700' },
  });
}
