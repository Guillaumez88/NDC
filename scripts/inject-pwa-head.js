// app/+html.tsx n'a d'effet qu'en export web.output "static" (SSG par route).
// NDC utilise "single" (SPA) pour éviter le pré-rendu Node de GoTrue/AsyncStorage
// ("window is not defined"). Ce script complète donc dist/index.html après
// coup avec les balises PWA que le gabarit par défaut d'Expo n'inclut pas.
const fs = require('fs');
const path = require('path');

const distIndex = path.join(__dirname, '..', 'dist', 'index.html');

const BALISES = `
  <link rel="manifest" href="/NDC/manifest.json" />
  <link rel="apple-touch-icon" href="/NDC/icon-192.png" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="NDC" />
</head>`;

let html = fs.readFileSync(distIndex, 'utf8');

if (html.includes('rel="manifest"')) {
  console.log('inject-pwa-head: balises déjà présentes, rien à faire.');
} else {
  html = html.replace('</head>', BALISES);
  fs.writeFileSync(distIndex, html);
  console.log('inject-pwa-head: balises PWA ajoutées à dist/index.html');
}
