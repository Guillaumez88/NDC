// Paliers de message et de niveau (logo "Série d'états") selon le nombre de
// jours pleins écoulés depuis la dernière séance éjaculatoire.
export type PalierNiveau = {
  seuilJours: number; // nombre de jours pleins écoulés couverts par ce palier
  libelle: string;
};

export const PALIERS: PalierNiveau[] = [
  { seuilJours: 0, libelle: "J'espère que t'as kiffé ta session d'aujourd'hui." },
  { seuilJours: 1, libelle: "C'était bon hier, on recommence ?" },
  { seuilJours: 2, libelle: "48h que tu ne t'es pas vidé frérot..." },
  { seuilJours: 3, libelle: 'Ça doit commencer à tirer dans les bouliches...' },
  { seuilJours: 4, libelle: 'Va falloir penser à faire la vidange là....' },
  { seuilJours: 5, libelle: "Attention, risque d'explosion !" },
  { seuilJours: Infinity, libelle: 'Tu as fait vœu d\'abstinence ?' },
];

export function palierPourJoursEcoules(joursEcoules: number): PalierNiveau {
  return PALIERS.find((p) => joursEcoules <= p.seuilJours) ?? PALIERS[PALIERS.length - 1];
}

export function indexPalier(palier: PalierNiveau): number {
  return PALIERS.indexOf(palier);
}
