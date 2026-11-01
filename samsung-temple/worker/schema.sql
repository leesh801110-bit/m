-- 합격사 공유 데이터 (Cloudflare D1)
CREATE TABLE IF NOT EXISTS counters (
  key TEXT PRIMARY KEY,          -- "bow:main", "bow:bio", ..., "incense"
  n   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS wishes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  to_id      TEXT NOT NULL,
  company    TEXT NOT NULL,
  nick       TEXT NOT NULL,
  stage      TEXT NOT NULL,
  text       TEXT NOT NULL,
  date       TEXT NOT NULL,
  ip_hash    TEXT NOT NULL,
  hidden     INTEGER NOT NULL DEFAULT 0,   -- 부적절한 글은 1 로 바꿔 숨김
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_wishes_created ON wishes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishes_ip ON wishes(ip_hash, created_at);
