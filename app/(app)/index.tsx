import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSessions } from '../../hooks/useSessions';
import { useProgression } from '../../hooks/useProgression';
import { JaugeCirculaire } from '../../components/JaugeCirculaire';
import { IllustrationSymbolique } from '../../components/IllustrationSymbolique';
import { SemaineCases } from '../../components/SemaineCases';
import { BarreInferieure } from '../../components/BarreInferieure';

function salutation(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Bonne nuit';
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export default function Accueil() {
  const { profile } = useAuth();
  const { themeName, couleurs: c, basculerTheme } = useTheme();
  const { seances, chargement } = useSessions();
  const progression = useProgression(
    seances,
    profile?.objectifMensuel ?? 21,
    profile?.objectifHebdomadaire ?? 3
  );
  const styles = useMemo(() => creerStyles(c), [c]);

  if (chargement && !profile) {
    return (
      <View style={[styles.ecran, styles.centre]}>
        <ActivityIndicator color={c.accent} />
      </View>
    );
  }

  return (
    <View style={styles.ecran}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.entete}>
          <View>
            <Text style={styles.titre}>{salutation()}</Text>
            <Text style={styles.sousTitreEntete}>{progression.monthLabel} · votre rythme</Text>
          </View>
          <Pressable style={styles.boutonTheme} onPress={basculerTheme}>
            <Text style={{ color: c.ink2 }}>{themeName === 'sombre' ? '☀' : '☾'}</Text>
          </Pressable>
        </View>

        <View style={styles.carte}>
          <JaugeCirculaire pourcentage={progression.ringPct} couleurs={c}>
            <View style={styles.jaugeCentre}>
              <Text style={styles.jaugeNombre}>{progression.rollingCount}</Text>
              <Text style={styles.jaugeLegende}>sur {progression.goal} (30 derniers jours)</Text>
              <Text style={styles.jaugeSousLegende}>{progression.ringPct}% de l'objectif</Text>
            </View>
          </JaugeCirculaire>
          <Text style={styles.encourage}>{progression.encourage}</Text>
        </View>

        <View style={[styles.carte, styles.carteDerniere]}>
          <IllustrationSymbolique palierIndex={progression.palierIndex} couleurs={c} />
          <View style={styles.derniereTexte}>
            <Text style={styles.derniereEtiquette}>Depuis ta dernière éjac</Text>
            <Text style={styles.derniereValeur}>{progression.elapsed}</Text>
            <Text style={styles.derniereLibelle}>{progression.phaseLabel}</Text>
          </View>
        </View>

        <View style={[styles.carte, styles.carteSemaine]}>
          <View style={styles.semaineEntete}>
            <Text style={styles.semaineTitre}>Cette semaine</Text>
            <Text style={styles.semaineChiffre}>
              {progression.semaineCount}/{progression.objectifHebdomadaire}
            </Text>
          </View>
          <SemaineCases jours={progression.semaineJours} couleurs={c} />
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTexte}>
            Le repère de 21 par mois vient d'une étude de Harvard (Rider et al., 2016). C'est
            une indication, pas une note.
          </Text>
        </View>
      </ScrollView>

      <BarreInferieure actif="accueil" couleurs={c} />
    </View>
  );
}

function creerStyles(c: ReturnType<typeof useTheme>['couleurs']) {
  return StyleSheet.create({
    ecran: { flex: 1, backgroundColor: c.bg },
    centre: { alignItems: 'center', justifyContent: 'center' },
    contenu: { padding: 22, paddingBottom: 190 },
    entete: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 26,
    },
    titre: { fontSize: 26, fontWeight: '700', color: c.ink, letterSpacing: -0.3 },
    sousTitreEntete: { fontSize: 14, color: c.ink2, marginTop: 3 },
    boutonTheme: {
      width: 42,
      height: 42,
      borderRadius: 21,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    carte: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: 34,
      padding: 24,
      alignItems: 'center',
    },
    jaugeCentre: { alignItems: 'center' },
    jaugeNombre: { fontSize: 56, fontWeight: '700', color: c.ink, letterSpacing: -1 },
    jaugeLegende: { fontSize: 15, fontWeight: '600', color: c.ink2, marginTop: 4 },
    jaugeSousLegende: { fontSize: 12.5, color: c.ink3, marginTop: 8 },
    encourage: { fontSize: 13.5, color: c.ink2, textAlign: 'center', marginTop: 14, maxWidth: 270 },
    carteDerniere: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      marginTop: 16,
      padding: 20,
    },
    derniereTexte: { flex: 1, minWidth: 0 },
    derniereEtiquette: {
      fontSize: 12.5,
      color: c.ink3,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    derniereValeur: { fontSize: 30, fontWeight: '700', color: c.ink, marginTop: 4 },
    derniereLibelle: { fontSize: 13, color: c.ink2, marginTop: 5 },
    carteSemaine: { alignItems: 'stretch', marginTop: 16, padding: 20 },
    semaineEntete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 },
    semaineTitre: { fontSize: 15, fontWeight: '600', color: c.ink },
    semaineChiffre: { fontSize: 15, fontWeight: '700', color: c.accent },
    disclaimer: {
      marginTop: 14,
      padding: 18,
      borderRadius: 26,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: c.line,
    },
    disclaimerTexte: { fontSize: 12.5, color: c.ink3, lineHeight: 18 },
  });
}
