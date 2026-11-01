// 합격사 공유 API (Cloudflare Worker + D1)
//   GET  /state    → { bows:{id:n}, incense:n, wishes:[...] }
//   POST /bow      { to }
//   POST /incense  {}
//   POST /wish     { to, company, nick, stage, text, date }

const DEITY_IDS = ["bio", "disp", "main", "ds", "dx"];
const STAGES = ["서류 전형", "GSAT", "1차 면접", "최종 면접", "건강검진", "최종 발표 대기"];
const BANNED = ["시발", "씨발", "병신", "개새", "좆", "섹스", "fuck", "http://", "https://"];
const WISH_LIMIT_PER_10MIN = 5;
const WALL_SIZE = 100;

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json; charset=utf-8" } });

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const { pathname } = new URL(request.url);
    const db = env.DB;

    try {
      if (request.method === "GET" && pathname === "/state") {
        const [counters, wishes] = await db.batch([
          db.prepare("SELECT key, n FROM counters"),
          db.prepare(
            "SELECT to_id AS \"to\", company, nick, stage, text, date FROM wishes WHERE hidden = 0 ORDER BY created_at DESC LIMIT ?"
          ).bind(WALL_SIZE),
        ]);
        const bows = {};
        let incense = 0;
        for (const { key, n } of counters.results) {
          if (key === "incense") incense = n;
          else if (key.startsWith("bow:")) bows[key.slice(4)] = n;
        }
        return json({ bows, incense, wishes: wishes.results });
      }

      if (request.method !== "POST") return json({ error: "not found" }, 404);
      const body = await request.json().catch(() => ({}));

      if (pathname === "/bow") {
        if (!DEITY_IDS.includes(body.to)) return json({ error: "잘못된 대상" }, 400);
        await bump(db, "bow:" + body.to);
        return json({ ok: true });
      }

      if (pathname === "/incense") {
        await bump(db, "incense");
        return json({ ok: true });
      }

      if (pathname === "/wish") {
        const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
        const wish = {
          to: DEITY_IDS.includes(body.to) ? body.to : "main",
          company: clean(body.company, 20) || "기타",
          nick: clean(body.nick, 12) || "익명의 취준생",
          stage: STAGES.includes(body.stage) ? body.stage : "서류 전형",
          text: clean(body.text, 120),
          date: clean(body.date, 5),
        };
        if (!wish.text) return json({ error: "소원을 적어주세요" }, 400);
        const lower = (wish.text + wish.nick).toLowerCase();
        if (BANNED.some((w) => lower.includes(w))) return json({ error: "부적절한 표현이나 링크는 올릴 수 없어요" }, 400);

        const ipHash = await sha256((request.headers.get("CF-Connecting-IP") || "unknown") + (env.SALT || "hapgyeoksa"));
        const now = Date.now();
        const recent = await db
          .prepare("SELECT COUNT(*) AS c FROM wishes WHERE ip_hash = ? AND created_at > ?")
          .bind(ipHash, now - 10 * 60 * 1000)
          .first();
        if (recent.c >= WISH_LIMIT_PER_10MIN) return json({ error: "잠시 후 다시 올려주세요 (10분에 5개까지)" }, 429);

        await db
          .prepare("INSERT INTO wishes (to_id, company, nick, stage, text, date, ip_hash, created_at) VALUES (?,?,?,?,?,?,?,?)")
          .bind(wish.to, wish.company, wish.nick, wish.stage, wish.text, wish.date, ipHash, now)
          .run();
        return json({ ok: true, wish });
      }

      return json({ error: "not found" }, 404);
    } catch (e) {
      return json({ error: "서버 오류" }, 500);
    }
  },
};

function bump(db, key) {
  return db
    .prepare("INSERT INTO counters (key, n) VALUES (?, 1) ON CONFLICT(key) DO UPDATE SET n = n + 1")
    .bind(key)
    .run();
}

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
