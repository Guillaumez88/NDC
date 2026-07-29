// Paliers de l'illustration symbolique (lune) selon le temps écoulé depuis la
// dernière séance. Reprend les seuils et le ton du prototype de référence.
export type PalierLune = {
  seuilHeures: number;
  decalage: number; // position du cache de la lune (px), voir IllustrationSymbolique
  lueur: number; // opacité du halo, 0 à 1
  libelle: string;
};

export const PALIERS_LUNE: PalierLune[] = [
  { seuilHeures: 12, decalage: 92, lueur: 1, libelle: 'Lumière pleine, belle régularité.' },
  { seuilHeures: 36, decalage: 46, lueur: 0.8, libelle: 'Lumière haute, votre rythme est bien installé.' },
  { seuilHeures: 72, decalage: 24, lueur: 0.55, libelle: "Lumière douce. Rien d'urgent, juste un repère." },
  { seuilHeures: 120, decalage: 9, lueur: 0.3, libelle: 'La lumière décline doucement.' },
  { seuilHeures: Infinity, decalage: 0, lueur: 0.14, libelle: 'Nouvelle lune, un nouveau cycle commence quand vous voulez.' },
];

export function palierPourHeuresEcoulees(heures: number): PalierLune {
  return PALIERS_LUNE.find((p) => heures <= p.seuilHeures) ?? PALIERS_LUNE[PALIERS_LUNE.length - 1];
}

export function indexPalier(palier: PalierLune): number {
  return PALIERS_LUNE.indexOf(palier);
}
