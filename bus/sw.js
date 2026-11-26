const V='bt-v1';
const CORE=['./','index.html','style.css','app.js','data.js','manifest.webmanifest','lib/leaflet.js','lib/leaflet.css','lib/images/marker-icon.png','lib/images/layers.png','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x.startsWith('bt-')).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(u.origin===location.origin){ // app shell: network first, cache fallback
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./'))));
  }else{ // map tiles: cache as seen, fall back offline
    e.respondWith(caches.open('bt-tiles').then(c=>c.match(e.request).then(h=>h||fetch(e.request).then(r=>{if(r.ok&&c)c.put(e.request,r.clone());return r}).catch(()=>h))));
  }
});
