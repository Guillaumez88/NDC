import { useMemo } from 'react';
import type { Session } from '../lib/types';
import { indexPalier, palierPourHeuresEcoulees } from '../lib/moonPhases';

const NOMS_MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

function estMemeAnneeMois(date: Date, annee: number, mois: number) {
  return date.getFullYear() === annee && date.getMonth() === mois;
}

export function useMonthProgress(seances: Session[], objectifMensuel: number) {
  return useMemo(() => {
    const maintenant = new Date();
    const annee = maintenant.getFullYear();
    const mois = maintenant.getMonth();

    const duMois = seances.filter((s) => estMemeAnneeMois(s.dateHeure.toDate(), annee, mois));
    const monthCount = duMois.filter((s) => s.ejaculatoire).length;
    const objectif = Math.max(1, objectifMensuel);
    const ringPct = Math.min(100, Math.round((monthCount / objectif) * 100));

    const dansLePasse = seances
      .map((s) => s.dateHeure.toDate().getTime())
      .filter((t) => t <= maintenant.getTime());
    const derniereTs = dansLePasse.length > 0 ? Math.max(...dansLePasse) : null;

    let elapsed = 'Aucune séance enregistrée';
    let heuresEcoulees = Infinity;
    if (derniereTs !== null) {
      heuresEcoulees = (maintenant.getTime() - derniereTs) / 3_600_000;
      if (heuresEcoulees < 1) {
        elapsed = 'quelques minutes';
      } else if (heuresEcoulees < 24) {
        const h = Math.round(heuresEcoulees);
        elapsed = `${h} ${h > 1 ? 'heures' : 'heure'}`;
      } else {
        const j = Math.floor(heuresEcoulees / 24);
        elapsed = `${j} ${j > 1 ? 'jours' : 'jour'}`;
      }
    }

    const palier = palierPourHeuresEcoulees(heuresEcoulees);
    const palierIndex = indexPalier(palier);

    const debutSemaine = maintenant.getTime() - 7 * 86_400_000;
    const weekCount = seances.filter((s) => {
      const t = s.dateHeure.toDate().getTime();
      return t >= debutSemaine && t <= maintenant.getTime();
    }).length;

    const paceLabel = (duMois.length / (maintenant.getDate() / 7)).toFixed(1).replace('.', ',');

    const joursDansLeMois = new Date(annee, mois + 1, 0).getDate();
    const joursRestants = joursDansLeMois - maintenant.getDate() + 1;

    const encourage =
      monthCount >= objectif
        ? 'Objectif atteint ce mois-ci. Continuez à votre rythme.'
        : `Encore ${objectif - monthCount} pour toucher votre repère, sur ${joursRestants} jours restants.`;

    const monthLabel = `${NOMS_MOIS[mois].charAt(0).toUpperCase()}${NOMS_MOIS[mois].slice(1)} ${annee}`;

    return {
      monthLabel,
      monthCount,
      goal: objectif,
      ringPct,
      encourage,
      elapsed,
      phaseLabel: palier.libelle,
      palierIndex,
      weekCount,
      paceLabel,
    };
  }, [seances, objectifMensuel]);
}
