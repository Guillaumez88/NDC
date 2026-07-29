import type { Timestamp } from 'firebase/firestore';

export type Theme = 'clair' | 'sombre';

export type Profile = {
  uid: string;
  pseudoAffichage: string;
  pseudoSlug: string;
  objectifMensuel: number;
  objectifHebdomadaire: number;
  verrouillageActif: boolean;
  theme: Theme;
  creeLe: Timestamp | null;
};

export type SessionType = 'solo' | 'duo' | 'groupe';

export type Session = {
  id: string;
  type: SessionType;
  sodo: boolean;
  dureeMinutes: number | null;
  dateHeure: Timestamp;
  note: string | null;
  creeLe: Timestamp | null;
};
