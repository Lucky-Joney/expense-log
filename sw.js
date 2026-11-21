const CACHE='bxj-v1.1.5';
const ASSETS=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('bxj-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 if(new URL(req.url).pathname.endsWith('/version.json')){
  event.respondWith(fetch(req,{cache:'no-store'}));return;
 }
 // Keep the installed app shell stable until the user approves an update.
 if(req.mode==='navigate'){
  event.respondWith(caches.match('index.html').then(cached=>cached||fetch(req)));return;
 }
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
  if(res.ok){const copy=res.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)))}
  return res;
 })));
});
