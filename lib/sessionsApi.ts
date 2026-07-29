import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { Session, SessionType } from './types';

export type NouvelleSeance = {
  type: SessionType;
  sodo: boolean;
  dureeMinutes: number | null;
  dateHeure: Date;
  note: string | null;
};

function refSessions(uid: string) {
  return collection(db, 'users', uid, 'sessions');
}

// Fenêtre suffisante pour un usage personnel (mois courant, semaine, dernière
// séance) : les agrégations se calculent ensuite côté client, dans le fuseau
// horaire local de l'utilisateur.
export async function listerSeancesRecentes(limite = 500): Promise<Session[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];

  const q = query(refSessions(uid), orderBy('dateHeure', 'desc'), limit(limite));
  const snap = await getDocs(q);
  // Boolean() sur sodo : les séances enregistrées avant l'ajout de ce champ ne
  // le portent pas du tout, il vaut undefined à la lecture.
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...(data as Omit<Session, 'id' | 'sodo'>), sodo: Boolean(data.sodo) };
  });
}

export async function ajouterSeance(seance: NouvelleSeance): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Non connecté.');

  await addDoc(refSessions(uid), {
    type: seance.type,
    sodo: seance.sodo,
    dureeMinutes: seance.dureeMinutes,
    dateHeure: Timestamp.fromDate(seance.dateHeure),
    note: seance.note,
    creeLe: serverTimestamp(),
  });
}

export async function supprimerSeance(id: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Non connecté.');
  await deleteDoc(doc(db, 'users', uid, 'sessions', id));
}
