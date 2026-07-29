import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSessions } from '../../hooks/useSessions';
import { BarreInferieure } from '../../components/BarreInferieure';
import { COULEURS_TYPE } from '../../lib/theme';
import type { Session, SessionType } from '../../lib/types';

const JOURS_SEMAINE = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const LABEL_TYPE: Record<SessionType, string> = { solo: 'Solo', duo: 'À deux', groupe: 'À plusieurs' };

function moyenneDuree(seances: Session[], fenetreMs: number, maintenant: number): number | null {
  const debut = maintenant - fenetreMs;
  const avecDuree = seances.filter((s) => {
    const t = s.dateHeure.toDate().getTime();
    return t >= debut && t <= maintenant && s.dureeMinutes != null;
  });
  if (avecDuree.length === 0) return null;
  const somme = avecDuree.reduce((acc, s) => acc + (s.dureeMinutes ?? 0), 0);
  return Math.round(somme / avecDuree.length);
}

export default function Stats() {
  const { couleurs: c } = useTheme();
  const { seances } = useSessions();
  const styles = useMemo(() => creerStyles(c), [c]);

  const stats = useMemo(() => {
    const maintenant = new Date().getTime();
    const JOUR_MS = 86_400_000;

    const dureeSemaine = moyenneDuree(seances, 7 * JOUR_MS, maintenant);
    const dureeMois = moyenneDuree(seances, 30 * JOUR_MS, maintenant);
    const dureeAnnee = moyenneDuree(seances, 365 * JOUR_MS, maintenant);

    const comptageParJour = new Array(7).fill(0);
    for (const s of seances) {
      const jsDay = s.dateHeure.toDate().getDay(); // 0 = dimanche
      comptageParJour[(jsDay + 6) % 7] += 1;
    }
    const maxParJour = Math.max(1, ...comptageParJour);

    const repartition = (['solo', 'duo', 'groupe'] as SessionType[]).map((type) => ({
      type,
      label: LABEL_TYPE[type],
      couleur: COULEURS_TYPE[type],
      n: seances.filter((s) => s.type === type).length,
    }));

    return { dureeSemaine, dureeMois, dureeAnnee, comptageParJour, maxParJour, repartition };
  }, [seances]);
  const { dureeSemaine, dureeMois, dureeAnnee, comptageParJour, maxParJour, repartition } = stats;

  function formatDuree(min: number | null): string {
    return min === null ? '—' : `${min} min`;
  }

  return (
    <View style={styles.ecran}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.titre}>Stats</Text>

        <Text style={styles.sectionTitre}>Durée moyenne des séances</Text>
        <View style={styles.carte}>
          <View style={styles.dureeRangee}>
            <View style={styles.dureeColonne}>
              <Text style={styles.dureeValeur}>{formatDuree(dureeSemaine)}</Text>
              <Text style={styles.dureeLegende}>7 derniers jours</Text>
            </View>
            <View style={styles.dureeColonne}>
              <Text style={styles.dureeValeur}>{formatDuree(dureeMois)}</Text>
              <Text style={styles.dureeLegende}>30 derniers jours</Text>
            </View>
            <View style={styles.dureeColonne}>
              <Text style={styles.dureeValeur}>{formatDuree(dureeAnnee)}</Text>
              <Text style={styles.dureeLegende}>365 derniers jours</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitre}>Jour le plus actif</Text>
        <View style={styles.carte}>
          <View style={styles.barresRangee}>
            {comptageParJour.map((n, i) => {
              const estMax = n === maxParJour && n > 0;
              return (
                <View key={i} style={styles.barreColonne}>
                  <Text style={styles.barreChiffre}>{n}</Text>
                  <View style={styles.barreFond}>
                    <View
                      style={[
                        styles.barreRemplie,
                        {
                          height: `${Math.max(6, (n / maxParJour) * 100)}%`,
                          backgroundColor: estMax ? c.accent : c.accentSoft,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barreLabel, estMax && { color: c.accent, fontWeight: '700' }]}>
                    {JOURS_SEMAINE[i]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionTitre}>Répartition par type</Text>
        <View style={styles.carte}>
          {repartition.map((r) => (
            <View key={r.type} style={styles.repartitionLigne}>
              <View style={styles.repartitionGauche}>
                <View style={[styles.repartitionPoint, { backgroundColor: r.couleur }]} />
                <Text style={styles.repartitionLabel}>{r.label}</Text>
              </View>
              <Text style={styles.repartitionNombre}>{r.n}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <BarreInferieure actif="stats" couleurs={c} />
    </View>
  );
}

function creerStyles(c: ReturnType<typeof useTheme>['couleurs']) {
  return StyleSheet.create({
    ecran: { flex: 1, backgroundColor: c.bg },
    contenu: { padding: 22, paddingBottom: 120 },
    titre: { fontSize: 26, fontWeight: '700', color: c.ink, marginBottom: 20 },
    sectionTitre: {
      fontSize: 12.5,
      fontWeight: '700',
      color: c.ink3,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 18,
      marginBottom: 10,
    },
    carte: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: 28,
      padding: 20,
    },
    dureeRangee: { flexDirection: 'row', justifyContent: 'space-between' },
    dureeColonne: { alignItems: 'center', flex: 1 },
    dureeValeur: { fontSize: 22, fontWeight: '700', color: c.ink },
    dureeLegende: { fontSize: 11.5, color: c.ink3, marginTop: 4, textAlign: 'center' },
    barresRangee: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 130 },
    barreColonne: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
    barreChiffre: { fontSize: 11.5, color: c.ink3, marginBottom: 4 },
    barreFond: {
      width: 18,
      height: 70,
      borderRadius: 9,
      backgroundColor: c.card2,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    barreRemplie: { width: '100%', borderRadius: 9 },
    barreLabel: { fontSize: 12, color: c.ink3, marginTop: 8 },
    repartitionLigne: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 9,
    },
    repartitionGauche: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    repartitionPoint: { width: 11, height: 11, borderRadius: 6 },
    repartitionLabel: { fontSize: 14.5, color: c.ink },
    repartitionNombre: { fontSize: 15, fontWeight: '700', color: c.ink },
  });
}
