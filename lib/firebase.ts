import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-expect-error — getReactNativePersistence existe à l'exécution (Metro résout la
// condition "react-native" du package @firebase/auth), mais le fichier de types que tsc
// consulte pour "firebase/auth" ne le déclare pas (limitation connue du SDK Firebase JS,
// même contournement que sur Suivi-de-poids).
import { initializeAuth, getReactNativePersistence, browserLocalPersistence, getAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Accès statiques (process.env.EXPO_PUBLIC_XXX littéral) requis : le plugin
// babel d'Expo ne peut inliner ces valeurs que s'il peut les repérer à la
// lecture du code, pas via un accès dynamique (process.env[cle]).
const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;

if (!apiKey || !authDomain || !projectId || !appId) {
  throw new Error(
    'Les variables EXPO_PUBLIC_FIREBASE_* sont requises (voir .env.example).'
  );
}

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Persistance de la session entre lancements : AsyncStorage en React Native
// (pas de localStorage natif), stockage navigateur sur web.
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: Platform.OS === 'web' ? browserLocalPersistence : getReactNativePersistence(AsyncStorage),
  });
} catch {
  // initializeAuth ne peut être appelé qu'une fois (Fast Refresh en dev) ;
  // on retombe sur l'instance déjà créée le cas échéant.
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
