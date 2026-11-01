# 합격사(合格寺) · 삼성 합격 기원 도량

삼성그룹 지원자들의 최종 합격을 기원하는 온라인 기도처 (비공식 패러디 사이트)

## 구성
- `index.html` — **3D 법당** (메인). 내 캐릭터를 움직여 법당에 들어가 방석 위에서 절을 올립니다.
- `classic.html` — 예전 2D 버전
- `worker/` — 모든 방문자가 함께 쓰는 공유 서버 (선택)

## 3D 법당에서 할 수 있는 것
- 진입로 → 일주문(合格寺) → 앞마당 → 법당(最終合格殿)으로 걸어가기
- 법당 안 금동상 5분: 가운데 이재용 회장(가장 크게), 양옆 계열사 대표 4인
- 동상 앞 파란 **방석에 서기 → 절하기**(합장 → 무릎 꿇기 → 엎드려 큰절 동작), 합장, 염주 돌리기, 염불 듣기
- 108배 채우면 합격 부적, 앞마당 **향로에 향 피우기**(향과 연기가 쌓임)
- 왼쪽 게시대에 **소원지 걸기**(3D 게시대에 종이가 늘어남), 오른쪽 함에서 **합격운 뽑기**
- 효과음(목탁·풍경·염주), 공유 버튼

## 조작법
| PC | 모바일 | 동작 |
|---|---|---|
| W A S D / 방향키 | 왼쪽 아래 조이스틱 | 걷기 |
| Shift | 조이스틱 끝까지 | 달리기 |
| 마우스 드래그 / 휠 | 화면 오른쪽 드래그 | 시점 회전 / 확대 |
| E | 화면의 안내 버튼 | 방석에 서기 · 향 · 소원지 · 합격운 |
| Space / R / Esc | 화면 버튼 | 절하기 / 염주 / 일어나기 |

3D 엔진(three.js)과 글꼴을 인터넷(jsDelivr)에서 불러오므로 인터넷 연결이 필요합니다.

## 수정하는 곳 (`index.html`)
| 항목 | 위치 |
|---|---|
| 대표 이름·직함 | `const DEITIES = [...]` |
| 지원 계열사 목록 | `const COMPANIES = [...]` |
| 공유 서버 주소 | `const API_BASE = ""` |
| 합격운 문구 / 염불 문구 | `const FORTUNES` / `const CHANT` |

> 대표이사 명단은 인사 발표 때마다 바뀌니 공개 전에 꼭 확인하세요.

## 1단계: 사이트 공개 (GitHub Pages, 무료)
1. GitHub 저장소 → **Settings → Pages**
2. Source: **Deploy from a branch**, Branch: `main` / `/(root)` → Save
3. 몇 분 뒤 `https://<아이디>.github.io/<저장소>/samsung-temple/` 에서 접속

이 상태에서는 절 횟수·소원이 **각 방문자 브라우저에만** 저장됩니다.

## 2단계: 모두가 함께 보는 소원 벽 (Cloudflare, 무료 요금제로 충분)
`worker/` 폴더에 서버 코드가 있습니다. 컴퓨터에 Node.js가 설치되어 있어야 합니다.

```bash
cd samsung-temple/worker
```

```bash
npx wrangler login
```

```bash
npx wrangler d1 create hapgyeoksa
```

위 명령이 출력한 `database_id` 값을 `wrangler.toml`의 `database_id`에 붙여넣은 뒤:

```bash
npx wrangler d1 execute hapgyeoksa --remote --file=schema.sql
```

```bash
npx wrangler deploy
```

배포가 끝나면 나오는 주소(예: `https://hapgyeoksa-api.xxx.workers.dev`)를
`index.html`의 `const API_BASE = "..."`에 넣고 커밋하면 공유 모드로 바뀝니다.

### 서버 안전장치
- 잘못된 대상·전형 값 거부, 글자 수 제한(소원 120자, 닉네임 12자)
- 욕설·링크 차단 (`worker/src/index.js`의 `BANNED` 목록에서 추가)
- 같은 사람(IP 해시) 10분에 소원 5개까지
- 부적절한 글 숨기기:

```bash
npx wrangler d1 execute hapgyeoksa --remote --command "UPDATE wishes SET hidden=1 WHERE id=번호"
```

- `wrangler.toml`의 `ALLOWED_ORIGIN`을 사이트 주소로 바꾸면 다른 사이트에서의 호출을 막을 수 있습니다.

## 고지
본 사이트는 취업준비생 응원을 위한 비공식 패러디·유머 사이트이며 삼성그룹 및 등장 인물과 관련이 없습니다.
