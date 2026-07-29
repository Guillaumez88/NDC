const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'supabase/functions/**'],
  },
  {
    // Scripts Node CommonJS exécutés en CI, hors bundle de l'app.
    files: ['scripts/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    rules: {
      // Contenu de l'app entièrement en français : l'apostrophe non échappée
      // est correcte et lisible en JSX/RN, cette règle héritée du web n'a pas
      // lieu d'être ici.
      'react/no-unescaped-entities': 'off',
      // Règle récente et trop stricte pour des patterns de synchronisation
      // légitimes (session Supabase, profil, chargement de données) : les cas
      // rencontrés ici sont volontaires, pas des anti-patterns.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];
