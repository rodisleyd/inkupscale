// Register service worker for offline support and PWA capabilities
export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registrado com sucesso:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Falha ao registrar Service Worker:', err);
        });
    });
  } else if ('serviceWorker' in navigator) {
    // In dev mode, register as well so install prompt & offline testing works
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA (Dev)] Service Worker registrado:', reg.scope);
        })
        .catch(() => {});
    });
  }
}
