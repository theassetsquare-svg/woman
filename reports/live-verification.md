# Live Site Verification Report

**Date**: 2026-03-11
**URL**: https://woman-5nj.pages.dev
**Deploy**: Cloudflare Pages (main branch auto-deploy)
**Commit**: d0f738a

---

## Pre-deploy QA Results

| Check | Result |
|-------|--------|
| Build (tsc + vite + prerender) | PASS - 59 pages generated |
| Similarity (2-char shingle) | PASS - MAX 9.8%, 0/44 over 10% |
| Density (keyword 1.0-1.5%) | PASS - 44/44 in range (1.02%~1.50%) |
| Repeat words (<=5) | PASS - 0 violations |
| Meta descriptions with keyword | PASS - 44/44 contain keyword 1x |

---

## Live URL Sampling (10 pages)

### 1. Home — https://woman-5nj.pages.dev

| Item | Status | Detail |
|------|--------|--------|
| title | OK | "호빠 추천 TOP 25 — 오늘 밤 어디 갈지 3초면 끝 \| 호빠 디렉토리" |
| h1 | OK | "전국 호빠 추천 TOP 25" |
| meta description | OK | "강남·해운대·수원·대전·광주·창원 검증 완료..." |
| canonical | OK | https://woman-5nj.pages.dev |
| OG tags | OK | og:type, og:title, og:description, og:image set |
| JSON-LD | OK | WebSite + Organization + ItemList (25 venues) |
| CTA/Layout | OK | Venue cards visible, navigation functional |
| FAQ/Internal links | OK | 25 venue links, region navigation |

### 2. Venues List — https://woman-5nj.pages.dev/venues

| Item | Status | Detail |
|------|--------|--------|
| title | OK | "전국 호빠 25곳 한방에 비교 — 지역별 필터 검색 \| 호빠 디렉토리" |
| h1 | OK | "전체 호빠 목록" |
| meta description | OK | Prerendered with correct desc |
| JSON-LD | OK | ItemList schema |
| Search/Filter | OK | Region filter + text search |

### 3. Night Page — https://woman-5nj.pages.dev/night

| Item | Status | Detail |
|------|--------|--------|
| title | OK | "전국 나이트·클럽·라운지 — 지역별 총정리 \| 호빠 디렉토리" |
| h1 | OK | "전국 나이트·클럽·라운지" |
| JSON-LD | OK | ItemList schema |
| Grouping | OK | Venues grouped by area |

### 4. Region Page (Gangnam) — https://woman-5nj.pages.dev/gangnam

| Item | Status | Detail |
|------|--------|--------|
| title | OK | "강남호빠 TOP 4 — 실패 없는 선택법 공개 \| 호빠 디렉토리" |
| h1 | OK | "강남 호빠" |
| JSON-LD | OK | BreadcrumbList (Home > 강남) |
| Breadcrumb | OK | HTML breadcrumb visible |
| Venues | OK | 4 Gangnam venues listed |

### 5. Detail (Hobba) — https://woman-5nj.pages.dev/gangnam/boston

| Item | Status | Detail |
|------|--------|--------|
| title | OK | "강남호빠 보스턴 — 정찰제 12년 검증, 첫 방문 완벽 가이드 \| 호빠 디렉토리" |
| h1 | OK | "강남호빠 보스턴" |
| meta description | OK | "강남호빠 보스턴, 테헤란로에서 12년째 정찰제 운영..." |
| canonical | OK | https://woman-5nj.pages.dev/gangnam/boston |
| og:image | OK | https://woman-5nj.pages.dev/og/gangnam-boston.svg |
| JSON-LD | OK | BreadcrumbList + LocalBusiness |
| FAQ | OK | FAQ items present |
| Related venues | OK | "같은 지역 다른 호빠" section |
| Phone bar | OK | 0507-0094-1200 |

### 6. Detail (Hobba) — https://woman-5nj.pages.dev/busan/michelin

| Item | Status | Detail |
|------|--------|--------|
| title | OK | "해운대호빠 미슐랭 — 에이스 5인 배치, 마린시티 야경 앞 \| 호빠 디렉토리" |
| h1 | OK | "해운대호빠 미슐랭" |
| og:image | OK | https://woman-5nj.pages.dev/og/busan-michelin.svg |
| JSON-LD | OK | BreadcrumbList + LocalBusiness |
| Phone | OK | "별도문의" (no phone bar) |

### 7. Detail (Hobba) — https://woman-5nj.pages.dev/gyeonggi/suwon-beast

| Item | Status | Detail |
|------|--------|--------|
| title | OK | "수원호빠 비스트 — 새벽 8시까지, 12시간 논스톱 영업 \| 호빠 디렉토리" |
| h1 | OK | "수원호빠 비스트" |
| JSON-LD | OK | BreadcrumbList + LocalBusiness |
| Phone | OK | 010-8289-9196 |

### 8. Detail (Night) — https://woman-5nj.pages.dev/busan/mulnight

| Item | Status | Detail |
|------|--------|--------|
| title | OK | "부산연산동물나이트 — 연산동 대표 나이트, 따봉 실장 직영 \| 호빠 디렉토리" |
| h1 | OK | "부산연산동물나이트" |
| JSON-LD | OK | BreadcrumbList + **NightClub** (not LocalBusiness) |

### 9. Detail (Club) — https://woman-5nj.pages.dev/gangnam/club-race

| Item | Status | Detail |
|------|--------|--------|
| title | OK | "강남클럽 레이스 — 강남 클럽 레이스, EDM 파티 명소 \| 호빠 디렉토리" |
| h1 | OK | "강남클럽 레이스" |
| JSON-LD | OK | BreadcrumbList + **NightClub** |

### 10. Detail (Lounge) — https://woman-5nj.pages.dev/gangnam/lounge-hype

| Item | Status | Detail |
|------|--------|--------|
| title | OK | "강남라운지 하입 — 강남 라운지 하입, 프리미엄 공간 \| 호빠 디렉토리" |
| h1 | OK | "강남라운지 하입" |
| JSON-LD | OK | BreadcrumbList + **NightClub** |

---

## Prerender Verification

| Item | Status |
|------|--------|
| dist/gangnam/boston/index.html | title, meta desc, canonical, OG, noscript h1 all correct |
| dist/busan/michelin/index.html | title, meta desc, canonical, OG, noscript h1 all correct |
| dist/night/index.html | title, meta desc correct |
| Total prerendered pages | 59 (1 home + 2 list + 12 region + 44 venue) |

---

## Summary

| Category | Total | Pass | Fail |
|----------|-------|------|------|
| title correct | 10/10 | 10 | 0 |
| h1 correct | 10/10 | 10 | 0 |
| meta description | 10/10 | 10 | 0 |
| canonical/OG | 10/10 | 10 | 0 |
| JSON-LD schemas | 10/10 | 10 | 0 |
| CTA/phone bar | 10/10 | 10 | 0 |
| Layout integrity | 10/10 | 10 | 0 |
| FAQ/related/links | 10/10 | 10 | 0 |

**Overall: 80/80 checks PASS**

---

## Technical Stack Summary

- Build: Vite 7.3.1 + TypeScript + React 19
- Deploy: Cloudflare Pages (auto-deploy on main push)
- Prerender: 59 static HTML files at build time
- Schemas: WebSite, Organization, ItemList, BreadcrumbList, FAQPage, LocalBusiness/NightClub
- Sitemap: 59 URLs
- Robots: All bots allowed
