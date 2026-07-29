import { useMemo } from 'react';
import type { Session } from '../lib/types';
import { indexPalier, palierPourJoursEcoules } from '../lib/moonPhases';

const NOMS_MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

const JOURS_SEMAINE = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function debutDeJournee(d: Date): Date {
  const copie = new Date(d);
  copie.setHours(0, 0, 0, 0);
  return copie;
}

function lundiDeLaSemaine(d: Date): Date {
  const jour = d.getDay(); // 0 = dimanche
  const decalage = (jour + 6) % 7; // nombre de jours depuis lundi
  const lundi = new Date(d);
  lundi.setDate(d.getDate() - decalage);
  return debutDeJournee(lundi);
}

function memeJour(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Objectif mensuel glissant (30 derniers jours, et non le mois calendaire) et
// objectif hebdomadaire (semaine calendaire en cours, lundi à dimanche).
export function useProgression(
  seances: Session[],
  objectifMensuel: number,
  objectifHebdomadaire: number
) {
  return useMemo(() => {
    const maintenant = new Date();
    const dates = seances.map((s) => s.dateHeure.toDate());

    // --- Objectif glissant 30 jours ---
    const debut30j = new Date(maintenant.getTime() - 30 * 86_400_000);
    const sur30Jours = seances.filter((s, i) => dates[i] >= debut30j && dates[i] <= maintenant);
    const rollingCount = sur30Jours.filter((s) => s.ejaculatoire).length;
    const objectif30 = Math.max(1, objectifMensuel);
    const ringPct = Math.min(100, Math.round((rollingCount / objectif30) * 100));
    const encourage =
      rollingCount >= objectif30
        ? 'Objectif atteint sur les 30 derniers jours. Continuez à votre rythme.'
        : `Encore ${objectif30 - rollingCount} pour atteindre votre objectif sur les 30 derniers jours.`;

    // --- Depuis la dernière fois (lune) ---
    const dansLePasse = dates.filter((d) => d.getTime() <= maintenant.getTime());
    const derniereTs = dansLePasse.length > 0 ? Math.max(...dansLePasse.map((d) => d.getTime())) : null;

    let elapsed = 'Aucune séance enregistrée';
    let joursEcoules = Infinity;
    if (derniereTs !== null) {
      const heuresEcoulees = (maintenant.getTime() - derniereTs) / 3_600_000;
      joursEcoules = Math.floor(heuresEcoulees / 24);
      if (heuresEcoulees < 1) {
        elapsed = 'quelques minutes';
      } else if (heuresEcoulees < 24) {
        const h = Math.round(heuresEcoulees);
        elapsed = `${h} ${h > 1 ? 'heures' : 'heure'}`;
      } else {
        elapsed = `${joursEcoules} ${joursEcoules > 1 ? 'jours' : 'jour'}`;
      }
    }
    const palier = palierPourJoursEcoules(joursEcoules);
    const palierIndex = indexPalier(palier);

    // --- Objectif hebdomadaire (semaine calendaire en cours) ---
    const lundi = lundiDeLaSemaine(maintenant);
    const semaineJours = Array.from({ length: 7 }, (_, i) => {
      const jourDate = new Date(lundi);
      jourDate.setDate(lundi.getDate() + i);
      const aSeance = dates.some((d) => memeJour(d, jourDate));
      return {
        label: JOURS_SEMAINE[i],
        date: jourDate,
        aSeance,
        estAujourdhui: memeJour(jourDate, maintenant),
      };
    });
    const semaineCount = seances.filter((s, i) => {
      const d = dates[i];
      return s.ejaculatoire && d >= lundi && d.getTime() <= maintenant.getTime();
    }).length;

    const monthLabel = `${NOMS_MOIS[maintenant.getMonth()].charAt(0).toUpperCase()}${NOMS_MOIS[maintenant.getMonth()].slice(1)} ${maintenant.getFullYear()}`;

    return {
      rollingCount,
      goal: objectif30,
      ringPct,
      encourage,
      elapsed,
      phaseLabel: palier.libelle,
      palierIndex,
      semaineJours,
      semaineCount,
      objectifHebdomadaire: Math.max(1, objectifHebdomadaire),
      monthLabel,
    };
  }, [seances, objectifMensuel, objectifHebdomadaire]);
}
