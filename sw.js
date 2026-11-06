// RATI Digital - funciona offline. Ao publicar uma nova versão, troque o número abaixo.
const VERSAO = "rati-beta-2";
const ARQUIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Abre do cache na hora e atualiza em segundo plano (a versão nova aparece na próxima abertura).
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const proprio = url.origin === self.location.origin;
  const fonte = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!proprio && !fonte) return;
  e.respondWith(caches.open(VERSAO).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const rede = fetch(req).then(resp => { if (resp && (resp.ok || resp.type === "opaque")) cache.put(req, resp.clone()); return resp; }).catch(() => hit);
    return hit || rede;
  }));
});
