// Paliers de l'illustration symbolique (lune) selon le nombre de jours pleins
// écoulés depuis la dernière séance éjaculatoire.
export type PalierLune = {
  seuilJours: number; // nombre de jours pleins écoulés couverts par ce palier
  decalage: number; // position du cache de la lune (px), voir IllustrationSymbolique
  lueur: number; // opacité du halo, 0 à 1
  libelle: string;
};

export const PALIERS_LUNE: PalierLune[] = [
  { seuilJours: 0, decalage: 95, lueur: 1, libelle: "J'espère que t'as kiffé ta session d'aujourd'hui." },
  { seuilJours: 1, decalage: 75, lueur: 0.88, libelle: "C'était bon hier, on recommence ?" },
  { seuilJours: 2, decalage: 55, lueur: 0.75, libelle: "48h que tu ne t'es pas vidé frérot..." },
  { seuilJours: 3, decalage: 38, lueur: 0.6, libelle: 'Ça doit commencer à tirer dans les bouliches...' },
  { seuilJours: 4, decalage: 24, lueur: 0.45, libelle: 'Va falloir penser à faire la vidange là....' },
  { seuilJours: 5, decalage: 12, lueur: 0.28, libelle: "Attention, risque d'explosion !" },
  { seuilJours: Infinity, decalage: 0, lueur: 0.12, libelle: 'Tu as fait vœu d\'abstinence ?' },
];

export function palierPourJoursEcoules(joursEcoules: number): PalierLune {
  return PALIERS_LUNE.find((p) => joursEcoules <= p.seuilJours) ?? PALIERS_LUNE[PALIERS_LUNE.length - 1];
}

export function indexPalier(palier: PalierLune): number {
  return PALIERS_LUNE.indexOf(palier);
}
