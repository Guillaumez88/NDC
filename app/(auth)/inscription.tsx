import { Redirect } from 'expo-router';

// Écran unique partagé avec /connexion (bascule Connexion/Inscription en local,
// comme dans le prototype de référence) : cette route sert de point d'entrée
// direct/partageable vers le mode inscription.
export default function Inscription() {
  return <Redirect href={{ pathname: '/connexion', params: { mode: 'inscription' } }} />;
}
