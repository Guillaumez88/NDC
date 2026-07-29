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
  ejaculatoire: boolean;
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
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Session, 'id'>) }));
}

export async function ajouterSeance(seance: NouvelleSeance): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Non connecté.');

  await addDoc(refSessions(uid), {
    type: seance.type,
    ejaculatoire: seance.ejaculatoire,
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
