# 합격사(合格寺) · 삼성 합격 기원 도량

삼성그룹 지원자들의 최종 합격을 기원하는 온라인 기도처 (비공식 패러디 사이트)

## 기능
- 대웅전 가운데 이재용 회장 동상(가장 크게), 양옆에 계열사 대표 4인 동상
- 🙇 **절 올리기** (스페이스바도 가능) · 목탁 효과음 · 동상별 절 횟수
- 🪔 **향 피우기** · 풍경 소리 · 향로에 향이 쌓임
- 📜 **소원지 걸기** · 지원 계열사/전형 표시 · 계열사별 필터
- 🎴 **합격운 뽑기** · 📿 **108배 챌린지** 완주 시 합격 부적
- 🔗 친구에게 공유(모바일 공유창 / 링크 복사) · 🔔 효과음 켜기/끄기

## 수정하는 곳 (`index.html`)
| 항목 | 위치 |
|---|---|
| 대표 이름·직함·사진 | `const DEITIES = [...]` (`photo`에 이미지 경로를 넣으면 금동상 대신 사진 표시) |
| 지원 계열사 목록 | `const COMPANIES = [...]` |
| 공유 서버 주소 | `const API_BASE = ""` |
| 합격운 문구 | `const FORTUNES = [...]` |

> 대표이사 명단은 인사 발표 때마다 바뀌니 공개 전에 꼭 확인하세요.
> 사진은 사용 권한이 있는 것만 넣으세요(초상권·저작권).

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
