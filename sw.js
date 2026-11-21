const CACHE='bxj-v1.1.8';
const ASSETS=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{
 e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('bxj-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
 const req=e.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 if(new URL(req.url).pathname.endsWith('/version.json')){
  e.respondWith(fetch(req,{cache:'no-store'}));return;
 }
 // Prefer the actual published HTML, never return an obsolete cached app on a normal online launch.
 if(req.mode==='navigate'){
  e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{
   if(r.ok){const cp=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put('index.html',cp)))}
   return r;
  }).catch(()=>caches.open(CACHE).then(c=>c.match('index.html')).then(c=>c||Response.error())));
  return;
 }
 e.respondWith(caches.open(CACHE).then(c=>c.match(req)).then(hit=>hit||fetch(req).then(r=>{
  if(r.ok){const cp=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(req,cp)))}
  return r;
 })));
});
