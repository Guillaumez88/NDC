# NDC

Application de suivi personnel de bien-être, installable en PWA. Authentification par pseudonyme (sans email visible), compteur mensuel personnalisable, formulaire d'ajout de séance, tableau de bord avec calendrier mensuel, verrouillage par code PIN.

## Stack

- [Expo](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduction/) + `react-native-web` : code unique, exporté en site statique pour le web et compilable en natif iOS/Android.
- [Firebase](https://firebase.google.com) (Auth + Firestore), forfait **Spark** (gratuit) : aucune Cloud Function dans ce projet, tout se fait côté client (même approche que le projet Suivi-de-poids).
- Déploiement automatique sur GitHub Pages via GitHub Actions.

## Mise en route

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs Firebase (voir plus bas)
npm run web                  # ou: npm start
```

### 1. Créer le projet Firebase

1. Sur la [console Firebase](https://console.firebase.google.com), créer un **nouveau projet** dédié à NDC (ne pas réutiliser un projet existant : les données de cette app sont sensibles, elles doivent rester isolées).
2. **Authentication > Sign-in method** : activer le fournisseur **E-mail/Mot de passe**. (Pas besoin de désactiver une confirmation d'email : Firebase n'en exige pas par défaut.)
3. **Firestore Database** : créer une base, en **mode production**.
4. **Firestore Database > Règles** : coller le contenu de [`firestore.rules`](firestore.rules) et publier.
5. **Paramètres du projet > Vos applications** : ajouter une application **Web**, puis copier les valeurs de config dans `.env.local` :
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   EXPO_PUBLIC_FIREBASE_APP_ID=...
   ```
   Ces valeurs sont publiques par construction (inlinées dans le bundle JS) : la protection des données repose sur `firestore.rules`, jamais sur leur confidentialité. Il n'y a pas de clé secrète à protéger dans ce projet (pas de compte de service, pas de Cloud Function).

### 2. Configurer le dépôt GitHub pour le déploiement

Dans **Settings > Secrets and variables > Actions > Variables** du dépôt, ajouter les 6 mêmes variables `EXPO_PUBLIC_FIREBASE_*` que dans `.env.local`.

La source GitHub Pages du dépôt doit être réglée sur **GitHub Actions** (Settings > Pages). Chaque push sur `main` déclenche `.github/workflows/deploy.yml`, qui type-check, lint, exporte le site statique et publie sur Pages.

## Scripts

```bash
npm run web          # dev server web
npm start            # dev server (choix de la plateforme)
npm run typecheck
npm run lint
npm run export:web    # build statique dans dist/ (utilisé par la CI)
```

## Notes d'architecture

- **Pseudo sans email** : à l'inscription, un email interne (`<pseudo-slug>@ndc.invalid`) est généré et utilisé uniquement pour Firebase Auth ; l'utilisateur ne voit et ne saisit que son pseudonyme. Voir `lib/pseudoUtils.ts` et `contexts/AuthContext.tsx`.
- **Unicité du pseudo sans Cloud Function** : garantie par la collection `pseudos/{slug}` (le slug est l'identifiant du document) combinée à la règle Firestore `allow update: if false` — impossible de réécrire un pseudo déjà pris, même par son propriétaire. Voir `firestore.rules`.
- **Mot de passe oublié = compte irrécupérable** : assumé et annoncé explicitement à l'inscription, aucun mécanisme de récupération (l'email n'existe pas réellement).
- **Verrouillage PIN** : le code n'est jamais envoyé à Firebase, seul son hash est stocké localement sur l'appareil (`expo-secure-store` en natif, `localStorage` sur web). Voir `contexts/LockContext.tsx`.
- **Règles de sécurité** : chaque utilisateur ne peut lire/écrire que ses propres documents (`users/{uid}` et sa sous-collection `sessions`). La suppression de compte se fait entièrement côté client (`lib/accountApi.ts`) : purge Firestore pendant que l'utilisateur est encore authentifié, puis suppression du compte Auth lui-même — sans Cloud Function ni clé privilégiée.
- **PWA** : manifeste et icônes dans `public/`, service worker artisanal (`public/sw.js`) mettant en cache uniquement la coquille applicative (jamais les données Firestore).
