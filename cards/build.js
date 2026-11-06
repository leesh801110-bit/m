// 제약/바이오 공정 직무 정보 카드뉴스 생성기 (1080x1080 PNG)
// 사용법: node cards/build.js   → cards/out/<세트>/NN.png
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const SETS = require('./content');

// 하단 서명 문구 — 본인 계정명으로 바꿔 쓰세요.
const HANDLE = '@ 바이오 공정 실무 노트';

const FONT_DIR = path.join(__dirname, 'fonts');
const fontFace = [
  ['Regular', 400], ['Medium', 500], ['SemiBold', 600], ['Bold', 700], ['ExtraBold', 800],
].map(([n, w]) => `@font-face{font-family:P;font-weight:${w};src:url("file://${FONT_DIR}/Pretendard-${n}.woff2") format("woff2");}`).join('\n');

const CSS = `
${fontFace}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1080px}
body{background:#FF8D4D;font-family:P,sans-serif;color:#2a2a2a;position:relative;overflow:hidden;letter-spacing:-0.02em}
.back{position:absolute;left:112px;top:112px;width:900px;height:905px;background:#C6D0DA;border:2px solid #2a2a2a;transform:rotate(-1.6deg)}
.paper{position:absolute;left:90px;top:88px;width:900px;height:900px;background:#fff;border:2px solid #2a2a2a;display:flex;flex-direction:column;align-items:center;padding:38px 46px 40px}
.foot{position:absolute;right:24px;bottom:16px;color:#FFD9C2;font-size:22px;font-weight:500}
/* cover */
.cv-tag{margin-top:92px;font-size:23px;font-weight:700;padding:0 0 14px;border-bottom:2px solid #2a2a2a;width:410px;text-align:center}
.cv-sub{margin-top:22px;font-size:34px;font-weight:500}
.cv-kr{margin-top:70px;font-size:96px;font-weight:600;letter-spacing:-0.03em}
.cv-en{margin-top:18px;width:864px;min-height:160px;border:2px solid #2a2a2a;background:#FFFBF2;display:flex;align-items:center;justify-content:center;font-size:72px;font-weight:800;letter-spacing:-0.045em;text-align:center;line-height:1.05;padding:10px}
.cv-btn{margin-top:70px;width:64px;height:64px;border-radius:50%;background:#B9CDE0;display:flex;align-items:center;justify-content:center}
.cv-foot{position:absolute;bottom:34px;color:#B5B5B5;font-size:22px;font-weight:500}
/* content */
h1{font-size:62px;font-weight:800;letter-spacing:-0.04em;padding-bottom:16px;border-bottom:2px solid #2a2a2a;width:640px;text-align:center;margin-bottom:24px}
.panel{width:808px;flex:1;border:2px solid #2a2a2a;background:#FFFBF2;padding:26px 28px;display:flex;flex-direction:column;font-size:21px;line-height:1.5}
.plain{width:808px;flex:1;padding:4px 4px;display:flex;flex-direction:column;font-size:21px;line-height:1.5}
.h{font-size:25px;font-weight:700;margin-bottom:4px}
.h2{font-size:23px;font-weight:700;margin:14px 0 2px}
b{font-weight:700}
.r{color:#E8383D;font-weight:700}
.c{text-align:center}
.mt{margin-top:14px}.mt2{margin-top:24px}
.fig{display:flex;justify-content:center;margin:16px 0}
.note{border:2px solid #2a2a2a;background:#FFFBF2;padding:16px 22px;text-align:center;font-size:21px;margin-top:auto}
.note .t{color:#E8383D;font-weight:700;margin-bottom:4px}
.how{color:#E8383D;font-weight:800;font-size:52px;text-align:center;letter-spacing:-0.04em;margin-top:auto}
table{border-collapse:collapse;width:100%;font-size:19px;line-height:1.4}
th,td{border:1.5px solid #2a2a2a;padding:7px 9px;text-align:center;vertical-align:middle}
th{background:#FFE9DA;font-weight:700}
ul{padding-left:24px}li{margin:2px 0}
.small{font-size:18.5px}
.f{font-weight:700;font-size:22px;background:#fff;border:1.5px dashed #999;padding:8px 14px;margin:8px 0;text-align:center}
`;

function page(set, card, idx) {
  const inner = card.type === 'cover'
    ? `<div class="back"></div><div class="paper">
        <div class="cv-tag">제약/ 바이오 공정 직무 정보 #${set.no}</div>
        <div class="cv-sub">제약/ 바이오 취준생을 위한 실무 지식.zip</div>
        <div class="cv-kr">${card.kr}</div>
        <div class="cv-en" style="${card.enStyle || ''}">${card.en}</div>
        <div class="cv-btn"><svg width="26" height="26" viewBox="0 0 24 24"><path d="M8 3l9 9-9 9" fill="none" stroke="#fff" stroke-width="2"/></svg></div>
        <div class="cv-foot">${HANDLE}</div></div>`
    : `<div class="back"></div><div class="paper"><h1 style="${card.h1Style || ''}">${card.title}</h1>${card.body}</div><div class="foot">${HANDLE}</div>`;
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${CSS}</style></head><body>${inner}</body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const pg = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
  const only = process.argv[2];
  for (const set of SETS) {
    if (only && String(set.no) !== only) continue;
    const dir = path.join(__dirname, 'out', `${String(set.no).padStart(2, '0')}_${set.slug}`);
    fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < set.cards.length; i++) {
      await pg.setContent(page(set, set.cards[i], i), { waitUntil: 'load' });
      await pg.evaluate(() => document.fonts.ready);
      // overflow check
      const over = await pg.evaluate(() => {
        const p = document.querySelector('.paper');
        return p.scrollHeight > p.clientHeight + 1;
      });
      if (over) console.warn(`!! overflow: set ${set.no} card ${i + 1}`);
      await pg.screenshot({ path: path.join(dir, `${String(i + 1).padStart(2, '0')}.png`) });
    }
    console.log('done', dir);
  }
  await browser.close();
})();
