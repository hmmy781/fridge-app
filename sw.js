// 냉장고 털기: 한 번 열면 인터넷 없이도 바로 열려요. 새 버전은 뒤에서 받아두고 알려줘요.
const V="8f2a11ed88";
const SHELL="fridge-shell-"+V, FONTS="fridge-fonts";
const CORE=["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "favicon-32.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys()){if(k!==SHELL&&k!==FONTS)await caches.delete(k)}
  await self.clients.claim();
  for(const c of await self.clients.matchAll({type:"window"}))c.postMessage({type:"sw-ready",v:V});
})())});
const OFFLINE='<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><p style="font:16px system-ui;padding:32px 20px;color:#16201B">인터넷에 연결한 뒤 다시 열어주세요.</p>';
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // 화면: 저장해둔 걸 바로 보여줘요 (새 버전은 sw.js가 바뀌면 따로 받아요)
    if(req.mode==="navigate"){
      e.respondWith(caches.open(SHELL).then(c=>c.match("index.html")).then(hit=>hit||fetch(req)).catch(()=>new Response(OFFLINE,{headers:{"Content-Type":"text/html; charset=utf-8"}})));
      return;
    }
    e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req)));
    return;
  }
  // 글꼴: 한 번 받으면 계속 써요
  if(url.hostname==="fonts.googleapis.com"||url.hostname==="fonts.gstatic.com"){
    e.respondWith(caches.open(FONTS).then(c=>c.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==="opaque")c.put(req,r.clone());return r}))));
  }
});
