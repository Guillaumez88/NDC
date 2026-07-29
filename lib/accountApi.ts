import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  writeBatch,
  type DocumentReference,
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { auth, db } from './firebase';
import { getProfile } from './profileApi';

const TAILLE_LOT_MAX = 450; // marge sous la limite de 500 opérations par batch Firestore

// Pas de Cloud Function dans ce projet (ça imposerait le forfait payant
// Blaze) : la suppression se fait entièrement côté client, sur le même
// principe que Suivi-de-poids. Ordre important : effacer les données
// Firestore tant que l'utilisateur est encore authentifié (les règles
// exigent request.auth.uid == uid, qui ne serait plus vrai une fois le
// compte Auth supprimé), puis seulement le compte Auth lui-même.
export async function supprimerCompte(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Non connecté.');

  const profil = await getProfile();

  const refs: DocumentReference[] = [];
  const sessionsSnap = await getDocs(collection(db, 'users', user.uid, 'sessions'));
  sessionsSnap.forEach((d) => refs.push(d.ref));
  refs.push(doc(db, 'users', user.uid));

  for (let i = 0; i < refs.length; i += TAILLE_LOT_MAX) {
    const lot = writeBatch(db);
    for (const ref of refs.slice(i, i + TAILLE_LOT_MAX)) {
      lot.delete(ref);
    }
    await lot.commit();
  }

  if (profil?.pseudoSlug) {
    // Erreur non bloquante : le pseudo resterait juste réservé indéfiniment
    // dans le cas peu probable où cet appel échouerait après le batch ci-dessus.
    await deleteDoc(doc(db, 'pseudos', profil.pseudoSlug)).catch(() => {});
  }

  try {
    await deleteUser(user);
  } catch {
    throw new Error(
      "La suppression du compte a échoué : reconnectez-vous (déconnexion puis reconnexion) et réessayez."
    );
  }
}
