import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSessions } from '../../hooks/useSessions';
import { CalendrierMensuel } from '../../components/CalendrierMensuel';
import { CarteJour } from '../../components/CarteJour';
import { BarreInferieure } from '../../components/BarreInferieure';
import { COULEURS_TYPE } from '../../lib/theme';
import type { Session, SessionType } from '../../lib/types';

const NOMS_MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

const LABEL_TYPE: Record<SessionType, string> = { solo: 'Solo', duo: 'À deux', groupe: 'À plusieurs' };

export default function TableauDeBord() {
  const { couleurs: c } = useTheme();
  const { seances } = useSessions();
  const styles = useMemo(() => creerStyles(c), [c]);

  const maintenant = new Date();
  const [moisAffiche, setMoisAffiche] = useState(new Date(maintenant.getFullYear(), maintenant.getMonth(), 1));
  const [jourSelectionne, setJourSelectionne] = useState(maintenant.getDate());

  const annee = moisAffiche.getFullYear();
  const mois = moisAffiche.getMonth();
  const estMoisCourant = annee === maintenant.getFullYear() && mois === maintenant.getMonth();

  const duMois = useMemo(
    () =>
      seances.filter((s) => {
        const d = s.dateHeure.toDate();
        return d.getFullYear() === annee && d.getMonth() === mois;
      }),
    [seances, annee, mois]
  );

  const seancesParJour = useMemo(() => {
    const map = new Map<number, Session[]>();
    for (const s of duMois) {
      const jour = s.dateHeure.toDate().getDate();
      const liste = map.get(jour) ?? [];
      liste.push(s);
      map.set(jour, liste);
    }
    return map;
  }, [duMois]);

  const repartition = (['solo', 'duo', 'groupe'] as SessionType[]).map((type) => ({
    type,
    label: LABEL_TYPE[type],
    couleur: COULEURS_TYPE[type],
    n: duMois.filter((s) => s.type === type).length,
  }));

  const seancesJour = (seancesParJour.get(jourSelectionne) ?? [])
    .slice()
    .sort((a, b) => a.dateHeure.toDate().getTime() - b.dateHeure.toDate().getTime());

  function changerMois(delta: number) {
    const suivant = new Date(annee, mois + delta, 1);
    setMoisAffiche(suivant);
    setJourSelectionne(1);
  }

  return (
    <View style={styles.ecran}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.titre}>Journal</Text>
        <View style={styles.moisRangee}>
          <Pressable onPress={() => changerMois(-1)} hitSlop={10}>
            <Text style={styles.chevron}>‹</Text>
          </Pressable>
          <Text style={styles.sousTitre}>
            {NOMS_MOIS[mois].charAt(0).toUpperCase() + NOMS_MOIS[mois].slice(1)} {annee}
          </Text>
          <Pressable onPress={() => changerMois(1)} hitSlop={10}>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <View style={styles.carteResume}>
          <View>
            <Text style={styles.resumeGrandChiffre}>{duMois.length}</Text>
            <Text style={styles.resumeLegende}>séances ce mois</Text>
          </View>
          <View style={styles.repartitionRangee}>
            {repartition.map((r) => (
              <View key={r.type} style={styles.repartitionItem}>
                <View style={[styles.repartitionPoint, { backgroundColor: r.couleur }]} />
                <Text style={styles.repartitionLabel}>{r.label}</Text>
                <Text style={styles.repartitionNombre}>{r.n}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
          <CalendrierMensuel
            annee={annee}
            mois={mois}
            seancesParJour={seancesParJour}
            jourSelectionne={jourSelectionne}
            jourAujourdhui={estMoisCourant ? maintenant.getDate() : null}
            onSelectJour={setJourSelectionne}
            couleurs={c}
          />
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={styles.detailTitre}>
            {jourSelectionne} {NOMS_MOIS[mois]}
          </Text>
          {seancesJour.length > 0 ? (
            <View style={{ gap: 10 }}>
              {seancesJour.map((s) => (
                <CarteJour key={s.id} seance={s} couleurs={c} />
              ))}
            </View>
          ) : (
            <View style={styles.videCarte}>
              <Text style={styles.videTexte}>Rien de noté ce jour-là. Tout va bien.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BarreInferieure actif="journal" couleurs={c} />
    </View>
  );
}

function creerStyles(c: ReturnType<typeof useTheme>['couleurs']) {
  return StyleSheet.create({
    ecran: { flex: 1, backgroundColor: c.bg },
    contenu: { padding: 22, paddingBottom: 190 },
    titre: { fontSize: 26, fontWeight: '700', color: c.ink },
    moisRangee: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20, marginTop: 4 },
    chevron: { fontSize: 20, color: c.ink2, paddingHorizontal: 4 },
    sousTitre: { fontSize: 14, color: c.ink2 },
    carteResume: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: 30,
      padding: 20,
    },
    resumeGrandChiffre: { fontSize: 36, fontWeight: '700', color: c.ink, lineHeight: 38 },
    resumeLegende: { fontSize: 12.5, color: c.ink2, marginTop: 2 },
    repartitionRangee: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 16 },
    repartitionItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    repartitionPoint: { width: 10, height: 10, borderRadius: 5 },
    repartitionLabel: { fontSize: 13, color: c.ink2 },
    repartitionNombre: { fontSize: 13, fontWeight: '700', color: c.ink },
    detailTitre: { fontSize: 16, fontWeight: '700', color: c.ink, marginBottom: 10 },
    videCarte: {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: c.line,
      borderRadius: 24,
      padding: 22,
      alignItems: 'center',
    },
    videTexte: { fontSize: 13, color: c.ink3 },
  });
}
