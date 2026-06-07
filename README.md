# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

---

# 놀쿨 위성 운영 가이드 (1~5단계 완료)

## 빌드 게이트 (상시 자동, `npm run build`에 내장)
`scripts/gate-darkpatterns.mjs` — 누적 회귀 차단:
- 다크패턴 0(FOMO·가짜 리뷰수·조회수·투표·후기·대기열·AutoplayNext 카운트다운)
- 본문 16px · 터치타깃 ≥44px · 놀쿨 직결 보존
- SSR 본문(#root에 본문/FAQ/놀쿨 href 실재) · meta 120~160 · FAQPage · Organization sameAs
- og 1200×1200 · og ≥20KB(두부 방지) · 금지어 0 · dead-end 0 · orphan 0
- 실 JS 렌더 검사: `BASE=http://localhost:PORT npm run gate`

## OG 이미지 재생성 (한글 path 렌더, 폰트 의존 0)
`npm run gen:og` — `scripts/fonts/Pretendard-*.otf` + opentype.js로 한글을 벡터 path 변환 →
어느 빌드머신에서도 두부 0. 1200×1200. 결과(public/og/*.jpg)는 커밋되어 CF가 그대로 서빙
(og 생성은 빌드에 포함하지 않음 — 데이터 변경 후 수동 1회 실행 + 커밋).

## 오토파일럿 (Cloudflare Worker — `automation/`)
매일 09:00 KST 라이브 감시 → 문제 시 [WOMAN-] 태그로 theassetsquare@gmail.com 알림.
안전 자동수정만(IndexNow 핑 · Deploy Hook 재배포). **콘텐츠/결제/보안 자동수정 절대 안 함**.
- `automation/sites.json` — 감시 대상(형제 사이트도 배열에 추가하면 공유 감시)
- `automation/worker.js` — cron + 수동 `/run?key=` 점검
- `automation/wrangler.toml` — cron(0 0 * * *) · KV · secrets 참조

### ★ 사장님 1회 설정 (보안상 불가피한 최소 수동)
설정 전까지 **코드는 완비, 오토파일럿은 미가동** 상태입니다.

1. **매 배포**: VSCode에서 `git push` (CF 자동 배포)
2. **★ GitHub 토큰 재발급**: 대화 중 노출된 토큰(`gho_...`) → GitHub Settings → Developer settings에서 rotate
3. **wrangler login** (1회): `npx wrangler login`
4. **KV 생성**: `npx wrangler kv namespace create AUTOPILOT_KV` → 출력된 id를 `automation/wrangler.toml`의 `PLACEHOLDER_KV_ID`에 붙여넣기
5. **secrets 등록** (`automation/` 에서 `npx wrangler secret put <NAME>`):
   - `RESEND_API_KEY` (Resend, 인증 도메인 발신) · `ALERT_FROM` (예: autopilot@도메인)
   - `WOMAN_DEPLOY_HOOK` (CF Pages → Settings → Deploy hooks URL)
   - `WOMAN_INDEXNOW_KEY` (임의 키 문자열 + `public/<key>.txt`도 같은 값으로 생성·커밋)
   - (선택) `PSI_KEY` (PageSpeed API → CWV 측정) · `GSC_SA_JSON` (GSC 서비스계정) · `RUN_KEY`
6. **배포**: `automation/` 에서 `npx wrangler deploy`

### 정직한 한계
- **PSI 키 없으면 CWV(LCP/INP/CLS) 미측정** 지속 · **GSC 키 없으면 실색인/순위 미측정** 지속.
- **og는 브랜드 카드(한글 정상)** — 실사진은 광고주 제공 시 `public/og/<id>.jpg` 교체.
- 실 색인·순위 시점은 구글 영역(권위·시간) — 코드는 상위노출 신호 100점까지.
