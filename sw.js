/* 수강생관리 폰 앱 — 앱으로 설치되게 하는 최소한의 일꾼.
   아무것도 저장(캐시)하지 않습니다. 화면을 열 때 인터넷이 끊겨 있으면 안내만 띄웁니다.
   자료는 늘 보관소에서 새로 받아오므로 옛 화면이 남는 일이 없습니다. */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function (e) {
  if (e.request.mode !== "navigate") return;          /* 화면 열기만 봅니다 — 자료 주고받기는 손대지 않음 */
  e.respondWith(fetch(e.request).catch(function () {
    return new Response(
      '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<body style="margin:0;padding:40px 22px;font:15px/1.7 sans-serif;background:#F4F7F6;color:#1F2A28">' +
      '<b>인터넷에 연결되어 있지 않습니다.</b><br><br>와이파이나 데이터를 켠 뒤 다시 열어 주세요.</body>',
      { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }));
});
