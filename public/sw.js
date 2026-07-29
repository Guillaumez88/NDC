// Service worker artisanal : coquille applicative uniquement (JS/CSS/icônes).
// Ne met jamais en cache les réponses de l'API Supabase (données de séances),
// volontairement laissées à AsyncStorage côté application, jamais au Cache
// Storage du navigateur.
const CACHE = 'ndc-shell-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((noms) => Promise.all(noms.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
  );
  self.clients.claim();
});

function estSupabase(url) {
  return url.hostname.endsWith('.supabase.co');
}

function estAssetStatique(url) {
  return url.pathname.startsWith('/NDC/_expo/') || url.pathname.startsWith('/NDC/assets/');
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET' || estSupabase(url)) return;

  if (estAssetStatique(url)) {
    // Cache-first : les noms de fichiers sont uniques par contenu (fingerprint
    // Metro), donc jamais de risque de servir une version périmée.
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const enCache = await cache.match(event.request);
        if (enCache) return enCache;
        const reponse = await fetch(event.request);
        cache.put(event.request, reponse.clone());
        return reponse;
      })
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    // Network-first avec repli cache : toujours la dernière coquille quand le
    // réseau est là, un fonctionnement minimal hors ligne sinon.
    event.respondWith(
      fetch(event.request)
        .then((reponse) => {
          caches.open(CACHE).then((cache) => cache.put(event.request, reponse.clone()));
          return reponse;
        })
        .catch(() => caches.match(event.request).then((r) => r || caches.match('/NDC/index.html')))
    );
  }
});
