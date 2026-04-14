const CACHE_PREFIX = "validator-";

async function getVersion(){
    try{
        let res = await fetch("/version.txt?ts=" + Date.now());
        let v = await res.text();
        return v.trim();
    }catch(e){
        return "v1"; // fallback
    }
}

/* INSTALL */
self.addEventListener("install", event => {

    event.waitUntil(
        (async ()=>{
            let version = await getVersion();
            let CACHE_NAME = CACHE_PREFIX + version;

            let cache = await caches.open(CACHE_NAME);

            await cache.addAll([
                "/",
                "/index.html",
                "/manifest.json",
                "/version.txt",
                "/xlsx.full.min.js",
                "/jszip.min.js"
            ]);

            self.skipWaiting();
        })()
    );
});

/* ACTIVATE — CLEAN OLD CACHE */
self.addEventListener("activate", event => {

    event.waitUntil(
        (async ()=>{
            let version = await getVersion();
            let currentCache = CACHE_PREFIX + version;

            let keys = await caches.keys();

            await Promise.all(
                keys.map(k=>{
                    if(k.startsWith(CACHE_PREFIX) && k !== currentCache){
                        return caches.delete(k);
                    }
                })
            );

            self.clients.claim();
        })()
    );
});

/* FETCH */
self.addEventListener("fetch", event => {

    event.respondWith(
        caches.match(event.request).then(res=>{
            return res || fetch(event.request);
        })
    );
});
