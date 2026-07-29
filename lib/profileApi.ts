import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { slugifyPseudo } from './pseudoUtils';
import type { Profile, Theme } from './types';

function refProfil(uid: string) {
  return doc(db, 'users', uid);
}

function refPseudo(slug: string) {
  return doc(db, 'pseudos', slug);
}

// Pré-check de disponibilité à l'inscription (lecture publique, cf. firestore.rules).
export async function pseudoDisponible(slug: string): Promise<boolean> {
  const snap = await getDoc(refPseudo(slug));
  return !snap.exists();
}

// Le vrai filet de sécurité contre une double réservation concurrente n'est pas
// ce pré-check mais la règle Firestore elle-même : un document pseudos/{slug}
// existant ne peut plus jamais être réécrit ("allow update: if false"), donc ce
// setDoc échoue proprement si quelqu'un d'autre a pris le pseudo entre-temps.
export async function reserverPseudo(uid: string, slug: string): Promise<void> {
  await setDoc(refPseudo(slug), { uid, slug });
}

export async function creerProfil(
  uid: string,
  pseudoAffichage: string,
  pseudoSlug: string
): Promise<void> {
  await setDoc(refProfil(uid), {
    pseudoAffichage,
    pseudoSlug,
    objectifMensuel: 21,
    objectifHebdomadaire: 3,
    verrouillageActif: false,
    theme: 'clair',
    creeLe: serverTimestamp(),
  });
}

// Filet de rattrapage (pas de trigger serveur possible sans Cloud Function) :
// à appeler après connexion pour recréer un profil manquant si l'écriture
// initiale avait échoué juste après l'inscription. Le pseudo est retrouvé via
// displayName, renseigné sur le compte Auth au moment de l'inscription.
export async function assurerProfil(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const snap = await getDoc(refProfil(user.uid));
  if (snap.exists()) return;

  const pseudoAffichage = user.displayName ?? 'anonyme';
  const slug = slugifyPseudo(pseudoAffichage);
  try {
    await reserverPseudo(user.uid, slug);
  } catch {
    // Déjà réservé par cette même tentative précédente : sans conséquence.
  }
  await creerProfil(user.uid, pseudoAffichage, slug);
}

export async function getProfile(): Promise<Profile | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;
  const snap = await getDoc(refProfil(uid));
  if (!snap.exists()) return null;
  return { uid, ...(snap.data() as Omit<Profile, 'uid'>) };
}

export async function updateObjectifMensuel(objectif: number): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Non connecté.');
  await updateDoc(refProfil(uid), { objectifMensuel: objectif });
}

export async function updateObjectifHebdomadaire(objectif: number): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Non connecté.');
  await updateDoc(refProfil(uid), { objectifHebdomadaire: objectif });
}

export async function updateVerrouillageActif(actif: boolean): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Non connecté.');
  await updateDoc(refProfil(uid), { verrouillageActif: actif });
}

export async function updateTheme(theme: Theme): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Non connecté.');
  await updateDoc(refProfil(uid), { theme });
}
